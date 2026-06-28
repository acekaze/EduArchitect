from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path("C:/코딩/교육설계")
FONT_DIR = ROOT / ".codex-work/ai-collab-course-slides/fonts/pretendard/public/static/alternative"
OUT_DIR = ROOT / "output/img/주력강의재설계_후기카드"
SRC = Path("C:/Users/aceka/AppData/Local/Temp/codex-clipboard-ad0299e1-4f2c-4ae5-8e8f-f654abdadb98.png")

MASK = "#FFF200"
BG = "#F4F6F8"
TEXT = "#171717"
MUTED = "#5F6670"


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / name), size=size)


F_EYEBROW = font("Pretendard-SemiBold.ttf", 30)
F_TITLE = font("Pretendard-Bold.ttf", 72)
F_BODY = font("Pretendard-Regular.ttf", 31)

MANUAL_BOXES = [
    (5, 0, 485, 226),
    (535, 6, 765, 229),
    (791, 8, 1237, 263),
    (1268, 0, 1603, 299),
    (0, 292, 514, 543),
    (579, 284, 963, 596),
    (1100, 355, 1597, 554),
    (9, 578, 488, 860),
    (578, 610, 809, 860),
    (1088, 608, 1603, 860),
]


def anonymize(img: Image.Image) -> Image.Image:
    out = img.convert("RGBA").copy()
    draw = ImageDraw.Draw(out)
    # Profile photos and visible user identifiers in the supplied composite.
    ellipses = [
        (12, 13, 68, 69),
        (794, 14, 837, 57),
        (1, 298, 75, 375),
        (1107, 373, 1160, 426),
        (23, 600, 67, 646),
        (23, 671, 67, 716),
        (1110, 625, 1158, 676),
        (1110, 732, 1158, 782),
        (582, 631, 613, 662),
    ]
    rects = [
        (80, 5, 247, 39),
        (851, 12, 947, 45),
        (1314, 9, 1418, 28),
        (70, 304, 222, 330),
        (196, 456, 267, 492),
        (631, 289, 711, 320),
        (631, 351, 805, 380),
        (632, 445, 711, 476),
        (1171, 365, 1230, 394),
        (70, 597, 152, 623),
        (70, 677, 153, 703),
        (1156, 612, 1226, 651),
        (1157, 705, 1225, 739),
        (655, 725, 727, 753),
    ]
    for box in ellipses:
        draw.ellipse(box, fill=MASK)
    for box in rects:
        draw.rounded_rectangle(box, radius=8, fill=MASK)
    return out


def connected_boxes(img: Image.Image) -> list[tuple[int, int, int, int]]:
    arr = np.array(img.convert("RGB"))
    h, w, _ = arr.shape
    mask = np.any(arr > 8, axis=2)
    for _ in range(2):
        expanded = mask.copy()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]:
            expanded |= np.roll(np.roll(mask, dy, axis=0), dx, axis=1)
        mask = expanded

    visited = np.zeros((h, w), dtype=bool)
    boxes: list[tuple[int, int, int, int, int]] = []
    for y in range(h):
        xs = np.where(mask[y] & ~visited[y])[0]
        for x0 in xs:
            if visited[y, x0] or not mask[y, x0]:
                continue
            q: deque[tuple[int, int]] = deque([(int(x0), int(y))])
            visited[y, x0] = True
            minx = maxx = int(x0)
            miny = maxy = int(y)
            count = 0
            while q:
                x, yy = q.popleft()
                count += 1
                minx = min(minx, x)
                maxx = max(maxx, x)
                miny = min(miny, yy)
                maxy = max(maxy, yy)
                for nx, ny in ((x + 1, yy), (x - 1, yy), (x, yy + 1), (x, yy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx] and mask[ny, nx]:
                        visited[ny, nx] = True
                        q.append((nx, ny))
            if count > 1000:
                boxes.append((minx, miny, maxx + 1, maxy + 1, count))
    boxes = sorted(boxes, key=lambda b: (b[1], b[0]))
    return [(x1, y1, x2, y2) for x1, y1, x2, y2, _ in boxes]


def crop_cards(redacted: Image.Image) -> list[Image.Image]:
    cards: list[Image.Image] = []
    for x1, y1, x2, y2 in MANUAL_BOXES:
        pad = 2
        box = (max(0, x1 - pad), max(0, y1 - pad), min(redacted.width, x2 + pad), min(redacted.height, y2 + pad))
        cards.append(redacted.crop(box).convert("RGBA"))
    return cards


def add_shadow_card(canvas: Image.Image, card: Image.Image, xy: tuple[int, int], target_w: int) -> int:
    ratio = target_w / card.width
    resized = card.resize((target_w, int(card.height * ratio)), Image.Resampling.LANCZOS)
    radius = 18
    mask = Image.new("L", resized.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, resized.width - 1, resized.height - 1), radius=radius, fill=255)

    shadow = Image.new("RGBA", (resized.width + 32, resized.height + 32), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((16, 16, 16 + resized.width, 16 + resized.height), radius=radius, fill=(0, 0, 0, 55))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))

    x, y = xy
    rounded = Image.new("RGBA", resized.size, (0, 0, 0, 0))
    rounded.alpha_composite(resized, (0, 0))
    rounded.putalpha(mask)

    canvas.alpha_composite(shadow, (x - 16, y - 10))
    canvas.alpha_composite(rounded, (x, y))
    return resized.height


def text_w(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def draw_centered(draw: ImageDraw.ImageDraw, y: int, text: str, fnt: ImageFont.FreeTypeFont, fill: str, width: int) -> None:
    draw.text(((width - text_w(draw, text, fnt)) // 2, y), text, font=fnt, fill=fill)


def build_page(cards_: list[Image.Image]) -> Path:
    page_w = 1600
    margin = 88
    gap = 34
    col_w = (page_w - margin * 2 - gap) // 2

    # Preserve the original visual order while balancing the two columns.
    columns: list[list[int]] = [[0, 1, 4, 7, 8], [2, 3, 5, 6, 9]]
    heights = [0, 0]
    scaled_heights: dict[int, int] = {}
    for col_idx, ids in enumerate(columns):
        for idx in ids:
            card = cards_[idx]
            h = int(card.height * col_w / card.width)
            scaled_heights[idx] = h
            heights[col_idx] += h + gap
    content_h = max(heights) - gap
    page_h = 330 + content_h + 92

    canvas = Image.new("RGBA", (page_w, page_h), BG)
    draw = ImageDraw.Draw(canvas)
    draw_centered(draw, 62, "실전 적용 후기", F_EYEBROW, "#2E7D52", page_w)
    draw_centered(draw, 112, "적용하자 바로 반응이 왔습니다", F_TITLE, TEXT, page_w)
    draw_centered(draw, 198, "강의와 콘텐츠에 적용한 뒤 받은 실제 카톡 메시지입니다.", F_BODY, MUTED, page_w)

    y_base = 300
    for col_idx, ids in enumerate(columns):
        x = margin + col_idx * (col_w + gap)
        y = y_base
        for idx in ids:
            used_h = add_shadow_card(canvas, cards_[idx], (x, y), col_w)
            y += used_h + gap

    out = OUT_DIR / "카톡_실전활용후기_페이지_익명처리.png"
    canvas.convert("RGB").save(out, quality=96)
    return out


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC)
    redacted = anonymize(src)
    collage_out = OUT_DIR / "카톡_실전활용후기_원본콜라주_익명처리.png"
    redacted.convert("RGB").save(collage_out, quality=96)
    cards_ = crop_cards(redacted)
    page_out = build_page(cards_)
    print(collage_out)
    print(page_out)


if __name__ == "__main__":
    main()
