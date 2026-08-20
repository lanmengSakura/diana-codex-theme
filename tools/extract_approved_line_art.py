from __future__ import annotations

from pathlib import Path
import sys

from PIL import Image, ImageChops


CROPS = {
    "upper": (990, 35, 1480, 350),
    "lower": (50, 640, 420, 970),
}


def extract_mask(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    crop = image.crop(box).convert("RGB")
    red, green, blue = crop.split()
    green_blue_average = ImageChops.add(green, blue, scale=2.0)
    warm_line_signal = ImageChops.subtract(red, green_blue_average)
    alpha = warm_line_signal.point(
        lambda value: 0 if value <= 9 else min(255, round((value - 9) * 255 / 27))
    )
    alpha = alpha.point(lambda value: 0 if value < 8 else value)
    result = Image.new("RGBA", crop.size, (255, 255, 255, 0))
    result.putalpha(alpha)
    return result


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract_approved_line_art.py SOURCE OUTPUT_DIRECTORY")

    source = Path(sys.argv[1])
    output_directory = Path(sys.argv[2])
    output_directory.mkdir(parents=True, exist_ok=True)
    image = Image.open(source)

    for name, box in CROPS.items():
        output = output_directory / f"diana-line-art-approved-{name}.png"
        mask = extract_mask(image, box)
        mask.save(output, optimize=True)
        alpha = mask.getchannel("A")
        print(
            f"saved={output} size={mask.width}x{mask.height} "
            f"alpha_bbox={alpha.getbbox()} alpha_extrema={alpha.getextrema()}"
        )


if __name__ == "__main__":
    main()
