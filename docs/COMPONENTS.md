# UI component map

Keep the existing cream/olive design system while the event's actual use case is unknown. Frontend: plain HTML, CSS and JavaScript; no component framework dependency is needed for this starter.

| Component | Location | States / purpose |
| --- | --- | --- |
| App header and anchor navigation | `public/index.html` | Workspace and event prep navigation |
| Problem brief | `public/index.html`, `assets/app.js` | Visible labels, required problem, length limits, optional fields, local save |
| API selector | `assets/components.js` | Five slots, selected state, maximum three, mock/live label |
| Run action | `assets/app.js` | Disabled until valid, loading, success, timeout/error feedback |
| Results list | `assets/components.js` | Per-API contribution, duration, error, inspectable JSON |
| Combined view | `assets/components.js` | Wiring preview after three successes; unavailable on failure |
| Empty state | `public/index.html` | Explains the first action and expected result |
| Brief export | `assets/app.js` | JSON download, accessible status feedback |

All `assets/` paths above are under `public/`. Components use native form controls, visible focus, polite status announcements and reduced-motion support. Use `textContent` for provider/user values. Keep every future domain-specific screen accessible at mobile sizes.

For richer event needs, add only what the real workflow requires: results filtering, maps, tables, charts, uploads or history. Do not invent unused screens before the APIs and problem are known.
