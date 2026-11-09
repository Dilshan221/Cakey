# Cakey

React frontend and Express/MongoDB backend, configured as two Vercel projects
from this repository. No repository-root deployment is needed.

## Deploy the backend first

1. Import the repository into Vercel and select **Root Directory: `backend`**.
2. Select the **Express** framework preset. Keep the build command and output
   directory unset; `backend/vercel.json` configures dependency installation.
3. Add these environment variables to the backend project:
   - `NODE_ENV=production`
   - `MONGO_URI`: your hosted MongoDB connection string, including the database
     name. A local MongoDB address will not work on Vercel. Ensure the database
     network settings allow connections from your deployment.
   - `JWT_SECRET`: a long random secret.
   - `CLIENT_ORIGIN`: the frontend's exact HTTPS origin, without a trailing
     slash. Multiple trusted production/preview origins may be comma-separated.
4. Deploy and check `https://YOUR-BACKEND.vercel.app/api/health` for `{"ok":true}`.
   This checks the app only; a successful `GET /api/products` also verifies
   database connectivity. Database connection failures return JSON with HTTP 503.

Vercel loads the default Express export from `backend/index.js`. Database
connections are awaited before API handlers and reused across warm requests.
The local listener and shutdown handlers live in `backend/local.js`.

## Deploy the frontend

1. Import the same repository as a second Vercel project with
   **Root Directory: `frontend`** and **Create React App** as the framework.
2. Set `REACT_APP_API_URL=https://YOUR-BACKEND.vercel.app/api` in the frontend
   project's environment variables. Include `/api`. This public setting is
   embedded at build time, so redeploy after changing it.
3. Keep the settings from `frontend/vercel.json`: install with `npm ci`, build
   with `CI=false npm run build`, and serve the `build` directory. The `CI=false`
   setting keeps existing ESLint warnings as warnings; syntax and compilation
   errors still fail the build. It does not disable ESLint.
4. Set the backend's `CLIENT_ORIGIN` to the assigned frontend URL and redeploy
   the backend. Check a frontend API request in the browser, then refresh a
   nested route such as `/login` to check the SPA rewrite.

If a Vercel project has deployment protection enabled, browser requests to that
backend must also be allowed by the project's protection settings.

Reference: [Express on Vercel](https://vercel.com/docs/frameworks/backend/express).

## Local development and checks

In `backend`, run `npm ci`, copy `.env.example` to `.env`, fill in your local
configuration, then run `npm start` (or `npm run dev`). The default port is 8000.
Run `npm test` for deployment smoke tests, CORS checks, and connection reuse
checks. Tests use mocked database connections and do not access your data.

In `frontend`, run `npm ci` followed by `npm start`. Without
`REACT_APP_API_URL`, the frontend calls `/api`, which the development server
proxies to `http://localhost:8000`. For a local production build in PowerShell:

```powershell
$env:CI = 'false'
npm run build
```

Frontend API configuration tests:

```powershell
npm test -- --watchAll=false --runInBand --runTestsByPath src/services/api.test.js
```

Optional email and SMS settings are listed in `backend/.env.example`.
Configure SMTP for real payment receipts and Twilio for real employee OTP SMS.

The existing repository already tracks `backend/.env` and `backend/node_modules`.
The new ignore rules prevent new secrets and dependencies from being added,
and `.vercelignore` excludes these local files from deployment uploads. Remove
the existing files from Git tracking before sharing the repository, and rotate
any credentials that have already been shared. Keep local `.env` values out of
the frontend; only backend environment variables should contain credentials.
