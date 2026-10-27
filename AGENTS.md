# API Blitz project guidance

This is an event starter. Five APIs will be supplied; the team intends to use three. The API list and detailed rules are still unknown. Do not invent real providers, credentials, judging criteria, integrations or solution claims.

- Read PRODUCT.md, DESIGN.md and docs/EVENT-PLAYBOOK.md before implementing the event solution.
- Preserve plain HTML/CSS/JavaScript unless the user requests a framework change.
- For UI work, use the installed Impeccable and UI/UX Pro Max skills when available; inherit the existing visual system.
- For API integration, follow docs/API-CONNECTIONS.md and the actual provider's official documentation. Keep one adapter per API and business logic in lib/solution.mjs.
- Only public/ ships as static files. Keep credentials and provider requests server-side. Never inspect, print or commit secret values.
- Mock mode must be visible. Never replace a failed live API with a mock without explicit user direction and clear UI labeling.
- Confirm the official exactly-three/at-least-three rule when it becomes available.
- Run npm test and npm run check after logic changes. Verify desktop/mobile layouts and API states after UI changes.
- The Downloads checkout's Git remote and Keychain helper are already configured. Push normal commits to main for Vercel deployment; do not upload files through the browser.
