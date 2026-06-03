# UniComm Roadmap

Vision: a minimal, functional, multilingual team chat where every user reads and works
entirely in their own language — text and voice — across 1:1 and organization/team channels.

Stack recap: React + Vite + Tailwind frontend, Firebase Firestore (`onSnapshot` realtime)
+ Firebase Auth, a thin Express + `firebase-admin` backend, and automatic message translation.

Work is grouped into phases. **Phase 1 (MVP) comes first** — the app must actually work and
stop losing data before we expand features or redesign. Items are checkboxes; file references
point at where the work lands.

---

## Phase 1 — MVP: make core chat work & not lose data

### P0 — Blockers
- [ ] **Add Firestore security rules** — there are no `firestore.rules` / `firebase.json` in the
  repo. In locked mode every read/write is denied (app appears dead); in test mode it's wide open
  and auto-expires. Add participant-scoped rules (users readable; write-own; `chats`/`userchats`
  limited to their participants) plus `firebase.json` and any required composite indexes.
- [ ] **Stop hard-coding the backend URL** — `Login.jsx` calls `http://localhost:8001/api/signin`
  (2×). Login breaks in any deployed environment and whenever the backend is down. Move to a
  `VITE_API_URL` env var, and re-evaluate whether the custom-token round-trip is needed at all
  (Firestore auth uses the Firebase session, not that token).
- [ ] **Don't drop messages on translation failure** — in `Chat.jsx` the Firestore `updateDoc`
  sits inside the same `try` as the translation call. If translation fails, the message is never
  sent. Persist the original text first; treat translation as best-effort with fallback.

### P1 — Correctness & UX
- [ ] **Harden ChatList for new/empty users** — `ChatList.jsx` does `res.data() || []` then
  `.chats.map`, and reads `messages[messages.length-1]` / `b.updatedAt.seconds`, which throw when
  fields are missing or a server timestamp is still pending. Guard the undefined cases.
- [ ] **Fix the 15-minute forced logout & auth desync** — `AuthContext.jsx` deletes the
  localStorage token after 15 minutes regardless of activity, while the Firebase session lives on
  independently. Drive routing off `onAuthStateChanged` and realign (or drop) the token.
- [ ] **Correct the translation label** — `Chat.jsx` shows "translated from {sourceLabel}" using
  the *viewer's* language, not the *sender's*. Persist the source language per message.

### P2 — Cleanup & hardening
- [ ] Remove dead code / unused deps: `AddUser.jsx` is fully commented out; `socket.io-client`
  appears unused; `CreateProfile.jsx` leaves `loading=true` on the duplicate-username return.
- [ ] Fix concurrency: `userchats` updates are read-modify-write (`Chat.jsx`, `ChatList.handleAdd`)
  and can lose updates under concurrent sends; React message keys collide when `createdAt.seconds`
  match.

---

## Phase 2 — Feature epics

- [ ] **Full profile editing** — today profiles are only set once in `CreateProfile.jsx`. Add a
  Settings/Profile screen to edit all fields (username with uniqueness check, preferred language,
  bio, DOB, gender, organization, job title) and avatar, writing back to `users/{uid}`. Changing
  language must re-flow the UI and future translations.

- [ ] **Language-first experience + full UI localization (i18n)** — let the user pick their
  language at the **landing/intro screen** (before/at sign-up), persist it, and render the **entire
  interface** in that language, not just chat messages. Introduce an i18n layer (e.g.
  `react-i18next`) with translation catalogs for every UI string, language switcher, RTL support
  where needed, and locale-aware dates/numbers. Keep this consistent with per-message translation.

- [ ] **Organization / team chat (Teams-like, minimal & functional)** — extend beyond 1:1 to
  teams/workspaces with group channels: a data model for teams + channels + memberships, group
  message threads, member management (invite/remove/roles), and channel switching. Keep it
  deliberately minimal — channels, group messages, mentions — not a full Teams clone. Cross-language
  translation must work in group context (translate each message into each member's language).

- [ ] **Voice chat with live translation** — voice messages and/or calls where speech is captured,
  transcribed (speech-to-text), translated, and delivered to the recipient in their language as
  translated captions and/or synthesized audio (text-to-speech). Prefer open-source components
  (e.g. Whisper for STT, the chosen translation engine, Piper/Coqui for TTS). Advanced — scope a
  voice-note MVP first, then real-time call translation.

---

## Phase 3 — UI/UX redesign

- [ ] **Full UI/UX redesign of every screen** (landing/intro, auth, profile, chat list, chat room,
  team/channel views) — establish a coherent design system (tokens, spacing, typography, components,
  motion), strong accessibility, and polished responsive dark theme. Drive this work with **both**
  the built-in `frontend-design` skill **and** the local `ui-ux-pro-max` skill (styles, palettes,
  font pairings, UX/accessibility rules). Redesign should land after Phase 1 so we're not polishing
  a broken flow, and should account for the new i18n/voice/team surfaces from Phase 2.

---

## Phase 4 — Platform & quality

- [ ] **Adopt a better open-source translation engine** — move off the single public LibreTranslate
  instance (`translate.flossboxin.org.in`) to a more reliable FOSS engine: self-hosted
  LibreTranslate / Argos Translate, Mozilla Bergamot (Firefox Translations, client-side), or Meta
  NLLB-200 (self-hosted). Make the provider configurable, skip translation when source == target,
  and cache results. Pick based on language coverage, quality, and hosting cost.
- [ ] **Messages subcollection + pagination** — move messages out of the single growing array in
  `chats/{id}` (hits the 1 MiB document cap and re-downloads the whole history per snapshot) into a
  `messages` subcollection with pagination.
- [ ] **Tests** — backend `npm test` currently just errors; add register/login and send/translate
  happy-path coverage, plus tests for new features.
- [ ] **Deployment** — Firebase Hosting (frontend) + a host for the Express backend; wire env vars;
  lock CORS to the real origin.

---

## Final — License & docs (do last)

- [ ] **License setup** — confirm/refresh the project license (a `LICENSE` already exists) and add
  proper attribution for any third-party / open-source components introduced (translation engine,
  STT/TTS, i18n libraries).
- [ ] **README update** — rewrite the README to reflect the redesigned, localized, team-capable app:
  features, screenshots, setup (env vars, Firebase rules, translation engine), and architecture.

---

_Engineering standards and Claude Code context live locally (git-ignored) via the engineering
kit and the `ui-ux-pro-max` skill; this roadmap is the product-facing plan and is tracked._
