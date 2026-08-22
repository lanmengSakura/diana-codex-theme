# Compatibility status

## Current baseline

- Operating system: Windows 11
- Codex distribution: Microsoft Store / MSIX
- Locally inspected version: `26.814.5517.0`
- Theme release: `0.2.4`
- Visual status: Diana Night and Diana Day finalized
- Desktop status: native color recipe + visual blueprint; no executable injector

## Windows Terminal status

- Required version: Windows Terminal `1.24` or newer
- Locally verified version: `1.24.11911.0`
- Profiles: `Diana PowerShell` and `Diana CMD`
- Install modes: independent profiles, or current-user default with reversible `defaultProfile` backup
- Script entry: `.cmd`, `.bat`, and `.ps1` can use a generated shortcut that explicitly selects a Diana profile
- Default-terminal boundary: direct shell handoff may open Windows Terminal without selecting a Diana profile; use the generated shortcut when the full background must be guaranteed
- Runtime cost: one local static PNG; no watcher, animation, Acrylic, pixel shader, or background process

## Codex desktop status

- Safe supported layer: native Appearance colors and fonts
- Full corner artwork: targeted by default; use a documented user-space hook when available, otherwise the skill may propose a user-approved, machine-local experimental adapter
- Background processes: none
- Debugging endpoints: none in the repository or release; a local experiment may be generated only after notification and explicit user approval
- Persistence: none
- Legacy migration: use `npm run security:remove-legacy`, restart Codex normally, then run `npm run security:audit`

## Skill installation status

- Deterministic route: use the bundled `$skill-installer` with `https://github.com/lanmengSakura/diana-codex-theme/tree/main/skills/diana-codex-theme`.
- Activation boundary: invoke `$diana-codex-theme` in the next message after installation.
- Release ZIP: offline/manual fallback only; attaching it to a task does not itself prove registration.
- Success boundary: Skill availability, native palette deployment, and complete artwork mounting are separate states.

The public release deliberately does not claim that the full simulated desktop artwork can currently be installed through an official hook. Online screenshots remain visual design references. A user-generated experimental adapter is local, opt-in after notification, version-specific, and outside the release compatibility claim.

## macOS status

- Support level: experimental, agent-assisted only
- Real-device verification: not performed
- Distribution: self-contained `skills/diana-codex-theme` bundle
- Deployment rule: use native Appearance first; inspect the current Codex build only for a documented, reversible user-space hook

The macOS path is not a port of the Windows launcher and is not a compatibility claim. The skill carries the finalized artwork and CSS blueprints, but Codex must inspect the Mac installation in front of it. If no safe hook exists, it must leave the application bundle and signature untouched and report that deployment was not performed.

## Legacy runtime record (retired in v0.2.2)

The former Diana runtime adapter was visually verified against Microsoft Store build `26.814.5517.0`, but it depended on unauthenticated loopback CDP and is no longer a supported or distributed deployment route.

- A loopback-only bind prevented direct LAN and Internet access, but did not authenticate other local processes.
- The desktop launcher, watcher, scheduled task, package dependency, and release attachments were removed in `v0.2.2`.
- The visual implementation remains available as local artwork, native color values, CSS blueprints, and the independent preview.

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
3. No new listener, debugging launch flag, watcher, or persistence.
4. A clean disable and restore path with no residue.

Do not claim a new full-art desktop deployment until its supported extension point and security boundary have both been independently verified.
