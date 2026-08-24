# Visual system

## Intent

The result should feel like Codex with a Diana accent, not a full-screen character poster. Preserve long reading sessions, code contrast, the original main-work-area text colors, and familiar control hierarchy.

## Bundled source of truth

Use these assets as-is unless the user explicitly asks for new art direction:

| Role | Bundled file |
|---|---|
| Diana Night character | `diana-night-v3.png` |
| Diana Day character | `diana-corner-cutout-v2.png` |
| Upper/right line art | `diana-line-art-approved-upper.png` |
| Detailed upper-left corner | `diana-left-top-detailed-corner-mask-v7.png` |
| Lower narrative doodle | `diana-doodle-chalk-v2-approved.png` |
| Hand-drawn star | `diana-hand-star-reference-v2.png` |
| Wrapped candy | `diana-candy-wrapped-v1.png` |
| Lollipop | `diana-candy-lollipop-v1.png` |
| Heart Acao | `acao-heart-v3.png` |
| Cheer Acao | `acao-cheer-v1.png` |

All files live under `assets/theme-blueprint/assets/diana-brand/derived/`. The paired CSS and manifests live under `assets/theme-blueprint/themes/` and define the finalized placement, opacity, filtering, and theme-specific treatment.

Do not generate substitute characters, mirror the wrong corner ornament, bake a checkerboard into transparency, or replace these files with remote URLs.

## Tokens

| Token | Dark | Light |
|---|---:|---:|
| Surface | `#0D0C0F` | `#FBF8F6` |
| Panel | `#171419` | `#FFFFFF` |
| Ink | `#F3EEF0` | `#2C2529` |
| Muted | `#A9A1A7` | `#7E7178` |
| Accent | `#D86E91` | `#B84970` |
| Accent soft | `#38242D` | `#F2DCE3` |
| Border | `#2B262D` | `#E8DFE2` |

## Placement

- Anchor the main character to the lower-right edge using the bundled CSS as the exact starting point.
- Keep the approved left narrative drawing and upper-corner decorations inside the work-area edges, not the global window chrome.
- Preserve sparse whitespace around the conversation column and composer.
- Keep the hand-drawn environment-heading star attached to the real heading when that hook exists; omit it if no safe dynamic hook is available.
- Use `pointer-events: none` on every art layer and keep the composer above decoration.

## Components

- Preserve main-work-area text and code colors unless the user explicitly approves a readability change.
- Radius: controls `8px`, cards `12px`, composer `14px`.
- Accent only primary actions, selected state, focus ring, and restrained navigation cues.
- Motion: `120–180ms`; respect reduced-motion preference.
- Do not use low-recognition replacement icons for core work-area actions.

## Starberry message rail

Keep Codex's native jump-to-message buttons and hit areas intact. Only restyle their visual ticks, and never replace the real navigation behavior with a static decorative rail.

- Up to 40 user-message buttons: retain the regular tick rhythm.
- From 41 to 80 buttons: retain the published preview's line proportions, soften inactive ticks, and keep every fifth tick easier to scan.
- From 81 buttons onward: reduce the number of visible marks instead of compressing the whole rail. Show a regular line every third button and keep every tenth button as a restrained major division.
- Target roughly 11px for regular visible lines, 18–20px for major divisions, and about 20px plus the octagonal star for the current marker in the current 26px marker geometry.
- Count descendant message buttons rather than assuming they are direct children of the `nav`; current Codex Desktop nests the list below scrolling wrappers.
- Exclude `[data-diana-viewport-current="true"]` from every density rule. The real current-message star and its strong tick must remain singular and visually dominant.
- Keep hover and keyboard focus feedback available at every density.
