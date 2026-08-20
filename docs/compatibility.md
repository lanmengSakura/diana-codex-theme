# Compatibility status

## Current baseline

- Operating system: Windows 11
- Codex distribution: Microsoft Store / MSIX
- Locally inspected version: `26.814.5517.0`
- Theme release: `0.1.1`
- Visual status: Diana Night and Diana Day finalized
- Runtime status: beta

## Live verification on 2026-08-21

The Diana runtime adapter was verified against the locally installed Microsoft Store build `26.814.5517.0`.

- CDP bound to `127.0.0.1:9336`.
- Main renderer matched by `aside.app-shell-left-panel ~ main`.
- Compact avatar renderer matched by `main.relative` and excluded from decoration through the `compact-window` root class.
- Composer matched by `[role="textbox"][contenteditable="true"]`.
- Main conversation and compact overlay had no missing required nodes or horizontal overflow.
- Page reloads and newly created renderer targets received the theme through one watcher.
- The launcher no longer leaves Codex App Manager and its additional WebView2 subtree running.
- Native appearance settings are backed up before the first managed change.
- The Diana hand-drawn star remains attached to the environment heading across collapse, reopen, and panel rerender states.

## Showcase verification on 2026-08-20

The simulated interface passed dark and light captures at `1600×900` and `1920×1080`, plus a `375×812` fit check.

- The 16:9 stage fills the viewport without top letterboxing or bottom clipping.
- No horizontal or vertical document overflow.
- No browser console errors or warnings.
- The showcase references the finalized local theme assets and no user screenshots.

## Version-update policy

Codex desktop UI selectors are implementation details and may change between releases. Before claiming compatibility with a newer build, verify:

1. Home, conversation, settings, diff, approval, error, and compact overlay states.
2. Pointer and keyboard interaction with all decorative layers enabled.
3. Theme persistence after renderer reload and application restart.
4. Status reporting and a clean restore path with no residue.

The runtime is opt-in and must not restart an existing Codex process without explicit user action.
