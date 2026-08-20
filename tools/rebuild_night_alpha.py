from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Rebuild a clean night-asset alpha channel from a trusted silhouette guide."
    )
    parser.add_argument("source", type=Path, help="Night-colour RGB image on black")
    parser.add_argument("guide", type=Path, help="Trusted RGBA silhouette reference")
    parser.add_argument("output", type=Path, help="Destination RGBA PNG")
    return parser.parse_args()


def transform_alpha(
    alpha: np.ndarray,
    width: int,
    height: int,
    scale: float,
    dx: float,
    dy: float,
    interpolation: int,
) -> np.ndarray:
    centre_x = (width - 1) / 2
    centre_y = (height - 1) / 2
    matrix = cv2.getRotationMatrix2D((centre_x, centre_y), 0, scale)
    matrix[0, 2] += dx
    matrix[1, 2] += dy
    return cv2.warpAffine(
        alpha,
        matrix,
        (width, height),
        flags=interpolation,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0,
    )


def main() -> None:
    args = parse_args()
    source = np.array(Image.open(args.source).convert("RGB"), dtype=np.uint8)
    source_height, source_width = source.shape[:2]

    guide = Image.open(args.guide).convert("RGBA")
    guide_alpha = np.array(guide.getchannel("A"), dtype=np.uint8)
    if guide_alpha.shape != (source_height, source_width):
        guide_alpha = cv2.resize(
            guide_alpha,
            (source_width, source_height),
            interpolation=cv2.INTER_LINEAR,
        )

    # The generated edit is black-matted. Pixels above this tiny signal level
    # provide a stable registration target without treating black as alpha.
    signal = source.max(axis=2) > 18

    best_score = -1.0
    best = (1.0, 0, 0)
    for scale in np.arange(0.9925, 1.0126, 0.0025):
        for dx in range(-6, 7):
            for dy in range(-6, 7):
                candidate = transform_alpha(
                    guide_alpha,
                    source_width,
                    source_height,
                    float(scale),
                    dx,
                    dy,
                    cv2.INTER_NEAREST,
                ) > 8
                intersection = np.count_nonzero(candidate & signal)
                score = (2 * intersection) / (
                    np.count_nonzero(candidate) + np.count_nonzero(signal)
                )
                if score > best_score:
                    best_score = score
                    best = (float(scale), dx, dy)

    alpha = transform_alpha(
        guide_alpha,
        source_width,
        source_height,
        *best,
        interpolation=cv2.INTER_LINEAR,
    )

    # Reject only near-perfect black where the guide and edited silhouette
    # disagree. This avoids black chips while retaining very dark hair strands.
    alpha[(source.max(axis=2) <= 3) & (alpha < 224)] = 0

    # Undo the black matte for antialiased edge pixels. Interior RGB stays exact.
    rgb = source.astype(np.float32)
    alpha_float = alpha.astype(np.float32) / 255.0
    edge = (alpha > 0) & (alpha < 255)
    rgb[edge] = np.clip(rgb[edge] / alpha_float[edge, None], 0, 255)
    rgb[alpha == 0] = 0

    rgba = np.dstack((rgb.round().astype(np.uint8), alpha))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(args.output, optimize=True)

    corners = [
        int(alpha[0, 0]),
        int(alpha[0, -1]),
        int(alpha[-1, 0]),
        int(alpha[-1, -1]),
    ]
    print(f"saved={args.output}")
    print(f"size={source_width}x{source_height}")
    print(f"registration=scale:{best[0]:.4f},dx:{best[1]},dy:{best[2]}")
    print(f"registration_dice={best_score:.5f}")
    print(f"corner_alphas={corners}")


if __name__ == "__main__":
    main()
