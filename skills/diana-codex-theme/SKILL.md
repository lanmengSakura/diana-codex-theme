---
name: diana-codex-theme
description: Deploy, refine, verify, troubleshoot, or restore the self-contained Diana/Jiaran Codex day and night themes. Use when a user asks Codex to install this theme from the bundled artwork and CSS, including the verified Windows workflow or an experimental macOS deployment after live safety inspection. Do not use to patch Codex application bundles or claim untested compatibility.
---

# Diana Codex Theme

Deploy Diana as a quiet corner companion without changing Codex's main reading hierarchy. The skill carries the finalized day/night artwork and CSS blueprints, so do not fetch substitutes or require the surrounding repository.

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

When the surrounding repository is present, use its existing launcher, validation, status, switch, and restore commands. This is the currently verified route. Ask before restarting Codex or changing launch flags.

When only this standalone skill is present, treat the bundled files as a deployment blueprint. Inspect the live installation and create only the minimum user-writable, reversible adapter needed for that machine. Do not pretend the repository launcher exists.

### macOS

Use the agent-driven procedure in [macos-deployment.md](references/macos-deployment.md). macOS is experimental and not currently verified on real hardware. Inspect first, prefer an official theme or extension hook, and stop safely when no reversible user-space route is available.

### Other platforms

Preview and package the visual assets, but do not claim real-app support unless a safe, reversible hook has been inspected and verified on that platform.

## Deployment workflow

1. Verify the skill bundle.
2. Record the exact Codex version and distribution.
3. Inspect supported appearance, theme, plugin, and user-style entry points before considering a debugging connection.
4. Prepare a restore record before the first write. Back up only files that this workflow will change.
5. Copy required assets and styles into a user-writable support directory; never write into the installed application bundle.
6. Keep selectors below an explicit host scope and keep every decorative layer non-interactive.
7. Ask before restarting Codex, changing launch arguments, or installing an automatic startup item.
8. Verify home, conversation, settings, diff, approval, long scroll, narrow width, theme switching, restart, disable, and restore.
9. Report the exact tested version, deployed paths, remaining limitations, and restore command.

If a safe entry point cannot be established, report that the assets are ready but this Codex build has no verified deployment route. Do not turn that into an application-bundle patch.

## Visual workflow

1. Preserve the token relationships in the visual reference unless the user approves a new direction.
2. Edit day and night variants together.
3. Keep decorative artwork below task content and outside the composer.
4. Update a browser preview before changing a runtime adapter.
5. Inspect screenshots rather than relying only on DOM checks.

## Guardrails

- Never patch `WindowsApps`, a macOS `.app` bundle, `app.asar`, signatures, quarantine metadata, or bundled Codex resources.
- Never inject analytics, remote CSS, remote images, or arbitrary remote scripts.
- Never claim compatibility from a mockup, CSS parse, or screenshot alone.
- Keep code licensing separate from character-art licensing.
- Preserve an explicit, tested restore path.
