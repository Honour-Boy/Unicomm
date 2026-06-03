# UniComm — Deployment & Test Runbook

This is the source-of-truth, committed runbook for building, testing, and deploying
UniComm. It is written so that **any developer or AI agent with access to this repo**
can pick up deployment from a cold start. (Unlike `handoff.md`/`CLAUDE.md`, which are
gitignored, this file is tracked in git.)

## Architecture at a glance

| Piece        | Tech                          | Hosted on                                   |
|--------------|-------------------------------|---------------------------------------------|
| Frontend     | React + Vite (`frontend/`)    | **Firebase Hosting** (primary) or **Vercel** (§5b) |
| Backend      | Express, CommonJS (`backend/`)| **Render** (web service `unicomm-backend`)  |
| Database     | Firebase Firestore            | Firebase (`unicomm-2d7bc`)                  |
| Auth         | Firebase Auth                 | Firebase (`unicomm-2d7bc`)                  |
| Rules/Indexes| `firestore.rules`, `firestore.indexes.json` | Firebase (deployed via CLI)   |

CI/CD runs in **GitHub Actions** (`.github/workflows/`): tests on every PR, deploy on
push to `main`.

---

## 1. Prerequisites

- **Node 20+** and npm.
- **Firebase CLI** — `npm install -g firebase-tools`, then `firebase login`.
  (Not installed in every environment — install it before any `firebase` command.)
- Access to the Firebase project **`unicomm-2d7bc`** (Owner/Editor).
- A **Render** account connected to the GitHub repo `Honour-Boy/Unicomm`.
- The **Firebase Admin service-account JSON** (see §2).

The Firebase project is already pinned in `.firebaserc` (`default → unicomm-2d7bc`), so
CLI commands need no `--project` flag.

---

## 2. Secrets & credentials

There is **one** sensitive credential: the Firebase Admin service-account key.

**How to get it:** Firebase Console → Project settings → *Service accounts* →
*Generate new private key*. This downloads a JSON file.

It is consumed in three places:

| Where                | How it's supplied                                              |
|----------------------|----------------------------------------------------------------|
| Local backend dev    | Save the file as `backend/config/unicomm.json` (gitignored).   |
| Render (backend prod)| Paste the JSON as the `FIREBASE_SERVICE_ACCOUNT` env var.      |
| GitHub Actions       | Repo secret `FIREBASE_SERVICE_ACCOUNT` (used by the hosting deploy action and any backend trigger). |

`backend/config/firebaseAdmins.js` resolves credentials in this order:
`FIREBASE_SERVICE_ACCOUNT` (JSON string) → `GOOGLE_APPLICATION_CREDENTIALS` (file path)
→ local `backend/config/unicomm.json`. The same code therefore runs everywhere with no edits.

> ⚠️ Never commit the JSON. `.gitignore` already blocks `backend/config/unicomm.json`,
> `*firebase-adminsdk*.json`, and `serviceAccount*.json`.

### GitHub repo secrets (Settings → Secrets and variables → Actions)

| Secret                     | Used by            | Value                                                  |
|----------------------------|--------------------|--------------------------------------------------------|
| `VITE_API_KEY`             | frontend build     | Firebase web API key                                   |
| `VITE_API_URL`             | frontend build     | Backend URL, e.g. `https://unicomm-backend.onrender.com` |
| `FIREBASE_SERVICE_ACCOUNT` | hosting deploy     | Full service-account JSON                              |
| `RENDER_DEPLOY_HOOK_URL`   | backend deploy (optional) | Render deploy-hook URL (Render → service → Settings → Deploy Hook) |

---

## 3. Running tests

From the repo root:

```bash
npm install                 # root test harness (jest, babel, testing-library, jsdom)
npm install --prefix frontend
npm install --prefix backend
npm test                    # both Jest projects: backend (node) + frontend (jsdom)

npm run test:backend        # backend only
npm run test:frontend       # frontend only
npm run lint --prefix frontend   # eslint (currently advisory in CI)
```

CI runs exactly this on every PR and on pushes to `main`/`staging`
(`.github/workflows/ci.yml`).

---

## 4. Environment variables

**Frontend** (`frontend/.env.local`, gitignored — template in `frontend/.env.example`):

```
VITE_API_KEY=<firebase web api key>
VITE_API_URL=http://localhost:8001        # prod: the Render URL
```

**Backend** (`backend/.env`, gitignored — template in `backend/.env.example`):

```
PORT=8001
CORS_ORIGIN=http://localhost:5173         # prod: https://unicomm-2d7bc.web.app,...
FIREBASE_SERVICE_ACCOUNT=                 # prod only; locally use config/unicomm.json
```

`CORS_ORIGIN` accepts a comma-separated list. In production it must include the deployed
Firebase Hosting origin(s): `https://unicomm-2d7bc.web.app,https://unicomm-2d7bc.firebaseapp.com`.

---

## 5. Deploy — frontend (Firebase Hosting)

Hosting is configured in `firebase.json` (`public: frontend/dist`, SPA rewrite to
`/index.html`).

**Manual (local):**

```bash
# ensure frontend/.env.local has VITE_API_KEY + VITE_API_URL set
npm run deploy:hosting       # builds frontend then `firebase deploy --only hosting`
```

**Automated:** push/merge to `main` → `.github/workflows/deploy.yml` builds and deploys
via the `FirebaseExtended/action-hosting-deploy` action.

Live URL: `https://unicomm-2d7bc.web.app`.

---

## 5b. Deploy — frontend (Vercel, alternative)

The frontend can also be hosted on Vercel; `frontend/vercel.json` configures the SPA
(Vite framework preset, `dist` output, rewrite all routes to `/index.html`).

**One-time setup (Vercel dashboard → New Project → import `Honour-Boy/Unicomm`):**

1. Set **Root Directory** to `frontend` (the app is in a subfolder; Vercel then reads
   `frontend/vercel.json`).
2. Build/output are auto-detected (`npm run build` → `dist`).
3. Add **Environment Variables** (Production + Preview): `VITE_API_KEY`, `VITE_API_URL`.
4. Deploy. Pushes to `main` auto-deploy; PRs get preview URLs automatically.

**CLI alternative:** `npm i -g vercel`, then from `frontend/` run `vercel` (preview) or
`vercel --prod`.

> If you use Vercel, add its origin (e.g. `https://<project>.vercel.app`) to the backend
> `CORS_ORIGIN` list. Pick **one** primary host to avoid auth-domain/CORS confusion;
> Vercel and Firebase Hosting can coexist but each origin must be allow-listed.

---

## 6. Deploy — Firestore rules & indexes

Security rules are the source of truth and **must** be deployed when the data model changes.

```bash
npm run deploy:rules                       # firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes   # when indexes change
# or everything frontend-side at once:
npm run deploy                             # build + hosting + rules + indexes
```

> First-time / outstanding action: the participant-scoped rules are committed but may not
> be deployed yet, and pre-existing `chats/{id}` docs need a `participantIds: [uidA, uidB]`
> backfill or they become inaccessible once rules are live. See `handoff.md`.

---

## 7. Deploy — backend (Render)

**One-time setup:**

1. Render dashboard → **New → Blueprint** → select this repo. Render reads `render.yaml`
   and creates the `unicomm-backend` web service (root dir `backend`, `npm install` /
   `npm start`, health check `/api/health`).
2. Set the two secret env vars on the service:
   - `FIREBASE_SERVICE_ACCOUNT` = the full service-account JSON (single line).
   - `CORS_ORIGIN` = `https://unicomm-2d7bc.web.app,https://unicomm-2d7bc.firebaseapp.com`
3. (Optional) Copy the service's **Deploy Hook** URL into the GitHub secret
   `RENDER_DEPLOY_HOOK_URL` so the deploy workflow can trigger it explicitly.

**Ongoing:** pushes to `main` auto-deploy (`autoDeploy: true`). Verify with:

```bash
curl https://unicomm-backend.onrender.com/api/health   # -> {"status":"ok"}
```

After the backend URL is known, set GitHub secret `VITE_API_URL` to it and redeploy the
frontend so login points at the live backend.

> Railway is an equivalent alternative: create a service from the repo, set root dir to
> `backend`, start command `npm start`, and the same env vars. `render.yaml` is Render-specific.

---

## 8. First full deploy — ordered checklist

1. `firebase login` and confirm access to `unicomm-2d7bc`.
2. Deploy Firestore rules + indexes (`npm run deploy:rules`, `firebase deploy --only firestore:indexes`). Backfill `participantIds` on legacy chat docs.
3. Stand up the Render backend (§7). Note its URL; set `CORS_ORIGIN` + `FIREBASE_SERVICE_ACCOUNT`. Confirm `/api/health`.
4. Add GitHub secrets: `VITE_API_KEY`, `VITE_API_URL` (= Render URL), `FIREBASE_SERVICE_ACCOUNT`, optional `RENDER_DEPLOY_HOOK_URL`.
5. Deploy the frontend (`npm run deploy:hosting` or push to `main`).
6. Smoke test: open the live URL, sign in (email + Google), send a chat message, confirm translation + presence.

---

## 9. Rollback

- **Frontend:** Firebase Console → Hosting → *Release history* → roll back to a prior release. (Or `firebase hosting:rollback`.)
- **Backend:** Render dashboard → service → *Events* / *Rollback* to a previous deploy.
- **Rules:** re-deploy the previous `firestore.rules` from an earlier git commit.

---

## 10. Branch & release flow

Feature/fix branch → `staging` → `main`, via merge-commit PRs. CI gates every PR; merging
to `main` triggers the deploy workflow. See `handoff.md` for the latest project state.
