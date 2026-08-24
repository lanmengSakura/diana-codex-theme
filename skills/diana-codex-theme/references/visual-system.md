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

### Top-edge compatibility

- Keep Codex's native toolbar and main-content top fade. Do not remove the fade merely to reveal Diana artwork. On the inspected Windows build `26.818.5229.0`, the fade measured `62px` (`46px` solid plus a `16px` transition), but this is diagnostic evidence, not a reusable constant.
- Preserve the toolbar's native computed positioning and stacking. Never use a blanket rule such as `.diana-skin-surface > :not(#diana-theme-chrome) { position: relative; z-index: 1; }`; it can turn a fixed toolbar into a normal-flow element and move the native fade over the ornaments.
- Find the exact direct child that contains the verified conversation viewport and mark only that node as the foreground. Keep the Diana chrome absolute at `z-index: 0`, non-interactive, and sized from the inspected work area. Re-measure after a Codex update instead of relying on a class hash or the previous fade height.
- Correct mounting and stacking before changing opacity. When the inspected build still needs a restrained upper-right-line compensation, use `.33` in dark mode and `.30` in light mode, then confirm by screenshot that the line is legible without crossing task text. Do not use this compensation to brighten the left ornament, character, or main-work-area typography.

### Environment-heading star

- Render the bundled hand-drawn star at `21px × 21px`, `display: block`, and `flex: 0 0 auto`; use `.72` opacity in dark mode and `.64` in light mode as the production starting point.
- If the real heading text is a truncating span, do not prepend a block element inside that span. Mark the exact heading label or its non-truncating flex row and render the star with a scoped `::before`, or insert it as a sibling in that row. The star and title must remain on one line.
- Reuse the adapter's existing DOM observer to restore the marker after panel redraws. Remove stale markers before attaching the current one and verify that exactly one environment star is present.

## Components

- Preserve main-work-area text and code colors unless the user explicitly approves a readability change.
- Radius: controls `8px`, cards `12px`, composer `14px`.
- Accent only primary actions, selected state, focus ring, and restrained navigation cues.
- Motion: `120–180ms`; respect reduced-motion preference.
- Do not use low-recognition replacement icons for core work-area actions.

## Starberry message rail

Keep Codex's native jump-to-message buttons and hit areas intact. Only restyle their visible marker line, and never replace the real navigation behavior with a static decorative rail. Read [message-rail.md](message-rail.md) for the exact profiles and adapter contract.

- Select sparse (`1–32`), balanced (`33–96`), or dense (`97+`) proportions from the total descendant button count.
- Keep every normal tick visible at 2px high. Use irregular short lengths plus a varied division every fifth message; do not hide alternating ticks or draw a regular ruler.
- Current Codex Desktop nests a marker line below its marker container. Make the outer container transparent and style the inner line so overlapping layers cannot create a two-color mark.
- Let Codex's native `--marker-progress` expand the line on hover. The rest length is a lower bound, not a replacement for the native local hover wave.
- Keep both endpoint diamonds visible even when the real current message is first or last.
- Preserve the pre-`v0.2.5` Diana Day rail palette and opacity; do not copy the dark solid colors into light mode.
- The real `[data-diana-viewport-current="true"]` octagonal star and its strong tick remain singular and visually dominant.
