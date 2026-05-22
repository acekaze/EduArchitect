import csv
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BASE = Path(__file__).resolve().parent
DATA = BASE / "감정신호카드데이터_v1.csv"
OUT_DIR = BASE / "감정신호카드_디자인시안_v1"
CONTACT = BASE / "감정신호카드_전체미리보기_v1.png"

CARD_W = 420
CARD_H = 600
GAP = 28
MARGIN = 38
COLS = 6


def font(size: int, bold: bool = False):
    candidates = [
        Path("C:/Windows/Fonts/malgunbd.ttf") if bold else Path("C:/Windows/Fonts/malgun.ttf"),
        Path("C:/Windows/Fonts/malgun.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


FONT_SMALL = font(18)
FONT_BODY = font(22)
FONT_BODY_BOLD = font(22, True)
FONT_LABEL = font(20, True)
FONT_TITLE = font(58, True)
FONT_CAT = font(24, True)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, max_width: int, fnt: ImageFont.ImageFont):
    words = list(text)
    lines = []
    line = ""
    for ch in words:
        candidate = line + ch
        if draw.textbbox((0, 0), candidate, font=fnt)[2] <= max_width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = ch
    if line:
        lines.append(line)
    return lines


def draw_wrapped(draw, xy, text, max_width, fnt, fill, line_gap=7):
    x, y = xy
    for line in wrap_text(draw, text, max_width, fnt):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + line_gap
    return y


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def make_card(row: dict) -> Image.Image:
    color = row["color"]
    img = Image.new("RGB", (CARD_W, CARD_H), "#F8F2E6")
    draw = ImageDraw.Draw(img)

    rounded_rect(draw, (0, 0, CARD_W - 1, CARD_H - 1), 28, "#FFFBF0", "#D9C8A6", 3)
    rounded_rect(draw, (18, 18, CARD_W - 19, CARD_H - 19), 20, "#FFF9EC", "#E7D7B8", 2)
    rounded_rect(draw, (18, 18, CARD_W - 19, 112), 20, color, None, 0)
    draw.rectangle((18, 74, CARD_W - 19, 112), fill=color)

    draw.text((34, 35), row["category"], font=FONT_CAT, fill="#FFFFFF")
    id_box = draw.textbbox((0, 0), row["id"], font=FONT_SMALL)
    draw.text((CARD_W - 34 - (id_box[2] - id_box[0]), 38), row["id"], font=FONT_SMALL, fill="#FCEFD2")

    draw.text((34, 142), row["emotion"], font=FONT_TITLE, fill="#17242B")
    y = 226
    y = draw_wrapped(draw, (36, y), row["short_description"], CARD_W - 72, FONT_BODY, "#334149", 8)

    y += 24
    rounded_rect(draw, (34, y, CARD_W - 34, y + 96), 16, "#F0E6CF", None, 0)
    draw.text((54, y + 18), "필요", font=FONT_LABEL, fill=color)
    draw_wrapped(draw, (118, y + 17), row["need"], CARD_W - 160, FONT_BODY_BOLD, "#17242B", 6)

    y += 118
    rounded_rect(draw, (34, y, CARD_W - 34, CARD_H - 46), 16, "#FFFFFF", "#E4D8C1", 2)
    draw.text((54, y + 20), "다음 행동", font=FONT_LABEL, fill=color)
    draw_wrapped(draw, (54, y + 58), row["next_action"], CARD_W - 108, FONT_BODY, "#26343B", 7)

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
