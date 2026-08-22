# Architecture

The project is split into safe visual blueprints, a static showcase, a self-contained Skill, and a verified Windows Terminal package.

## 1. Visual blueprints

`themes/diana-dark` and `themes/diana-light` contain:

- `theme.json`: native Appearance values and the complete local artwork map;
- `theme.css`: a host-scoped reference implementation for the finalized layout.

These files are design inputs, not executable installers. The CSS requires an adapter supplied by a documented theme, plugin, pet, extension, or user-style interface in the target Codex build.

## 2. Safe deployment boundary

The public release does not launch Codex, add command-line flags, open a debugging port, connect through CDP, run a watcher, or create persistence.

The supported decision order is:

1. Apply Diana colors through Codex's native Appearance controls.
2. Inspect the current build for a documented user-space visual extension point.
3. Use the full local artwork only when that extension point is reversible and does not weaken the application boundary.
4. If no safe extension point exists, stop at the native palette.

Versions `0.1.0` through `0.2.1` used a loopback CDP runtime. That implementation was removed in `0.2.2` because loopback is not an authentication boundary and another local process could use the same privileged debugger.

## 3. Simulated showcase

`preview/index.html` is an independent 1920×1080 interface simulation. It references the same final artwork and mirrors the intended theme parameters, but it does not connect to Codex or read local tasks.

## 4. Windows Terminal

`terminal/diana-terminal` uses a Windows Terminal Fragment and one local static PNG. It has no background worker, animation, shader, debugger, network dependency, or Codex process access.

## Safety boundaries

- Never modify `app.asar`, MSIX contents, signatures, `WindowsApps`, or a macOS `.app` bundle.
- Never launch Codex with `--remote-debugging-port` or connect through CDP for theming.
- Never install a watcher, scheduled task, login item, or LaunchAgent for the visual layer.
- Never inject analytics, remote CSS, remote images, or arbitrary scripts.
- Keep decorative layers non-interactive and below the reading hierarchy.
- Keep the preview clearly labeled as a simulation.
