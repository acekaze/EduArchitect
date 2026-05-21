import csv
import math
from pathlib import Path

from PIL import Image, ImageDraw, JpegImagePlugin  # noqa: F401


BASE = Path(__file__).resolve().parent
CARD_DIR = BASE / "팀등불_AI카드디자인시안_v1"
LANTERN_DIR = CARD_DIR / "등불카드"
SCORE_DIR = CARD_DIR / "빛조각카드"
BACK_CARD = BASE / "팀등불_AI카드뒷면_시안_v1.png"
LANTERN_DATA = BASE / "팀등불_등불카드데이터_v1.csv"
SCORE_DATA = BASE / "팀등불_빛조각카드데이터_v1.csv"
OUT_DIR = BASE / "팀등불_인쇄용_A4_v1"
PAGE_DIR = OUT_DIR / "페이지PNG"

DPI = 300
A4_W = round(210 / 25.4 * DPI)
A4_H = round(297 / 25.4 * DPI)
CARD_W = round(70 / 25.4 * DPI)
CARD_H = round(100 / 25.4 * DPI)
GAP_X = round(18 / 25.4 * DPI)
GAP_Y = round(22 / 25.4 * DPI)
MARK_LEN = round(5 / 25.4 * DPI)

POSITIONS = [
    (
        round((A4_W - CARD_W * 2 - GAP_X) / 2) + col * (CARD_W + GAP_X),
        round((A4_H - CARD_H * 2 - GAP_Y) / 2) + row * (CARD_H + GAP_Y),
    )
    for row in range(2)
    for col in range(2)
]


def read_rows(path: Path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def find_card(folder: Path, card_id: str) -> Path:
    matches = sorted(folder.glob(f"{card_id}_*.png"))
    if not matches:
        raise FileNotFoundError(f"No card image for {card_id} in {folder}")
    return matches[0]


def draw_crop_marks(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int):
    color = "#222222"
    width = 2
    corners = [
        (x, y, -1, -1),
        (x + w, y, 1, -1),
        (x, y + h, -1, 1),
        (x + w, y + h, 1, 1),
    ]
    for cx, cy, sx, sy in corners:
        draw.line((cx, cy, cx + sx * MARK_LEN, cy), fill=color, width=width)
        draw.line((cx, cy, cx, cy + sy * MARK_LEN), fill=color, width=width)


def make_page(card_paths, page_number: int, prefix: str) -> Image.Image:
    page = Image.new("RGB", (A4_W, A4_H), "#FFFFFF")
    draw = ImageDraw.Draw(page)
    for idx, card_path in enumerate(card_paths):
        x, y = POSITIONS[idx]
        card = Image.open(card_path).convert("RGB").resize((CARD_W, CARD_H), Image.LANCZOS)
        page.paste(card, (x, y))
        draw_crop_marks(draw, x, y, CARD_W, CARD_H)
    out = PAGE_DIR / f"{prefix}_{page_number:02d}.png"
    page.save(out, dpi=(DPI, DPI))
    return page


def chunked(items, size):
    for idx in range(0, len(items), size):
        yield items[idx : idx + size]


def save_pdf(pages, path: Path):
    if not pages:
        return
    pages[0].save(path, save_all=True, append_images=pages[1:], resolution=DPI)


def make_back_pages(page_count: int, prefix: str):
    return [make_page([BACK_CARD] * 4, idx + 1, prefix) for idx in range(page_count)]


def make_front_pages(card_paths, prefix: str):
    pages = []
    for idx, group in enumerate(chunked(card_paths, 4), 1):
        pages.append(make_page(group, idx, prefix))
    return pages


def make_lantern_paths():
    return [find_card(LANTERN_DIR, row["id"]) for row in read_rows(LANTERN_DATA)]


def make_score_paths():
    paths = []
    for row in read_rows(SCORE_DATA):
        path = find_card(SCORE_DIR, row["id"])
        paths.extend([path] * int(row["count"]))
    return paths


def save_set(name: str, card_paths):
    front_pages = make_front_pages(card_paths, f"{name}_앞면")
    back_pages = make_back_pages(len(front_pages), f"{name}_뒷면")
    duplex_pages = []
    for front, back in zip(front_pages, back_pages):
        duplex_pages.append(front)
        duplex_pages.append(back)

    save_pdf(front_pages, OUT_DIR / f"팀등불_{name}_A4_앞면_v1.pdf")
    save_pdf(back_pages, OUT_DIR / f"팀등불_{name}_A4_뒷면_v1.pdf")
    save_pdf(duplex_pages, OUT_DIR / f"팀등불_{name}_A4_앞뒤교차_v1.pdf")
    return front_pages, back_pages, duplex_pages


def make_preview(front_a, back_a, front_b):
    thumb_w = 360
    thumb_h = round(thumb_w * A4_H / A4_W)
    gap = 28
    margin = 32
    sheet = Image.new("RGB", (margin * 2 + thumb_w * 3 + gap * 2, margin * 2 + thumb_h), "#E7DECB")
    for idx, page in enumerate([front_a, back_a, front_b]):
        thumb = page.resize((thumb_w, thumb_h), Image.LANCZOS)
        x = margin + idx * (thumb_w + gap)
        sheet.paste(thumb, (x, margin))
    sheet.save(OUT_DIR / "팀등불_A4인쇄용_페이지미리보기_v1.png")


def main():
    OUT_DIR.mkdir(exist_ok=True)
    PAGE_DIR.mkdir(exist_ok=True)

    lantern_front, lantern_back, _ = save_set("등불카드", make_lantern_paths())
    score_front, _, _ = save_set("빛조각카드", make_score_paths())
    make_preview(lantern_front[0], lantern_back[0], score_front[0])

    print(OUT_DIR)
    print(OUT_DIR / "팀등불_등불카드_A4_앞뒤교차_v1.pdf")
    print(OUT_DIR / "팀등불_빛조각카드_A4_앞뒤교차_v1.pdf")
    print(OUT_DIR / "팀등불_A4인쇄용_페이지미리보기_v1.png")


if __name__ == "__main__":
    main()
