import csv
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BASE = Path(__file__).resolve().parent
DATA = BASE / "감정단어카드데이터_v2.csv"
OUT_DIR = BASE / "감정단어카드_디자인시안_v2"
CONTACT = BASE / "감정단어카드_전체미리보기_v2.png"

CARD_W = 420
CARD_H = 600
GAP = 28
MARGIN = 38
COLS = 6


TITLE_FONT_PATHS = [
    Path("C:/Windows/Fonts/HMKMRHD.TTF"),
    Path("C:/Windows/Fonts/GmarketSansTTFBold.ttf"),
    Path("C:/Windows/Fonts/HanSantteutDotum-Bold.ttf"),
    Path("C:/Windows/Fonts/malgunbd.ttf"),
]

BODY_FONT_PATHS = [
    Path("C:/Windows/Fonts/GmarketSansTTFMedium.ttf"),
    Path("C:/Windows/Fonts/HanSantteutDotum-Regular.ttf"),
    Path("C:/Windows/Fonts/NotoSansKR-VF.ttf"),
    Path("C:/Windows/Fonts/malgun.ttf"),
]


def load_font(size: int, candidates):
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def title_font(size: int):
    return load_font(size, TITLE_FONT_PATHS)


def body_font(size: int):
    return load_font(size, BODY_FONT_PATHS)


FONT_DESC = body_font(25)


def text_width(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont) -> int:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def fit_font(draw: ImageDraw.ImageDraw, text: str, max_width: int, start_size: int, min_size: int = 44):
    size = start_size
    while size >= min_size:
        candidate = title_font(size)
        if text_width(draw, text, candidate) <= max_width:
            return candidate
        size -= 2
    return title_font(min_size)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, max_width: int, fnt: ImageFont.ImageFont):
    words = text.split(" ")
    if len(words) <= 1:
        return wrap_long_word(draw, text, max_width, fnt)

    lines = []
    line = ""
    for word in words:
        candidate = word if not line else f"{line} {word}"
        if text_width(draw, candidate, fnt) <= max_width:
            line = candidate
        else:
            if line:
                lines.append(line)
                line = word
            else:
                split_lines = wrap_long_word(draw, word, max_width, fnt)
                lines.extend(split_lines[:-1])
                line = split_lines[-1] if split_lines else ""
    if line:
        lines.append(line)
    return lines


def wrap_long_word(draw: ImageDraw.ImageDraw, text: str, max_width: int, fnt: ImageFont.ImageFont):
    lines = []
    line = ""
    for ch in text:
        candidate = line + ch
        if text_width(draw, candidate, fnt) <= max_width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = ch
    if line:
        lines.append(line)
    return lines


def draw_centered(draw, y, text, fnt, fill, max_width=None, line_gap=8):
    max_width = max_width or CARD_W - 72
    lines = wrap_text(draw, text, max_width, fnt)
    total_h = len(lines) * fnt.size + (len(lines) - 1) * line_gap
    cur_y = y - total_h // 2
    for line in lines:
        box = draw.textbbox((0, 0), line, font=fnt)
        x = (CARD_W - (box[2] - box[0])) // 2
        draw.text((x, cur_y), line, font=fnt, fill=fill)
        cur_y += fnt.size + line_gap


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def make_card(row: dict) -> Image.Image:
    color = row["color"]
    img = Image.new("RGB", (CARD_W, CARD_H), "#F6EFE1")
    draw = ImageDraw.Draw(img)

    rounded_rect(draw, (0, 0, CARD_W - 1, CARD_H - 1), 28, "#FFF9EC", "#D6C39E", 3)
    rounded_rect(draw, (18, 18, CARD_W - 19, CARD_H - 19), 20, "#FFFCF4", "#E6D8BE", 2)
    rounded_rect(draw, (34, 34, CARD_W - 35, CARD_H - 35), 18, "#FFFCF4", color, 5)

    headline_font = fit_font(draw, row["emotion"], CARD_W - 92, 86, 50)
    draw_centered(draw, 252, row["emotion"], headline_font, "#16242B", CARD_W - 86, 10)
    draw.line((82, 336, CARD_W - 82, 336), fill=color, width=5)
    draw_centered(draw, 424, row["description"], FONT_DESC, "#334149", CARD_W - 96, 8)

    return img


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    with DATA.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    cards = []
    for row in rows:
        img = make_card(row)
        out = OUT_DIR / f"{row['id']}_{row['emotion']}.png"
        img.save(out)
        cards.append(img)

    rows_count = (len(cards) + COLS - 1) // COLS
    sheet_w = MARGIN * 2 + COLS * CARD_W + (COLS - 1) * GAP
    sheet_h = MARGIN * 2 + rows_count * CARD_H + (rows_count - 1) * GAP
    sheet = Image.new("RGB", (sheet_w, sheet_h), "#EEE7D8")
    for idx, card in enumerate(cards):
        x = MARGIN + (idx % COLS) * (CARD_W + GAP)
        y = MARGIN + (idx // COLS) * (CARD_H + GAP)
        sheet.paste(card, (x, y))
    sheet.save(CONTACT)
    print(CONTACT)
    print(OUT_DIR)


if __name__ == "__main__":
    main()
