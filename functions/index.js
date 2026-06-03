// UniComm Cloud Functions — server-side maintenance of the per-user chat index.
//
// WHY THIS EXISTS: a message sender needs to update the *recipient's* chat
// preview (last message, ordering). Firestore security rules can't express
// "user A may write user B's index entry, but only that entry, only these
// fields", so historically the `userchats` write rule had to be left open to any
// signed-in user. These triggers move that cross-user write to the Admin SDK
// (which bypasses rules), so the client never writes `userchats` and the rule is
// locked to `write: if false` (see firebase/firestore.rules).
//
// DATA MODEL: one doc per conversation, per user —
//   userchats/{userId}/items/{chatId} = {
//     chatId, receiverId,            // receiverId = the *other* participant
//     lastMessage, lastTranslatedMessage, lastSenderId, lastUpdated,
//     updatedAt,                     // server write time — drives list ordering
//     createdAt,                     // seeded once on chat creation
//   }
// (Replaced the old `userchats/{userId}.chats[]` array, whose single-element
// patches needed a read-modify-write transaction and could race. One doc per
// chat = a plain idempotent `set`, no transaction, no concurrency hazard.)

// Node 24+ removed the legacy `SlowBuffer`, which firebase-admin's jws/jwa chain
// still references. The deployed runtime is Node 20 (where SlowBuffer exists, so
// this is a no-op), but the local Firebase emulator runs functions under the
// host's Node — shim it so `npm test` works on newer Node. Harmless in prod.
const _buf = require("buffer");
if (!_buf.SlowBuffer) _buf.SlowBuffer = _buf.Buffer;

const {
  onDocumentCreated,
  onDocumentWritten,
} = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// Idempotent upsert of one user's index entry for one chat. `merge: true` so a
// later message-trigger write never clobbers `createdAt`/`receiverId` seeded at
// chat creation (and vice-versa, whichever trigger lands first).
function setUserChatItem(userId, chatId, patch) {
  return db
    .doc(`userchats/${userId}/items/${chatId}`)
    .set(
      { chatId, ...patch, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
}

// 1) New chat → seed both participants' index entries (replaces the seeding the
//    client used to do in ChatList.handleAdd).
exports.onChatCreated = onDocumentCreated("chats/{chatId}", async (event) => {
  const ids = event.data?.data()?.participantIds;
  if (!Array.isArray(ids) || ids.length !== 2) return;
  const [a, b] = ids;
  const { chatId } = event.params;
  await Promise.all([
    setUserChatItem(a, chatId, { receiverId: b, createdAt: FieldValue.serverTimestamp() }),
    setUserChatItem(b, chatId, { receiverId: a, createdAt: FieldValue.serverTimestamp() }),
  ]);
});

// 2) Message created OR its translation patched → refresh both previews from the
//    chat's LATEST message. Querying the latest (rather than trusting the
//    triggering doc) means a late translate-patch on an older message can't
//    overwrite a newer message's preview.
exports.onMessageWritten = onDocumentWritten(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    if (!event.data?.after?.exists) return; // ignore deletes (rules forbid them)
    const { chatId } = event.params;

    const ids = (await db.doc(`chats/${chatId}`).get()).data()?.participantIds;
    if (!Array.isArray(ids) || ids.length !== 2) return;

    const latestSnap = await db
      .collection(`chats/${chatId}/messages`)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    const latest = latestSnap.docs[0]?.data();
    if (!latest) return;

    const patch = {
      lastMessage: latest.text || "",
      lastTranslatedMessage: latest.translatedText || latest.text || "",
      lastSenderId: latest.senderId || null,
      lastUpdated: latest.createdAt || FieldValue.serverTimestamp(),
    };
    const [a, b] = ids;
    await Promise.all([
      setUserChatItem(a, chatId, { ...patch, receiverId: b }),
      setUserChatItem(b, chatId, { ...patch, receiverId: a }),
    ]);
  }
);
