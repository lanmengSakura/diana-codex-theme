# macOS deployment

## Status

This route is experimental and has not been verified on real macOS hardware. The goal is not to assume that the Windows adapter works on macOS. The goal is to give Codex the finalized visual assets and a safe decision procedure for the Mac installation in front of it.

## Expected user request

A user may install this standalone skill and ask:

> 使用 Diana Skill 帮我部署暗夜主题。

or:

> 使用 Diana Skill 帮我部署日间主题。

Treat that request as authorization to inspect and prepare a reversible user-space deployment. It is not authorization to modify the application bundle, restart Codex, or create persistence without confirmation.

## Procedure

1. Run `node scripts/verify-bundle.mjs` when Node.js is available. If it is not, manually confirm the files listed in [visual-system.md](visual-system.md).
2. Record the Mac architecture, macOS version, exact Codex version, distribution, application path, and active appearance.
3. Inspect Codex settings and user-writable support/configuration directories. Search for a supported appearance, theme, plugin, extension, custom-CSS, or user-style hook.
4. Inspect the current renderer and launch interface read-only only when needed. Do not assume Windows process names, MSIX paths, command flags, ports, or DOM selectors.
5. Prefer an official or documented user-space hook. Copy the selected blueprint and only its local images to a dedicated Diana directory in the user's writable application-support or configuration area.
6. Adapt only selectors, font fallbacks, and paths required by the inspected Mac build. Preserve theme tokens, artwork, placement relationships, `pointer-events: none`, and the host scope.
7. Create a restore record containing every new path, every changed user file, the original values, and the disable procedure.
8. Ask before restarting Codex, adding launch arguments, opening a debugging port, or installing a LaunchAgent/login item.
9. After activation, verify the full state matrix in [runtime-safety.md](runtime-safety.md), then disable and restore once to prove recovery.

## Hard boundaries

Never write to or re-sign:

- `/Applications/*.app`;
- `Contents/Resources`, `app.asar`, frameworks, helpers, or executables inside a `.app`;
- `_CodeSignature`, entitlements, quarantine metadata, or Gatekeeper state.

Never use a network-exposed debugging endpoint, remote CSS/image URL, analytics code, or a general-purpose remote script.

Do not create a LaunchAgent or other auto-start mechanism as part of the first deployment. Offer persistence only after one clean manual enable/disable/restore cycle and obtain explicit approval.

## Fallback decision

If the inspected Codex build exposes no safe, reversible, user-space styling hook, stop and report:

> Diana 的日夜素材与样式蓝图已经就绪，但当前 macOS Codex 未发现经过验证的安全部署入口；本次没有修改应用包或签名文件。

This is a valid outcome. Do not downgrade the safety boundary merely to make the theme appear.

## Success report

Report:

- exact Codex and macOS versions;
- selected day/night variant;
- all created or changed user-space paths;
- the hook used and whether it is official, documented, or inspected-but-undocumented;
- tested states and any omitted decoration;
- disable and restore commands;
- whether restart persistence was tested.

Continue to label macOS support experimental until a real Mac verification record covers enable, restart, disable, and restore.
