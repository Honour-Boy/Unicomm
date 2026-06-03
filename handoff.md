# Handoff

_Last updated: 2026-06-03_

## Goal

UniComm is a real-time, multilingual chat app: users register, set a preferred language,
and exchange messages that are automatically translated into each recipient's language.
Frontend is React + Vite + Tailwind; data and realtime messaging run on Firebase Firestore;
a thin Express + firebase-admin backend handles auth-related REST under `/api`.

## Current State

- Auth, registration, profile creation, and the chat UI exist and are wired to Firestore.
- Realtime messaging works via Firestore `onSnapshot` listeners across the Chat components.
- Translation is integrated into the chat flow (last-translated message + sender handling).
- Backend is minimal: `server.js` mounts `authRoutes` at `/api`, CORS allows `:5173`, port `8001`.

## Files in Flight

[Nothing actively in flux as of this handoff.]

## Recent Changes

- 2026-06-03 — Set up the Claude Engineering Kit (CLAUDE.md, ENGINEERING_BIBLE.md, docs/,
  .env.example files) and tailored CLAUDE.md to the real Firebase/React stack.
- Registration page refactored with improved validation and UI components.
- Chat components updated to handle the last translated message and sender ID.
- Translation functionality and related routes restructured.

## Failed / Not Working

- The original plan to use a self-finetuned LLM for translation was dropped (model issues);
  translation now uses an external translation API. → keep the external-API approach.

## Next Steps

1. **Secret hygiene (do first):** add `.env`, `*.env`, and `backend/config/*.json`
   (the Firebase Admin service account) to `.gitignore`; if the service-account JSON was ever
   committed, rotate the key and purge it from git history.
2. Fill in `frontend/.env.example` and `backend/.env.example` with the real (non-secret) keys.
3. Confirm whether `socket.io-client` is still used anywhere meaningful (only `CreateProfile.jsx`
   references it) — remove the dep if it's dead.
4. Add a real backend test script (currently `npm test` just errors) and frontend tests.
