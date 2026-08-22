---
name: diana-codex-theme
description: Apply, adapt, preview, or restore the self-contained Diana/Jiaran Codex day and night visual system. Use when a user asks Codex to deploy the bundled artwork, native color values, or CSS blueprints. Aim for the complete artwork by default, prefer documented user-space hooks, and disclose any experimental CDP plan before requesting separate approval.
---

# Diana Codex Theme

Bring Diana into Codex without weakening the app's security boundary. The skill carries the finalized day/night artwork, native color values, and CSS blueprints, so do not fetch substitutes or require the surrounding repository.

If this skill is active, its installation step is already complete for the current turn. Do not reinstall it unless the user explicitly asks to update or repair the Skill.

## Start here

1. Detect the operating system, exact Codex version, distribution, and current appearance.
2. Read [visual-system.md](references/visual-system.md) before changing colors, scale, opacity, placement, controls, or assets.
3. Read [runtime-safety.md](references/runtime-safety.md) before touching the real application.
4. Read [experimental-full-visual.md](references/experimental-full-visual.md) when no documented hook can carry the complete artwork.
5. On macOS, also read [macos-deployment.md](references/macos-deployment.md) completely before taking deployment actions.
6. When packaging, publishing, or explaining reuse, read [asset-boundary.md](references/asset-boundary.md).

## Use the bundled source of truth

- Artwork: `assets/theme-blueprint/assets/diana-brand/derived/`
- Diana Night blueprint: `assets/theme-blueprint/themes/diana-dark/`
- Diana Day blueprint: `assets/theme-blueprint/themes/diana-light/`
- Bundle verification: `node scripts/verify-bundle.mjs`

Do not regenerate character art, replace it with a hotlink, or silently simplify the finalized decorations. Adapt selectors and user-writable deployment paths only as required by the inspected Codex build.

## Route by platform

### Windows

Start with Codex Settings > Appearance. Apply the bundled `nativeAppearance` values through the app's own theme controls or import flow. This safely preserves the Diana palette but does not add corner artwork.

Treat the CSS and images as a deployment blueprint. A normal installation request targets the complete Diana composition, including corner artwork. First use any documented theme, plugin, pet, or user-style hook that can carry local decorative assets without a debugging endpoint. If no such hook exists, notify the user and route to [experimental-full-visual.md](references/experimental-full-visual.md); do not silently downgrade to palette-only or silently open CDP.

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

If a documented entry point cannot be established, continue with the informed experimental decision in [experimental-full-visual.md](references/experimental-full-visual.md). If the user declines that route, keep the native palette, report that the full artwork remains ready, and do not turn the request into an application-bundle patch.

## Complete artwork by default

The ordinary request “帮我安装并挂载这套 Diana Codex 主题” targets the complete visual result, including the corner character and decorations. It authorizes inspection, native appearance changes, and documented reversible user-space hooks. It does not by itself authorize opening CDP, restarting Codex, creating a listener, or installing persistence.

When complete artwork requires an experimental debugger route:

1. Read [experimental-full-visual.md](references/experimental-full-visual.md) completely.
2. Notify the user why a documented hook was not sufficient and explain the concrete local attack surface.
3. List the exact processes, ports, files, logs, startup items, resource cost, and restore actions the proposed adapter would use.
4. Stop and obtain explicit approval for that exact plan.
5. After approval, create a machine-local adapter for the inspected Codex build. Do not recover or redistribute the retired Diana watcher.
6. Keep the first deployment manual and temporary. Offer automatic mounting only after one verified enable, disable, full process exit, normal relaunch, and restore cycle.

The standalone skill supplies the visual source of truth and decision procedure, not a prebuilt debugger or background listener.

## Report installation and deployment separately

Never use “installed” as an ambiguous success statement. Report the highest state actually verified:

1. `skill_available`: this Skill is discoverable and its bundle passes verification; no Codex appearance change is implied.
2. `native_palette_applied`: the real Codex Appearance values changed and the restore path was tested; corner artwork is not implied.
3. `full_artwork_mounted`: the real Codex work area visibly shows the intended character and decorations, interaction tests pass, and disable/restore were verified.
4. `deployment_blocked`: the Skill is available, but the requested visual layer was not applied; state the exact missing hook, declined approval, or failed verification.

Copying assets, writing an adapter proposal, passing CSS or ZIP validation, or opening the browser preview does not prove deployment. Do not claim `full_artwork_mounted` without observing the real Codex interface. If the current turn must stop for approval or restart, report the intermediate state and the exact next action instead of saying the theme is installed.

## Visual workflow

1. Preserve the token relationships in the visual reference unless the user approves a new direction.
2. Edit day and night variants together.
3. Keep decorative artwork below task content and outside the composer.
4. Update a browser preview before changing a deployment adapter.
5. Inspect screenshots rather than relying only on DOM checks.

## Guardrails

- Never patch `WindowsApps`, a macOS `.app` bundle, `app.asar`, signatures, quarantine metadata, or bundled Codex resources.
- Never open CDP, install a watcher, or create persistence without first notifying the user and receiving explicit approval for the exact plan. Any approved experiment must follow [experimental-full-visual.md](references/experimental-full-visual.md), remain machine-local, and never be shipped as a repository runtime.
- Never inject analytics, remote CSS, remote images, or arbitrary remote scripts.
- Never claim compatibility from a mockup, CSS parse, or screenshot alone.
- Keep code licensing separate from character-art licensing.
- Preserve an explicit, tested restore path.
