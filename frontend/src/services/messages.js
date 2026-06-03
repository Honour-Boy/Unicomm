import {
  addDoc,
  collection,
  doc,
  runTransaction,
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
  //    Wrapped in a transaction so the array read-modify-write can't lose a
  //    concurrent send's update (Firestore can't patch a single array element).
  const userIDs = [currentUser.id, receiver.id];
  for (const id of userIDs) {
    const userChatsRef = doc(db, "userchats", id);
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userChatsRef);
        if (!snap.exists()) return;
        const chats = snap.data().chats || [];
        const idx = chats.findIndex((c) => c.chatId === chatId);
        if (idx === -1) return;
        chats[idx] = {
          ...chats[idx],
          lastMessage: text,
          lastTranslatedMessage: translatedText,
          updatedAt: Date.now(),
        };
        tx.update(userChatsRef, { chats });
      });
    } catch (err) {
      console.warn("Failed to update userchats preview.", err?.message || err);
    }
  }
}
