# Runtime safety

## Known baseline

The verified runtime baseline is Codex for Windows, Microsoft Store/MSIX build `26.814.5517.0`. Treat this as a historical Windows baseline, not a permanent or cross-platform compatibility promise.

The bundled CSS and artwork are visual blueprints. They do not prove that a new Codex build exposes the same DOM, theme hook, process model, or launch behavior.

## Before applying

1. Record the operating system, exact Codex version, distribution, executable location, and active appearance.
2. Inspect official appearance, theme, plugin, and user-style entry points first.
3. Capture read-only DOM and computed-style evidence for the target states when a renderer inspection hook is available.
4. Confirm every selector is scoped below a verified host marker.
5. Confirm every deployed asset resolves locally from a user-writable directory.
6. Prepare disable and restore commands before the first write.

## Application boundary

Never alter installed application files, packages, resources, signatures, `app.asar`, `WindowsApps`, or a macOS `.app` bundle. Never bind a debugging endpoint to a non-loopback interface.

The Windows repository launcher uses a loopback-only debugging connection and a reversible CSS enhancement. That route is validated only on its recorded Windows build. Do not transplant its process names, flags, paths, or persistence mechanism to macOS.

On macOS, follow [macos-deployment.md](macos-deployment.md). Prefer a supported application hook. A debugging connection is a fallback only after the current build has been inspected and the user has approved any restart or launch-argument change.

## Change control

Explicit approval is required before:

- restarting or closing Codex;
- changing launch flags;
- creating a login item, LaunchAgent, scheduled task, or other persistence;
- replacing an existing user configuration file rather than merging a narrowly scoped entry.

## Verification

Test home, conversation, settings, diff, approval, long scrolling, narrow width, compact/secondary windows, theme switching, restart persistence, disable, and restore. Verify pointer and keyboard interaction with decorations enabled.

A browser mockup is visual design evidence only. A successful bundle check proves file completeness only. Neither is runtime compatibility evidence.
