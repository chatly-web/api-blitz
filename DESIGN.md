# Civic Issue Reporter — design system

The supplied implementation plan replaces the blank starter with a functional civic application. Preserve the user's preference for a straightforward white interface: white background, dark green text, subtle gray-green boundaries, restrained green actions. No decorative gradients, invented testimonials or marketing metrics.

## Visual tokens

- Background #ffffff; foreground #1d2c28; secondary text #62716b.
- Border #e0e7e2; primary action #216c51; supporting surface #f2f6f2.
- Status colors are accompanied by text: Open (amber), Acknowledged (blue), In progress (purple), Resolved (green).
- Native Arial/Helvetica body typography; responsive 30–60px main headings, 25px section headings, 13–15px body and form text.
- Lucide line icons and locally generated DiceBear shapes; no Google profile imagery.

## Components

shadcn-style Button/Input/Textarea primitives, status badge, generated Avatar, CloudImage, BeforeAfter, MapView, LocationPicker, PhotoUpload, VoteButtons, CommentThread and AdminActions. CloudImage uses a blurred Picsum placeholder while the actual face-blurred Cloudinary image loads; failures show an explicit message, never a substitute evidence photo.

## Layout

A simple header holds the issue map, my reports and authority navigation. Pages use a centered content width of 1240px and stack below 800px. Report details pair evidence/discussion with a compact metadata sidebar. Citizen navigation avoids a home feed. The authority queue has filtering and sorting as required by the plan.

## Behavior and accessibility

Native labels, keyboard focus, live status/error messages, minimum 44px primary controls, a skip link, reduced-motion support, map-accessible report links, editable coordinates and a keyboard-controlled comparison slider. Google Maps is optional; manual coordinates and OpenStreetMap remain available. Preview samples are prominently labeled read-only. Admin routes return 404 without authority authorization.

## Queue and loading refinement
Authority defaults to active reports, with resolved reports retained under explicit status filters. My Reports and the map provide status filters. Shared route skeletons preserve row rhythm while loading; motion respects reduced-motion preferences. Queue actions and statuses stack at tablet/mobile widths.

## Language and assistance
Compact native language selector with native language names, persistent choice and HTML lang/dir updates. Translations are bundled and work without an API connection. Static labels use React-owned translation components, never DOM replacement. A nonmodal assistant opens from a fixed, labeled control with Escape-to-close and restored focus. Drafts are visually separate from submitted reports. Compact spacing preserves 44px primary controls and clear field labels.

## Professional interface refinement
Use a 32px page heading, 14–16px working text and consistent 44px primary controls. Navigation highlights the current area. Map filters, results count, map and status key share one workspace boundary; category and status filters compose. The report editor pairs photo evidence with details on desktop, with full-width location and a single-column mobile layout. Checklist indicators reflect actual form completion. Keep the white/green palette, native multilingual typography, restrained shadows and reduced-motion support. On mobile the repeated header report action is hidden; report creation remains available from map/empty states and assistant links.

## Accountability and evidence
Timeline uses actual recorded submission/claim/status milestones and omits internal-note events and authority actors. Outcome summaries use dataset counts and explicit denominators; photo presence is not labeled independently verified. Category bars include text counts. The authority attention score is explainable and presented as workload assistance, never emergency severity or a deadline. Live photo upload uses a neutral prompt and the citizen’s selected evidence; stock samples remain in the read-only demo/loading placeholders.

## Automatic report intake
No separate photo-suggestion or current-location buttons. Successful photo uploads automatically request AI category/description suggestions. Device location is requested once on form opening with normal browser permission; coordinates and neighborhood stay editable. Loading/status messages explain progress and failure. Picsum imagery occupies the upload/photo area until real delivery is ready, is labeled sample preview, and never enters the upload payload. A late AI/GPS response must preserve newer citizen edits.

## Category previews and delivery transition
Upload previews use two curated, licensed local photos per category, with 2.5px CSS blur and a refresh action that stays inside that category. The current sample is frozen when upload starts and remains behind the ring while the upload and actual image delivery complete. Signed, face-blurred actual evidence crossfades over that same sample; no random placeholder is substituted midway. Delivery errors stop the ring and offer retry. AI retry appears only after automatic analysis fails. Source and image-license credits are available at /photo-credits.

## Layout-matched route loading
Route skeletons use distinct map, report editor, report detail, personal reports/persona, authority queue/workspace and outcomes layouts. Reuse live page grid, filter, queue and sidebar containers; keep header/footer placeholders on routes whose shell loads with the page, and omit them beneath the existing authority layout. Neutral pulse placeholders have no interactive controls, announce one loading status, respect reduced motion, and constrain fixed-width bars inside mobile grids.
