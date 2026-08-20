# Visual system

## Intent

The theme should feel like Codex with a Diana accent, not a full-screen character poster. Preserve long reading sessions, code contrast, and familiar control hierarchy.

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

## Character placement

- Anchor to the lower-right edge.
- Target 15–18% of content width on home.
- Reduce visual presence to 7–10% during conversation.
- Use `pointer-events: none` and keep the composer above the decorative layer.
- Never substitute a black silhouette, baked checkerboard, or remote placeholder.

## Components

- Radius: controls `8px`, cards `12px`, composer `14px`.
- Accent only primary action, selected state, and focus ring.
- Motion: `120–180ms`; respect reduced-motion preference.
