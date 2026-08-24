# Starberry message rail

Use this reference only when adapting the bundled message rail to a real Codex build. The public theme CSS already contains a deterministic fallback. A machine-local adapter may add the finer profile below only when that adapter is already authorized for the current deployment; this reference is not permission to open CDP, add a watcher, or install persistence.

## Invariants

- Keep Codex's native message buttons, hit areas, scrolling, hover wave, keyboard focus, and jump behavior.
- Restyle only the visible marker line. Current Codex nests `MarkerLine` below `Marker`; older builds may expose only one marker element.
- Keep every normal line visible. Do not use opacity zero or alternating hidden buttons to reduce density.
- Keep the top and bottom endpoint diamonds visible, including when the current message is first or last.
- The real viewport marker remains the only octagonal star and uses `[data-diana-viewport-current="true"]`.
- Reuse an existing DOM observer when one exists. Do not add a second document-wide polling loop merely for this rail.

## Adaptive profiles

Choose the profile from the total number of message buttons:

| Profile | Count | Normal scales | Major scales |
|---|---:|---|---|
| `sparse` | `1–32` | wider and more open | `0.53–0.64` |
| `balanced` | `33–96` | medium | `0.47–0.57` |
| `dense` | `97+` | compact but always visible | `0.40–0.48` |

Use these exact art-directed arrays when the adapter can assign an inline `--diana-art-scale` to each real button:

```js
const profiles = {
  sparse: {
    max: 32,
    pattern: [.26, .35, .29, .46, .31, .39, .25, .43, .33, .28, .48, .30, .37, .27, .41, .34, .29, .45, .32, .38, .25, .44, .30],
    majors: [.56, .62, .53, .59, .64, .55],
  },
  balanced: {
    max: 96,
    pattern: [.24, .33, .27, .41, .30, .36, .25, .39, .32, .28, .43, .29, .35, .26, .40, .31, .27, .42, .30, .37, .24, .38, .28, .34, .26, .41, .29],
    majors: [.49, .55, .47, .52, .57, .50, .54],
  },
  dense: {
    max: Infinity,
    pattern: [.23, .31, .26, .36, .28, .33, .24, .35, .29, .27, .37, .25, .32, .28, .34, .24, .36, .30, .26, .33, .23, .35, .27, .31, .25, .34, .29, .24, .32],
    majors: [.42, .47, .40, .45, .43, .48, .41, .46, .44],
  },
};
```

For zero-based index `i`, select the ordinary scale with a block offset so the sequence does not visibly repeat at each array boundary:

```js
const block = Math.floor(i / profile.pattern.length);
const slot = (i + block * 7) % profile.pattern.length;
let scale = profile.pattern[slot];
const major = i % 5 === 0;
if (major) scale = profile.majors[Math.floor(i / 5) % profile.majors.length];
```

Set `data-diana-rail-major="true"` only on major buttons and write `--diana-art-scale` as a unitless number. Recalculate when the real list or its button count changes. On disable, remove both the data attribute and inline property.

## Color lock

- Dark normal line: `#643548`; major: `#754057`; hover: `#b96583`; current: `#e884a6`.
- Light mode retains the pre-`v0.2.5` palette: normal and major hue `rgb(184 73 112 / 55%)`, current `rgb(174 55 96 / 92%)`, with the original `0.72 / 0.9 / 0.78` visual opacity levels.
- The nested outer marker must stay transparent and fully opaque as a container. Apply color and opacity only to its inner line so two translucent layers cannot create a grey-pink double mark.

## Verification

Verify at `12`, `50`, `100`, and a real `200+` message count. At each count, check:

1. All normal lines are present and 2 px high.
2. Every fifth line is a restrained major division with non-uniform length.
3. Hover still expands the native local neighborhood and returns to the irregular rest pattern.
4. Exactly one current star is visible.
5. Both endpoint diamonds remain visible.
6. Day mode matches the pre-`v0.2.5` berry-pink color family rather than inheriting the dark palette.
