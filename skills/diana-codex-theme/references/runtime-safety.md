# Runtime safety

## Known baseline

The verified runtime baseline is Codex for Windows, Microsoft Store/MSIX build `26.814.5517.0`. Treat this as a historical Windows baseline, not a permanent or cross-platform compatibility promise.

The bundled CSS and artwork are visual blueprints. They do not prove that a new Codex build exposes the same DOM, theme hook, process model, or launch behavior.

## Before applying

1. Record the operating system, exact Codex version, distribution, executable location, and active appearance.
2. Inspect official appearance, theme, plugin, and user-style entry points first.
3. Capture read-only layout evidence only through a documented application or plugin interface.
4. Confirm every selector is scoped below a verified host marker.
5. Confirm every deployed asset resolves locally from a user-writable directory.
6. Prepare disable and restore commands before the first write.

## Application boundary

Never alter installed application files, packages, resources, signatures, `app.asar`, `WindowsApps`, or a macOS `.app` bundle. Never launch Codex with a remote debugging flag, connect through CDP, or create a localhost debugger for theming. Loopback binding is not an authentication boundary.

On every platform, use Codex's own Appearance controls first. The full artwork requires a documented user-space theme, plugin, pet, or extension hook. If the inspected build does not provide one, applying only the native palette is the safe outcome.

## Change control

Explicit approval is required before:

- restarting or closing Codex;
- creating a login item, LaunchAgent, scheduled task, or other persistence;
- replacing an existing user configuration file rather than merging a narrowly scoped entry.

## Verification

Test home, conversation, settings, diff, approval, long scrolling, narrow width, compact/secondary windows, theme switching, disable, and restore. Verify pointer and keyboard interaction with decorations enabled.

A browser mockup is visual design evidence only. A successful bundle check proves file completeness only. Neither is runtime compatibility evidence.
