// Integration test for the userchats Cloud Function triggers, run against the
// Firebase Emulator Suite (firestore + functions). Launch it via:
//
//   npm test            # from functions/  (see package.json)
//
// which wraps it in `firebase emulators:exec --only firestore,functions`.
// Requires JDK 21+ (the Firestore emulator's current minimum) and
// `npm install` in functions/. The
// functions emulator loads ../index.js and reacts to writes the Admin SDK makes
// against the firestore emulator (emulators:exec sets FIRESTORE_EMULATOR_HOST +
// GCLOUD_PROJECT for this process, so admin auto-connects to the emulator).
// Triggers fire asynchronously, so each assertion polls for the expected state.
//
// No mocks: this exercises the real trigger code end-to-end against a real
// (local) Firestore.

const assert = require("assert");
const admin = require("firebase-admin");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "demo-unicomm";
admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();

const A = "userA";
const B = "userB";
const CHAT = "chatTriggerTest";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const itemRef = (uid) => db.doc(`userchats/${uid}/items/${CHAT}`);
const getItem = async (uid) => (await itemRef(uid).get()).data();

// Poll `fn` until it returns a truthy value or we time out.
async function waitFor(label, fn, { timeout = 20000, interval = 300 } = {}) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeout) {
    try {
      const r = await fn();
      if (r) return r;
      last = r;
    } catch (e) {
      last = e.message;
    }
    await sleep(interval);
  }
  throw new Error(`Timed out waiting for: ${label} (last seen: ${JSON.stringify(last)})`);
}

async function run() {
  // 1) onChatCreated seeds both participants' index entries (cross receiverIds).
  await db.doc(`chats/${CHAT}`).set({
    participantIds: [A, B],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const aSeed = await waitFor("A item seeded", async () => {
    const d = await getItem(A);
    return d && d.receiverId === B ? d : null;
  });
  const bSeed = await waitFor("B item seeded", async () => {
    const d = await getItem(B);
    return d && d.receiverId === A ? d : null;
  });
  assert.strictEqual(aSeed.chatId, CHAT, "A item.chatId");
  assert.strictEqual(aSeed.receiverId, B, "A item.receiverId should be B");
  assert.strictEqual(bSeed.receiverId, A, "B item.receiverId should be A");
  console.log("✓ onChatCreated seeds both participants' index entries");

  // 2) onMessageWritten (create) refreshes both previews from the new message.
  const msgRef = db.collection(`chats/${CHAT}/messages`).doc("m1");
  await msgRef.set({
    senderId: A,
    text: "hello",
    translatedText: "hello", // persist-first: mirrors original until patched
    sourceLang: "en",
    targetLang: "fr",
    createdAt: admin.firestore.Timestamp.now(),
  });

  await waitFor("previews reflect 'hello'", async () => {
    const [a, b] = [await getItem(A), await getItem(B)];
    return a?.lastMessage === "hello" && b?.lastMessage === "hello" ? true : null;
  });
  const afterCreate = await getItem(A);
  assert.strictEqual(afterCreate.lastSenderId, A, "lastSenderId should be A");
  assert.strictEqual(
    afterCreate.lastTranslatedMessage,
    "hello",
    "translated mirrors original before the patch"
  );
  console.log("✓ onMessageWritten (create) refreshes both previews");

  // 3) onMessageWritten (update) picks up the best-effort translation patch.
  await msgRef.update({ translatedText: "bonjour" });
  await waitFor("previews reflect 'bonjour'", async () => {
    const [a, b] = [await getItem(A), await getItem(B)];
    return a?.lastTranslatedMessage === "bonjour" &&
      b?.lastTranslatedMessage === "bonjour"
      ? true
      : null;
  });
  console.log("✓ onMessageWritten (update) applies the translation patch");

  // 4) The preview always follows the chat's LATEST message (so a late patch on
  //    an older message can't clobber a newer one).
  await db.collection(`chats/${CHAT}/messages`).doc("m2").set({
    senderId: B,
    text: "salut",
    translatedText: "hi",
    sourceLang: "fr",
    targetLang: "en",
    createdAt: admin.firestore.Timestamp.now(),
  });
  await waitFor("previews reflect the newest message", async () => {
    const a = await getItem(A);
    return a?.lastMessage === "salut" && a?.lastSenderId === B ? true : null;
  });
  console.log("✓ preview follows the chat's latest message");

  console.log("\nAll trigger tests passed.");
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("\n✗ TRIGGER TEST FAILED:", e.message);
    process.exit(1);
  });
