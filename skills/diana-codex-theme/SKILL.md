---
name: diana-codex-theme
description: Safely apply, adapt, preview, or restore the self-contained Diana/Jiaran Codex day and night visual system. Use when a user asks Codex to use the bundled artwork, native color values, or CSS blueprints. Prefer official Appearance controls and documented user-space hooks; never open a browser debugging port or patch the Codex application.
---

# Diana Codex Theme

Bring Diana into Codex without weakening the app's security boundary. The skill carries the finalized day/night artwork, native color values, and CSS blueprints, so do not fetch substitutes or require the surrounding repository.

## Start here

1. Detect the operating system, exact Codex version, distribution, and current appearance.
2. Read [visual-system.md](references/visual-system.md) before changing colors, scale, opacity, placement, controls, or assets.
3. Read [runtime-safety.md](references/runtime-safety.md) before touching the real application.
4. On macOS, also read [macos-deployment.md](references/macos-deployment.md) completely before taking deployment actions.
5. When packaging, publishing, or explaining reuse, read [asset-boundary.md](references/asset-boundary.md).

## Use the bundled source of truth

- Artwork: `assets/theme-blueprint/assets/diana-brand/derived/`
- Diana Night blueprint: `assets/theme-blueprint/themes/diana-dark/`
- Diana Day blueprint: `assets/theme-blueprint/themes/diana-light/`
- Bundle verification: `node scripts/verify-bundle.mjs`

Do not regenerate character art, replace it with a hotlink, or silently simplify the finalized decorations. Adapt selectors and user-writable deployment paths only as required by the inspected Codex build.

## Route by platform

### Windows

Start with Codex Settings > Appearance. Apply the bundled `nativeAppearance` values through the app's own theme controls or import flow. This safely preserves the Diana palette but does not add corner artwork.

Treat the CSS and images as a deployment blueprint. Use them only when the current Codex build exposes a documented theme, plugin, pet, or user-style hook that can carry local decorative assets without a debugging endpoint. If no such hook exists, keep the native palette and report that the full artwork was not installed.

### macOS

Use the agent-driven procedure in [macos-deployment.md](references/macos-deployment.md). macOS is experimental and not currently verified on real hardware. Inspect first, prefer an official theme or extension hook, and stop safely when no reversible user-space route is available.

### Other platforms

Preview and package the visual assets, but do not claim real-app support unless a safe, reversible hook has been inspected and verified on that platform.

## Deployment workflow

1. Verify the skill bundle.
2. Record the exact Codex version and distribution.
3. Inspect supported appearance, theme, plugin, pet, and user-style entry points. Do not create a debugging connection.
4. Prepare a restore record before the first write. Back up only files that this workflow will change.
5. Copy required assets and styles into a user-writable support directory; never write into the installed application bundle.
6. Keep selectors below an explicit host scope and keep every decorative layer non-interactive.
7. Ask before restarting Codex or replacing an existing user configuration file. Do not change launch arguments or install persistence.
8. Verify home, conversation, settings, diff, approval, long scroll, narrow width, theme switching, restart, disable, and restore.
9. Report the exact tested version, deployed paths, remaining limitations, and restore command.

If a safe entry point cannot be established, report that the assets are ready but this Codex build has no verified deployment route. Do not turn that into an application-bundle patch.

## Visual workflow

1. Preserve the token relationships in the visual reference unless the user approves a new direction.
2. Edit day and night variants together.
3. Keep decorative artwork below task content and outside the composer.
4. Update a browser preview before changing a deployment adapter.
5. Inspect screenshots rather than relying only on DOM checks.

## Guardrails

- Never patch `WindowsApps`, a macOS `.app` bundle, `app.asar`, signatures, quarantine metadata, or bundled Codex resources.
- Never add `--remote-debugging-port`, connect through CDP, open a localhost debugger, or install a watcher/login task for the theme.
- Never inject analytics, remote CSS, remote images, or arbitrary remote scripts.
- Never claim compatibility from a mockup, CSS parse, or screenshot alone.
- Keep code licensing separate from character-art licensing.
- Preserve an explicit, tested restore path.
