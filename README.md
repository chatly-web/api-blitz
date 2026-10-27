# API Blitz — event starter

The event provides five APIs; the team must use three to build a useful solution. API names, schemas, authentication and detailed rules are not announced yet. This repository prepares the structure without inventing those details.

Live: https://api-blitz-three.vercel.app

## Run

Use Node.js 22 or newer. No packages to install.

```sh
npm start
# open http://localhost:3000
npm test
npm run check
```

Copy `.env.example` to `.env.local` only when real credentials are available. The local server loads `.env.local`; Vercel uses project environment variables. Mock mode needs no credentials.

## Structure

```text
public/                    Only browser-visible files
  index.html               Event workspace, problem brief, API selection
  assets/
    styles.css             Shared design tokens and responsive components
    app.js                 UI state, browser draft, API requests and export
    components.js          API rows, results, empty/error display
api/
  index.mjs                One Vercel function: catalog and run routes
lib/                       Server-only modules
  apis/
    api-1.mjs … api-5.mjs   One replaceable adapter per supplied API
    registry.mjs           Metadata and adapter registration
    mock.mjs               Explicit placeholder fixtures
  http.mjs                 Fetch helper with timeout and HTTP error handling
  runner.mjs               Validate exactly three; run adapters; handle failures
  solution.mjs             Combine the three contributions into useful output
server.cjs                 Local server using the same API handler
.env.example               Empty credential placeholders; never real keys
tests/                     Selection, failures, timeouts, HTTP contract
docs/                      API connection guide, UI components, event playbook
```

## What works now

- Choose exactly three of five API slots.
- Save a problem brief and selection in this browser; export it as JSON.
- Call the server-side runner and inspect three clearly labeled mock results.
- Separate loading, empty, success, failure and incomplete-run states.
- Keep each future API integration independent of the UI.

This is preparation, not the final event solution. A successful mock run proves the wiring only. All three selected APIs must complete before a combined view is produced. Failed APIs are never silently replaced by mocks.

## When APIs are announced

Follow [the connection guide](docs/API-CONNECTIONS.md), map the providers in [the event playbook](docs/EVENT-PLAYBOOK.md), and implement the specific user workflow in `lib/solution.mjs`. Confirm whether the official rules require exactly three or at least three before changing validation.

## GitHub and deployment

The Downloads checkout is connected to `chatly-web/api-blitz`. Its Git credential helper uses macOS Keychain; the PAT is not part of the repository.

```sh
git add .
git commit -m "Describe the change"
git push
```

Vercel deploys `main`. Framework preset: Other. Build command: empty. Output directory: `public` (declared in `vercel.json`). `/api/catalog` and `/api/run` route to the shared function. API keys belong in Vercel project environment variables and server-side code only. Redeploy after changing environment variables.

## Preparation skills

UI work uses the installed Impeccable and UI/UX Pro Max skills, preserving the current design system. Integration work follows the provider’s official docs and the adapter contract. See `AGENTS.md` for future implementation guidance; skill packages themselves are not copied into the repository.
