import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import axios from "axios";
import { db } from "@/lib/firebase";

const TRANSLATE_URL = "https://translate.flossboxin.org.in/translate";

// Send a chat message.
//
// Persist-first (ROADMAP P0 #3): the original text is written to the chat's
// `messages` subcollection BEFORE any translation runs, so a translation
// failure can never drop the message. Translation is a best-effort enhancement:
// on success we patch `translatedText` onto the message; on failure we keep the
// original (translatedText stays equal to text, so no misleading label shows).
// `sourceLang` is stored per message so the recipient's "translated from …"
// label reflects the *sender's* language, not the viewer's (ROADMAP P1).
export async function sendChatMessage({
  chatId,
  currentUser,
  receiver,
  text,
  sourceLang,
  targetLang,
}) {
  const src = sourceLang || "en";
  const tgt = targetLang || "en";

  // 1) Persist the original first — never blocked by translation. Until/unless
  //    translation succeeds, translatedText mirrors the original text.
  const messageRef = await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId: currentUser.id,
    text,
    translatedText: text,
    sourceLang: src,
    targetLang: tgt,
    createdAt: new Date(),
  });

  // 2) Best-effort translation. A failure here must not throw — the message is
  //    already delivered; we just fall back to the original.
  let translatedText = text;
  try {
    const response = await axios.post(
      TRANSLATE_URL,
      { q: text, source: src, target: tgt },
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.status === 200 && response.data?.translatedText) {
      translatedText = response.data.translatedText;
      await updateDoc(messageRef, { translatedText });
    }
  } catch (err) {
    // Translation is best-effort; the original is already persisted.
    console.warn(
      "Translation failed; delivered original text.",
      err?.message || err
    );
  }

  // 3) Update both users' userchats preview (best-effort, with the final text).
  const userIDs = [currentUser.id, receiver.id];
  for (const id of userIDs) {
    const userChatsRef = doc(db, "userchats", id);
    const snap = await getDoc(userChatsRef);
    if (!snap.exists()) continue;
    const data = snap.data();
    const idx = data.chats.findIndex((c) => c.chatId === chatId);
    if (idx !== -1) {
      data.chats[idx].lastMessage = text;
      data.chats[idx].lastTranslatedMessage = translatedText;
      data.chats[idx].updatedAt = Date.now();
      await updateDoc(userChatsRef, { chats: data.chats });
    }
  }
}
