import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { db } from "@/lib/firebase";

const TRANSLATE_URL = "https://translate.flossboxin.org.in/translate";

// Translate the message, persist it to the chat doc, then update both users'
// userchats lastMessage.
//
// NOTE (ROADMAP P0 #3): translation and persistence still share one flow, so a
// translation failure throws before the message is saved. This is a faithful
// extraction of the previous in-component logic — the data-loss fix (persist
// original first, translate best-effort) is tracked separately.
export async function sendChatMessage({
  chatId,
  currentUser,
  receiver,
  text,
  sourceLang,
  targetLang,
}) {
  let translatedText = text;

  const response = await axios.post(
    TRANSLATE_URL,
    { q: text, source: sourceLang || "en", target: targetLang || "en" },
    { headers: { "Content-Type": "application/json" } }
  );
  if (response.status === 200) {
    translatedText = response.data.translatedText;
  }

  await updateDoc(doc(db, "chats", chatId), {
    messages: arrayUnion({
      senderId: currentUser.id,
      text,
      translatedText,
      createdAt: new Date(),
    }),
  });

  const userIDs = [currentUser.id, receiver.id];
  userIDs.forEach(async (id) => {
    const userChatsRef = doc(db, "userchats", id);
    const snap = await getDoc(userChatsRef);
    if (snap.exists()) {
      const data = snap.data();
      const idx = data.chats.findIndex((c) => c.chatId === chatId);
      if (idx !== -1) {
        data.chats[idx].lastMessage = text;
        data.chats[idx].lastTranslatedMessage = translatedText;
        data.chats[idx].updatedAt = Date.now();
        await updateDoc(userChatsRef, { chats: data.chats });
      }
    }
  });
}
