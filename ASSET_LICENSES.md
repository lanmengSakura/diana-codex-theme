# Asset licenses and attribution

> 本仓库中的嘉然、阿草及相关角色视觉内容均为 A-SOUL 二创内容，仅限非商业用途，请勿用于任何商业化用途。代码、脚本与主题配置的 MIT License 不适用于这些角色、美术及其派生素材。

## Diana character artwork

- Source file: `assets/diana-brand/source/diana-reference.jpg`
- Derived transparent cutout: `assets/diana-brand/derived/diana-corner-cutout-v2.png`
- Derived night colorway: `assets/diana-brand/derived/diana-night-v3.png`
- Approved decorative line source: `docs/concepts/diana-line-art-style-proof-v2.png`
- Derived transparent line masks: `assets/diana-brand/derived/diana-line-art-approved-upper.png` and `diana-line-art-approved-lower.png`
- Approved narrative doodle: `assets/diana-brand/derived/diana-doodle-chalk-v2-approved.png`. Diana Night displays the prepared chalk bitmap with a low-luminance filter; Diana Day uses the same transparent line structure as a berry-colored mask. Earlier colored studies remain reproducibility material and are not the current production layer.
- Hand-drawn star source and rasterized mask: `assets/diana-brand/derived/diana-hand-star-outline.svg` and `diana-hand-star-outline.png`
- Reference-matched ImageGen ornaments: source PNGs `assets/diana-brand/source/diana-hand-star-reference-v2-source.png`, `diana-candy-wrapped-v1-source.png`, and `diana-candy-lollipop-v1-source.png`; production PNGs `assets/diana-brand/derived/diana-hand-star-reference-v2.png`, `diana-candy-wrapped-v1.png`, and `diana-candy-lollipop-v1.png`.
- Left-top heart-and-candy line: ImageGen source `assets/diana-brand/source/diana-left-top-heart-candy-v1-source.png`; trimmed transparent production asset `assets/diana-brand/derived/diana-left-top-heart-candy-v1.png`; optional extracted thin-line mask `diana-left-top-heart-candy-mask-v2.png`.
- Refined left-top corner line: ImageGen source `assets/diana-brand/source/diana-left-top-fine-corner-v4-source.png`; checkerboard-cleaned working PNG `assets/diana-brand/derived/diana-left-top-fine-corner-v4.png`; production mask `diana-left-top-fine-corner-mask-v5.png`. The L-shaped line remains mostly connected, with three restrained gaps and integrated heart/candy motifs.
- Shallow left-top corner line: ImageGen source `assets/diana-brand/source/diana-left-top-shallow-corner-v5-source.png`; checkerboard-cleaned working PNG `assets/diana-brand/derived/diana-left-top-shallow-corner-v5.png`; production mask `diana-left-top-shallow-corner-mask-v6.png`. Its wide, short L-shaped bounds are designed for an approximately `800 × 230 px` top-left work-area zone.
- Detailed left-top corner line: ImageGen source `assets/diana-brand/source/diana-left-top-detailed-corner-v6-source.png`; production working PNG `assets/diana-brand/derived/diana-left-top-detailed-corner-v6.png`; mask `diana-left-top-detailed-corner-mask-v7.png`. It adapts the approved right-top pencil rhythm—primary curve, companion strokes, loop, punctuation dots and selective double outlines—into the same shallow `1600 × 485` left-top bounds.
- Acao mascot doodles: user-supplied character references were used to create `assets/diana-brand/source/acao-heart-v1-source.png` and `acao-cheer-v1-source.png`; normalized transparent production assets are `assets/diana-brand/derived/acao-heart-v1.png` and `acao-cheer-v1.png`. Both preserve the pointed ears, jagged inner-ear marks, squeezed-eye face and signature heart/bow-and-baton cues while adapting them to the approved Diana pencil-chalk line system.
- Refined heart Acao: `assets/diana-brand/source/acao-heart-v3-source.png` and `assets/diana-brand/derived/acao-heart-v3.png` use the slimmer approved body, fine single pencil line and closed smiling mouth while preserving the mascot identity and heart pose.
- ImageGen art-direction studies: `docs/concepts/art-direction/diana-concept-a-paper-theatre.png`, `diana-concept-b-starberry-instrument.png`, and `diana-concept-c-quiet-scene.png`
- Source page asset: <https://storage.moegirl.org.cn/moegirl/commons/3/3c/%E5%98%89%E7%84%B6Diana.jpg>
- Processing: background removal, edge cleanup, a lower-luminance night color grade, paired chalk/colored narrative doodles, and small reference-directed star/candy ornaments with OpenAI ImageGen. The v3 night asset restores the original fine-hair silhouette from the transparent source, removes light edge contamination, and reconstructs a true alpha channel from the generated black matte with deterministic alignment and decontamination. Generated ornaments are deterministically trimmed, deglowed, checkerboard-cleaned, and normalized by `tools/prepare-generated-ornaments.mjs`. No intentional redesign of the full character artwork.
- Use in this repository: non-commercial fan creation only.

The character name, likeness, artwork, and derivative image are **not** covered by this repository's MIT License. Reusers must independently comply with the applicable official fan-creation rules and preserve attribution where required.

## OpenAI / Codex

This repository contains no Codex application binaries, proprietary application assets, or modified installation packages. “Codex” is used only to describe compatibility with the target application. This project is unofficial and is not endorsed by OpenAI.
