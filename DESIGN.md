---
name: API Blitz
description: A simple API starter page with a local request playground.
colors:
  paper: "#f4f2e9"
  ink: "#232b24"
  muted: "#62695f"
  line: "#d2d5c8"
  green: "#c8e85a"
  panel: "#fffef9"
  dark: "#202b25"
  olive: "#52691c"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(44px, 5.3vw, 72px)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  body:
    fontFamily: "DM Sans, sans-serif"
    lineHeight: 1.6
rounded:
  control: "5px"
  panel: "10px"
---

## Overview

This documents the implemented plain page. Warm cream surfaces, dark green text, olive emphasis, and lime actions support a compact developer starter. The playground is the main interactive element; typography and whitespace provide the rest of the visual character.

## Colors

Use green for the primary call to action and Send button. Olive marks headline emphasis, the GET method, and response status. Paper is the page background, panel is the playground surface, and dark is the JSON response surface. Muted text carries supporting copy; line separates sections and controls.

## Typography

Space Grotesk supplies the brand, hero, and section titles. DM Sans supplies body copy, navigation, labels, and buttons. System monospace supplies endpoints, JSON, response metadata, and step numbers. The hero uses tight tracking and line height; body copy stays relaxed and readable.

## Layout

The centered content shell caps at (1200px), with (48px) desktop side gutters. The hero pairs copy and playground in equal columns with a (70px) gap; the starter section repeats that two-column structure. At (950px) and below, gutters become (24px), gaps become (30px), and playground padding tightens. At (700px) and below, both sections stack, the playground caps at (560px), and the footer wraps. The mobile hero scales from (43px) to (64px). JSON can scroll horizontally inside its panel.

## Elevation & Depth

Only the playground has a soft, low-contrast shadow. Thin borders establish the remaining hierarchy. Keep section backgrounds continuous with the page.

## Shapes

Controls and the response surface use gently rounded corners. The containing playground has the larger panel radius. The primary link is a simple filled rectangle; the logo uses a small lightning symbol.

## Components

The header provides anchor navigation. A visible-on-focus skip link leads to main content. The labeled endpoint select and native submit button form the playground request control. Initial status reads “Ready to send”; submission disables Send and shows “Sending…” plus “Loading sample…”, then displays the selected local JSON and a sample success status. No remote request occurs.

Response status uses a polite live region. JSON is keyboard focusable. Copy JSON reports success, or selects the JSON and gives keyboard-copy instructions when clipboard access fails. All interactive elements have a visible focus outline. Reduced-motion preferences disable smooth scrolling and transitions.

## Do's and Don'ts

Preserve the simple page structure, cream/olive palette, restrained borders, and clear local-demo label. Keep form labels and state feedback explicit. Do not imply that the playground calls a live backend or requires credentials.

## Event workspace update

The main surface is now an operating workspace. A compact event introduction replaces the generic landing hero. A two-column bordered workspace pairs the problem brief with five selectable API rows. Selection caps at three with a visible count. Results use parallel API diagnostics and a combined view; the initial empty state explains how to start. The event-prep section retains sequential steps. The existing palette, typography and responsive stacking remain. New component states include catalog failure/retry, valid selection, loading/busy, partial run, timeout, previous results and browser-storage failure. All provider values are rendered as text.
