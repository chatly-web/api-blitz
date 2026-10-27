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
