---
name: diana-codex-theme
description: Build, refine, preview, validate, package, apply, troubleshoot, or restore the Diana/Jiaran Codex desktop light and dark themes. Use for this repository's theme tokens, local character assets, scoped CSS, compatibility records, reversible CDP workflows, screenshots, release checks, and non-commercial asset attribution.
---

# Diana Codex Theme

Keep Codex usable first and let Diana appear as a quiet corner companion. Maintain independent day and night variants, local-only assets, large whitespace, and a reversible path.

## Read the relevant reference

- Read [visual-system.md](references/visual-system.md) before changing colors, layout, character scale, opacity, or controls.
- Read [runtime-safety.md](references/runtime-safety.md) before inspecting or applying styles to the real Codex desktop app.

## Validate before handoff

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/validate-theme.ps1
```

Then render at least:

- dark home at 1440 × 900;
- light conversation at 1440 × 900;
- one 375 px-wide mobile preview.

Inspect the screenshots, not only the DOM. Confirm that the local PNG is truly transparent and that the character layer cannot receive pointer events.

## Visual workflow

1. Preserve the token relationships in the visual reference unless the user approves a new direction.
2. Edit both light and dark variants together.
3. Use the local derived cutout; do not hotlink images.
4. Keep decorative artwork below task content and outside the composer.
5. Update the browser preview before changing a runtime adapter.
6. Record any compatibility claim with the tested Codex version.

## Runtime workflow

1. Inspect the real application read-only and record its version.
2. Map native colors through Appearance settings where possible.
3. Validate scoped selectors against home, conversation, diff, settings, approval, and error states.
4. Show enable, disable, and restore steps before applying an enhancement.
5. Ask before restarting Codex or enabling a debugging port.
6. Recheck after restart and verify that restore leaves no residue.

## Guardrails

- Never patch `WindowsApps`, `app.asar`, application signatures, or bundled Codex files.
- Never inject JavaScript, analytics, remote CSS, or remote image URLs.
- Never claim compatibility from a mockup or screenshot alone.
- Keep all runtime selectors below an explicit host scope.
- Keep code licensing separate from character-art licensing.
