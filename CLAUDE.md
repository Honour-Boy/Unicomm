# UniComm

> Dark-themed, real-time multilingual chat. Messages are stored and streamed via
> Firebase Firestore and auto-translated to each user's preferred language.

This project follows the Engineering Bible at `@ENGINEERING_BIBLE.md`, with realtime additions.
Read `@handoff.md` for current state before starting any work.

The Bible and `@docs/*` describe the **target** standards. This project predates some of
them, so see **Project-specific overrides** below for where UniComm currently differs.

---

## Branching & PR workflow

- **Never commit directly to `main` or `staging`.** All work happens on its own branch.
- New features → `feature/<short-name>`; bug fixes → `fix/<short-name>`.
- Open a PR **targeting `staging`** (not `main`). Keep it to one logical change, small and reviewable.
- `staging` is the integration branch; once changes are verified there, `staging` is promoted to `main` (production).
- Reference the roadmap item the change addresses in the PR description.

---

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS — **JavaScript/JSX** (not TypeScript)
- **Routing:** react-router-dom (`PublicRouter` / `PrivateRouter`)
- **Client state:** Zustand (`components/Firebase/chatStore.js`, `userStore.js`)
- **Realtime + DB:** Firebase Firestore — live data via `onSnapshot` listeners
- **Auth:** Firebase Auth (client SDK) + `firebase-admin` (Admin SDK) on the backend
- **Backend:** Node.js + Express (minimal) — REST under `/api`, port `8001`
- **Translation:** external translation API (via axios); language list in `components/Common/Languages.js`
- **Presence:** `components/Firebase/usePresence.js`

---

## Commands

```bash
# Backend (from /backend) — http://localhost:8001
npm run dev          # nodemon server.js
npm start            # node server.js

# Frontend (from /frontend) — http://localhost:5173
npm run dev          # vite
npm run build
npm run lint         # eslint (max-warnings 0)
npm run preview
```

---

## Project Structure

```
unicomm/
├── frontend/                       # React + Vite + Tailwind
│   └── src/
│       ├── pages/                  # Intro, Login, Register, CreateProfile, ChatRoom, ...
│       ├── components/
│       │   ├── Chat/               # Chat, ChatList, Detail, AddUser, UserInfo
│       │   ├── Firebase/           # firebase.js, chatStore.js, userStore.js, usePresence.js
│       │   ├── Common/             # Navbar, Languages.js, Loading, Logout
│       │   └── Routers/            # PrivateRouter, PublicRouter
│       ├── context/                # AuthContext.jsx
│       └── styles/
├── backend/                        # Node + Express + firebase-admin
│   ├── server.js                   # express app, CORS → :5173, mounts /api
│   ├── routes/authRoutes.js
│   ├── controllers/authController.js
│   └── config/                     # firebaseAdmins.js (+ service-account JSON)
├── CLAUDE.md
├── handoff.md
└── docs/
```

---

## Realtime-specific rules (Firestore)

UniComm's realtime engine is **Firestore `onSnapshot`**, not Socket.IO. The Socket.IO rules
in the kit profile do **not** apply; these do:

- **Always unsubscribe.** Every `onSnapshot` registered in a `useEffect` MUST be cleaned up
  on unmount via the returned unsubscribe function. Ghost listeners and quota burn compound fast.

  ```jsx
  useEffect(() => {
    const unsub = onSnapshot(ref, (snap) => setState(snap.data()))
    return () => unsub()
  }, [chatId])
  ```

- **Firestore is the source of truth.** Clients write intents; UI reconciles from the snapshot.
- **Optimistic UI** is fine for high-success actions (see `@docs/ui-standards.md`) but must
  reconcile with the next snapshot.
- **Security rules are the real authorization layer.** Never trust the client; enforce read/write
  access in Firestore security rules, not just in components. See `@docs/backend-security.md`.
- **Translation:** each message carries its translated variants / last-translated state; translate
  on write or on read consistently — don't double-translate already-translated text.

---

## Caching exception

Live Firestore data (`onSnapshot` streams) is **not cached** — it's already live. Apply normal
caching only to REST calls and static/reference data (e.g. the language list). See `@docs/caching.md`.

---

## Mobile responsiveness

- **Approach:** mobile-first. Phones are a primary device for chat — test on a real device.
- See `@docs/mobile-responsiveness.md`.

---

## Project-specific overrides

Where UniComm currently differs from the Engineering Bible / kit defaults:

- **JavaScript, not TypeScript.** No Zod schemas today. Validate inputs manually in controllers.
- **Firebase (Firestore + Auth), not Supabase/Clerk.** No Postgres/RLS; use Firestore security rules.
- **Zustand, not React Query.** REST is light; live data is Firestore-driven.
- **No Doppler.** Config via `.env` files (see `frontend/.env.example`, `backend/.env.example`).
- **Realtime via Firestore, not Socket.IO.** `socket.io-client` lingers in deps but isn't the
  messaging transport — prefer Firestore for new realtime work.
- ⚠️ **Secret hygiene:** `backend/config/*.json` (Firebase Admin service account) and `.env`
  files must never be committed. `.gitignore` currently only lists `node_modules` — fix before
  the next commit (see handoff.md → Next Steps).

---

## References

- `@ENGINEERING_BIBLE.md` — canonical rules
- `@handoff.md` — current project state
- `@docs/ui-standards.md` — skeleton loaders, optimistic UI, tooltips
- `@docs/caching.md` — caching rules (live data is not cached)
- `@docs/backend-security.md` — auth, pagination, safe errors
- `@docs/mobile-responsiveness.md` — breakpoints, QA checklist
- `@docs/observability.md` — Sentry, PostHog, alert routing
- `@docs/agent-behavior.md` — think-before-coding, simplicity, surgical changes
- `@docs/handoff-protocol.md` — how to update handoff.md
