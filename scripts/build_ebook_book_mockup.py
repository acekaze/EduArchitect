from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path("C:/코딩/교육설계")
COVER = ROOT / "output/img/무료라이브특강_전자책_표지_전환설계연구소_X_ropefree_v4.png"
OUT_DIR = ROOT / "output/img"
OUT_TRANSPARENT = OUT_DIR / "무료라이브특강_전자책_표지_3D북목업_v4.png"
OUT_WHITE = OUT_DIR / "무료라이브특강_전자책_표지_3D북목업_화이트배경_v4.png"

CANVAS_W, CANVAS_H = 1500, 1800


def solve_linear_system(matrix: list[list[float]], vector: list[float]) -> list[float]:
    n = len(vector)
    a = [row[:] + [value] for row, value in zip(matrix, vector)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda row: abs(a[row][col]))
        a[col], a[pivot] = a[pivot], a[col]
        pivot_value = a[col][col]
        if abs(pivot_value) < 1e-12:
            raise ValueError("Perspective matrix is singular")
        for j in range(col, n + 1):
            a[col][j] /= pivot_value
        for row in range(n):
            if row == col:
                continue
            factor = a[row][col]
            for j in range(col, n + 1):
                a[row][j] -= factor * a[col][j]
    return [a[row][n] for row in range(n)]


def perspective_coeffs(destination: list[tuple[float, float]], source: list[tuple[float, float]]) -> list[float]:
    matrix: list[list[float]] = []
    vector: list[float] = []
    for (x, y), (u, v) in zip(destination, source):
        matrix.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        matrix.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        vector.extend([u, v])
    return solve_linear_system(matrix, vector)


def warp_to_quad(image: Image.Image, quad: list[tuple[int, int]], size: tuple[int, int]) -> Image.Image:
    source = [(0, 0), (image.width, 0), (image.width, image.height), (0, image.height)]
    coeffs = perspective_coeffs(quad, source)
    return image.transform(
        size,
        Image.Transform.PERSPECTIVE,
        coeffs,
        Image.Resampling.BICUBIC,
        fillcolor=(0, 0, 0, 0),
    )


def add_page_lines(draw: ImageDraw.ImageDraw, top_right: tuple[int, int], bottom_right: tuple[int, int]) -> None:
    x1, y1 = top_right
    x2, y2 = bottom_right
    for offset, alpha in ((4, 38), (10, 30), (17, 23), (24, 18)):
        draw.line((x1 + offset, y1 + offset // 4, x2 + offset, y2 - offset // 5), fill=(174, 179, 184, alpha), width=2)


def alpha_gradient(size: tuple[int, int]) -> Image.Image:
    w, h = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    pixels = layer.load()
    for x in range(w):
        left = max(0, int(20 * (1 - x / (w * 0.28))))
        right = max(0, int(24 * ((x - w * 0.76) / (w * 0.24))))
        alpha = max(left, right)
        if alpha:
            for y in range(h):
                pixels[x, y] = (0, 0, 0, alpha)
    return layer


def build_mockup() -> None:
    if not COVER.exists():
        raise FileNotFoundError(COVER)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    cover = Image.open(COVER).convert("RGBA")
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (255, 255, 255, 0))

    front_h = 1320
    front_w = int(front_h * cover.width / cover.height)
    x, y = 145, 100
    depth = 38
    slant = 18
    front_rect = (x, y, x + front_w, y + front_h)
    side = [
        (x + front_w, y + 14),
        (x + front_w + depth, y + slant),
        (x + front_w + depth, y + front_h - slant),
        (x + front_w, y + front_h),
    ]
    outer_edge = [
        (x + front_w + depth, y + slant),
        (x + front_w + depth + 14, y + slant + 8),
        (x + front_w + depth + 14, y + front_h - slant - 8),
        (x + front_w + depth, y + front_h - slant),
    ]
    top = [
        (x, y),
        (x + front_w, y + 14),
        (x + front_w + depth, y + slant),
        (x + 58, y + 22),
    ]

    shadow = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_poly = [
        (front_rect[0] + 48, front_rect[1] + 52),
        (outer_edge[0][0] + 50, outer_edge[0][1] + 52),
        (outer_edge[2][0] + 58, outer_edge[2][1] + 58),
        (front_rect[0] + 58, front_rect[3] + 58),
    ]
    shadow_draw.polygon(shadow_poly, fill=(0, 0, 0, 34))
    shadow = shadow.filter(ImageFilter.GaussianBlur(34))
    canvas.alpha_composite(shadow)

    draw = ImageDraw.Draw(canvas)
    draw.polygon(outer_edge, fill=(230, 230, 226, 255))
    draw.polygon(side, fill=(250, 250, 247, 255))
    add_page_lines(draw, side[1], side[2])
    draw.polygon(top, fill=(246, 246, 243, 255))

    cover_front = cover.resize((front_w, front_h), Image.Resampling.LANCZOS)
    cover_front.alpha_composite(alpha_gradient((front_w, front_h)))
    canvas.alpha_composite(cover_front, (x, y))

    draw = ImageDraw.Draw(canvas)
    draw.line((x, y, x, y + front_h), fill=(0, 0, 0, 70), width=3)
    draw.line((x + front_w, y, x + front_w, y + front_h), fill=(0, 0, 0, 72), width=2)
    draw.line((x, y + front_h, x + front_w, y + front_h), fill=(0, 0, 0, 62), width=2)
    draw.line((x, y, x + front_w, y), fill=(0, 0, 0, 52), width=2)
    draw.line((side[1], side[2]), fill=(120, 120, 116, 58), width=1)

    bbox = canvas.getbbox()
    if bbox:
        left = max(0, bbox[0] - 90)
        top = max(0, bbox[1] - 70)
        right = min(CANVAS_W, bbox[2] + 100)
        bottom = min(CANVAS_H, bbox[3] + 80)
        canvas = canvas.crop((left, top, right, bottom))

    canvas.save(OUT_TRANSPARENT)
    white = Image.new("RGB", canvas.size, "#FFFFFF")
    white.paste(canvas, mask=canvas.getchannel("A"))
    white.save(OUT_WHITE, quality=96)


def main() -> None:
    build_mockup()
    print(OUT_TRANSPARENT)
    print(OUT_WHITE)


if __name__ == "__main__":
    main()
