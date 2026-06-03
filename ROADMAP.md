# UniComm Roadmap

Near-term goal: **get the core chat working end-to-end (MVP)** before production polish.

Stack recap: React + Vite + Tailwind frontend, Firebase Firestore (`onSnapshot` realtime)
+ Firebase Auth, a thin Express + `firebase-admin` backend, and automatic message translation.

Priorities are ordered P0 (blocks the app from working / reliability) → P3 (scale & polish).
File references point at where the work lands.

---

## P0 — Make it actually work & not lose data

- [ ] **Add Firestore security rules** — there are no `firestore.rules` / `firebase.json` in the
  repo. In locked mode every read/write is denied (app appears dead); in test mode it's wide open
  and auto-expires. Add participant-scoped rules (users readable; write-own; `chats`/`userchats`
  limited to their participants) plus `firebase.json` and any required composite indexes.
- [ ] **Stop hard-coding the backend URL** — `Login.jsx` calls `http://localhost:8001/api/signin`
  (2×). Login breaks in any deployed environment and whenever the backend is down. Move to a
  `VITE_API_URL` env var, and re-evaluate whether the custom-token round-trip is needed at all
  (Firestore auth uses the Firebase session, not that token).
- [ ] **Don't drop messages on translation failure** — in `Chat.jsx` the Firestore `updateDoc`
  sits inside the same `try` as the LibreTranslate call (`translate.flossboxin.org.in`). If
  translation fails, the message is never sent. Persist the original text first; treat translation
  as best-effort with fallback to the original.

## P1 — Correctness & UX

- [ ] **Harden ChatList for new/empty users** — `ChatList.jsx` does `res.data() || []` then
  `.chats.map`, and reads `messages[messages.length-1]` / `b.updatedAt.seconds`, which throw when
  fields are missing or a server timestamp is still pending. Guard the undefined cases.
- [ ] **Fix the 15-minute forced logout & auth desync** — `AuthContext.jsx` deletes the
  localStorage token after 15 minutes regardless of activity, while the Firebase session lives on
  independently. Drive routing off `onAuthStateChanged` and realign (or drop) the token.
- [ ] **Correct the translation label** — `Chat.jsx` shows "translated from {sourceLabel}" using
  the *viewer's* language, not the *sender's*. Persist the source language per message.

## P2 — Cleanup & hardening

- [ ] Remove dead code / unused deps: `AddUser.jsx` is fully commented out; `socket.io-client`
  appears unused; `CreateProfile.jsx` leaves `loading=true` on the duplicate-username return.
- [ ] Fix concurrency: `userchats` updates are read-modify-write (`Chat.jsx`, `ChatList.handleAdd`)
  and can lose updates under concurrent sends; React message keys collide when `createdAt.seconds`
  match.

## P3 — Scale & polish (post-MVP)

- [ ] Move messages out of the single growing array in `chats/{id}` (hits the 1 MiB document cap
  and re-downloads the whole history per snapshot) into a `messages` subcollection with pagination.
- [ ] Add tests — backend `npm test` currently just errors; add register/login and send/translate
  happy-path coverage.
- [ ] Translation reliability — configurable provider + API key, skip when source == target, cache
  results.
- [ ] Deployment — Firebase Hosting (frontend) + a host for the Express backend; wire env vars;
  lock CORS to the real origin.

---

_Engineering standards and Claude Code context live locally (git-ignored) via the engineering
kit and the `ui-ux-pro-max` skill; this roadmap is the product-facing plan and is tracked._
