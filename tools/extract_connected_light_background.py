from __future__ import annotations

from collections import deque
from pathlib import Path
import sys

from PIL import Image


def is_background_candidate(pixel: tuple[int, int, int]) -> bool:
    red, green, blue = pixel
    return min(pixel) >= 220 and max(pixel) - min(pixel) <= 18


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract_connected_light_background.py INPUT OUTPUT")

    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    image = Image.open(source).convert("RGB")
    width, height = image.size
    pixels = image.load()
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if visited[index] or not is_background_candidate(pixels[x, y]):
            return
        visited[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    rgba = image.convert("RGBA")
    rgba_pixels = rgba.load()
    removed = 0
    for y in range(height):
        row_offset = y * width
        for x in range(width):
            if visited[row_offset + x]:
                red, green, blue, _ = rgba_pixels[x, y]
                rgba_pixels[x, y] = (red, green, blue, 0)
                removed += 1

    destination.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(destination, optimize=True)
    print(f"saved={destination}")
    print(f"size={width}x{height}")
    print(f"transparent_pixels={removed} ({removed / (width * height):.1%})")
    print(f"corner_alphas={[rgba.getpixel(point)[3] for point in ((0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1))]}")


if __name__ == "__main__":
    main()
