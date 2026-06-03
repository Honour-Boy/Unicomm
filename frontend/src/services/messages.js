import { addDoc, collection, updateDoc } from "firebase/firestore";
import axios from "axios";
import { db } from "@/lib/firebase";
import { TRANSLATE_URL } from "@/lib/env";

// A few of the app's language codes differ from the LibreTranslate instance's
// (e.g. the app stores "zh", the instance serves "zh-Hans"). Map on the way out.
const LT_CODE = { zh: "zh-Hans", zt: "zh-Hant" };
const toLT = (code) => LT_CODE[code] || code;

// Send a chat message.
//
// Persist-first (ROADMAP P0 #3): the original text is written to the chat's
// `messages` subcollection BEFORE any translation runs, so a translation
// failure can never drop the message. Translation is a best-effort enhancement:
// on success we patch `translatedText` onto the message; on failure we keep the
// original (translatedText stays equal to text, so no misleading label shows).
// `sourceLang` is stored per message so the recipient's "translated from …"
// label reflects the *sender's* language, not the viewer's (ROADMAP P1).
// The per-recipient chat-list preview (last message + ordering) is NOT written
// here — a Cloud Function (`onMessageWritten`, functions/index.js) derives it
// from the message subcollection and maintains both users' `userchats/{uid}/
// items/{chatId}` docs server-side. That's what lets the `userchats` rules deny
// all client writes (firebase/firestore.rules).
export async function sendChatMessage({
  chatId,
  currentUser,
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
  //    already delivered; we just fall back to the original. Skipped entirely
  //    when both users share a language (saves a network round-trip + quota).
  let translatedText = text;
  if (src !== tgt) {
    try {
      const response = await axios.post(
        TRANSLATE_URL,
        { q: text, source: toLT(src), target: toLT(tgt) },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200 && response.data?.translatedText) {
        translatedText = response.data.translatedText;
        await updateDoc(messageRef, { translatedText });
      }
    } catch (err) {
      // Translation is best-effort; the original is already persisted. This also
      // covers languages the instance hasn't loaded (it 400s → we keep original).
      console.warn(
        "Translation failed; delivered original text.",
        err?.message || err
      );
    }
  }

}
