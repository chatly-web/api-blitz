# Civic product review — 28 October 2026

## Scope and event interpretation

The user supplied API-Blitz-2026-Rulebook.pdf. It describes three randomly assigned APIs, meaningful integration, a repository/deployment/README submission and final assessment of product/creativity, technical implementation, API integration, UI/UX and pitch. It also describes Neon evidence and a 27 October cutoff. The user explicitly clarified that requirements have changed and instructed us not to use Neon or change architecture. Supabase Auth/Postgres, Cloudinary, DiceBear and Picsum remain in place. No Neon migration or extra database is introduced. Exact assigned combination and updated organizer rubric have not been independently confirmed. Never promise eligibility or a win.

## Primary-source research and resulting decisions

| Evidence | Implication for this product | Implemented response |
| --- | --- | --- |
| [FixMyStreet overview](https://fixmystreet.org/overview/) describes geographic problem reporting to the appropriate authority and internationalization. | A map plus reporting alone is an established pattern. Differentiate through evidence handling and a clear completion loop, rather than claiming the concept is novel. | Preserve multilingual reporting and exact locations; strengthen resolution evidence and accountability. |
| [FixMyStreet administrator manual](https://fixmystreet.org/running/admin_manual/) documents a timeline of report updates/status changes and administrative report search. | Citizens need a history, not only a final badge; administrators need workable queues. | Read existing audit records on the server and expose only status/claim milestones, never actors or internal notes. Add explainable queue ordering. |
| [SeeClickFix subscriptions](https://www.civicplus.help/seeclickfix/docs/subscriptions) includes status changes, comments and duplicate merging in follow-up workflows. | Reporting is a lifecycle. Retain the existing duplicate warning and discussion; do not add an unreliable email subsystem without delivery configuration. | Add history and an outcome view while preserving the existing duplicate check and explicit citizen review. Notifications remain deferred. |
| [Cloudinary media access](https://cloudinary.com/documentation/control_access_to_media) and [transformations](https://cloudinary.com/documentation/image_transformations) explain authenticated media, signed URLs, resizing and image processing. | Media delivery is the evidence infrastructure. A stored photo is not independently verified truth, and face blur is not a guarantee that every identifying detail is removed. | Keep signed, face-blurred evidence delivery and mandatory after-photo resolution. Remove “verified original” UI language and the live sample-to-evidence action. |
| [DiceBear HTTP API documentation](https://www.dicebear.com/integrations/http-api/) distinguishes its HTTP integration from SDK integrations. | Be accurate in the pitch: this implementation serves DiceBear-generated avatars through its own API using the installed SDK. Do not claim a live request to the public provider for every avatar. | Preserve the existing deterministic, HMAC-derived public avatar mechanism. State implementation accurately in the demo notes. |
| [Picsum documentation](https://picsum.photos/) supports sized, seeded and blurred placeholder imagery. | Placeholder imagery supports demo/testing and loading states; it cannot establish a real civic issue or repair. | Preserve labeled demo images/loading placeholders. Live reporting requires a user-selected photo; no built-in stock-image submission button. |
| [Devpost participant FAQ](https://info.devpost.com/faqs-participants) directs participants to the specific event's rules and criteria. | Generic “winning” advice cannot substitute for the organizer's actual rubric. | Maintain a concrete evidence-based demo and a rulebook caveat; do not import judging weights from unrelated competitions. |

## Selected improvements

1. **Public report history:** actual submission/claim/status timestamps, sequential duplicate statuses removed, unknown/private actions excluded. No fabricated intermediate steps.
2. **Explainable authority ordering:** waiting time up to 60 points over 14 days, positive net support up to 25, unclaimed work 15. Negative votes never subtract waiting-time credit; resolved reports score zero. Deterministic ties use age then report ID. This is workload assistance, not safety classification, dispatch automation or an SLA.
3. **Community outcomes:** dataset-based resolved counts, resolutions with after-photo, unclaimed active work, category breakdown and before/after gallery. Empty denominators are safe. Photo presence is not independent quality verification.
4. **Evidence integrity:** live uploads require user-selected images, sample images stay in the demo, and upload messages distinguish upload completion from server-side verification at submission.

## Deliberately deferred

No architecture replacement, Neon, paid translation, automatic authority decisions, fabricated urgency labels, background AI actions, notifications, automatic reopening or new credential requirements. A rule-compliant pitch depends on the organizers accepting the current three-API combination and their revised requirements.

## Demonstration sequence

1. Open the clearly labeled read-only demo and category/status filters.
2. Open a sample report, show generated identities and the before/after evidence interaction; clearly identify sample imagery.
3. In a real signed-in session, use the Groq assistant to prepare a draft, then review and supply an actual photo/location before submission.
4. As an authorized authority, explain queue score factors, claim work, and resolve with a real after-photo.
5. Return to the citizen view: show actual history and outcomes changing from real data.

Keep test/demo records separate from real reports; never present sample counts as city-wide impact. The installed API integrations and deterministic fallback paths are more credible than disconnected API decorations.

## Organizer criteria supplied by the user

- API Integration Depth: 30% — effective, creative integration in one workflow.
- Technical Execution: 25% — clean code, errors, responsive UI, modularity and repository hygiene.
- Originality & Utility: 25% — novelty and practical usefulness.
- Demo & Presentation: 20% — video, UX and pitch clarity.

The resulting intake demonstration is one continuous workflow: labeled Picsum preview → Cloudinary upload → automatic photo suggestions and GPS/address filling → citizen review with DiceBear identity → explicit submission → authority resolution evidence and recorded milestones. Do not claim the placeholder establishes a real issue, AI verifies factual truth, or GPS identifies the photographed location. Explain each integration’s actual role. The user explicitly retains Supabase and excludes Neon.
