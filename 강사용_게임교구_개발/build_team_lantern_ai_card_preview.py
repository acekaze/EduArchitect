import csv
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BASE = Path(__file__).resolve().parent
SOURCE_DIR = BASE / "팀등불_AI이미지소스_v1"
LANTERN_DATA = BASE / "팀등불_등불카드데이터_v1.csv"
LIGHT_DATA = BASE / "팀등불_빛조각카드데이터_v1.csv"

FRONT_BG = SOURCE_DIR / "팀등불_등불카드_앞면배경_AI_v1.png"
SCORE_BG = SOURCE_DIR / "팀등불_빛조각카드_배경_AI_v1.png"
BACK_BG = SOURCE_DIR / "팀등불_카드뒷면_배경_AI_v1.png"

OUT_DIR = BASE / "팀등불_AI카드디자인시안_v1"
FRONT_DIR = OUT_DIR / "등불카드"
SCORE_DIR = OUT_DIR / "빛조각카드"
LANTERN_CONTACT = BASE / "팀등불_AI등불카드_전체미리보기_v1.png"
SCORE_CONTACT = BASE / "팀등불_AI빛조각카드_전체미리보기_v1.png"
BACK_OUT = BASE / "팀등불_AI카드뒷면_시안_v1.png"

CARD_W = 1050
CARD_H = 1500

TITLE_FONT_PATHS = [
    Path("C:/Windows/Fonts/GmarketSansTTFBold.ttf"),
    Path("C:/Windows/Fonts/HMKMRHD.TTF"),
    Path("C:/Windows/Fonts/HanSantteutDotum-Bold.ttf"),
    Path("C:/Windows/Fonts/malgunbd.ttf"),
]

BODY_FONT_PATHS = [
    Path("C:/Windows/Fonts/GmarketSansTTFMedium.ttf"),
    Path("C:/Windows/Fonts/HanSantteutDotum-Regular.ttf"),
    Path("C:/Windows/Fonts/NotoSansKR-VF.ttf"),
    Path("C:/Windows/Fonts/malgun.ttf"),
]

CATEGORY_COLORS = {
    "듣기": "#276F73",
    "협업": "#3E5F9F",
    "실행": "#A86F2C",
    "사고": "#805199",
    "전환": "#4C8358",
    "분위기": "#B95F6D",
}


def load_font(size: int, paths):
    for path in paths:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def title_font(size: int):
    return load_font(size, TITLE_FONT_PATHS)


def body_font(size: int):
    return load_font(size, BODY_FONT_PATHS)


def load_background(path: Path) -> Image.Image:
    img = Image.open(path).convert("RGB")
    return img.resize((CARD_W, CARD_H), Image.LANCZOS)


def read_csv(path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def text_width(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def wrap_long_word(draw, text, max_width, fnt):
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


def wrap_text(draw, text, max_width, fnt):
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
                split = wrap_long_word(draw, word, max_width, fnt)
                lines.extend(split[:-1])
                line = split[-1] if split else ""
    if line:
        lines.append(line)
    return lines


def fit_multiline(draw, text, max_width, max_height, start_size, min_size):
    size = start_size
    while size >= min_size:
        fnt = title_font(size)
        gap = max(10, int(size * 0.22))
        lines = wrap_text(draw, text, max_width, fnt)
        height = len(lines) * size + max(0, len(lines) - 1) * gap
        if height <= max_height:
            return fnt, lines, gap
        size -= 2
    fnt = title_font(min_size)
    return fnt, wrap_text(draw, text, max_width, fnt), max(8, int(min_size * 0.2))


def draw_center_lines(draw, center_y, lines, fnt, fill, line_gap):
    total_h = len(lines) * fnt.size + max(0, len(lines) - 1) * line_gap
    y = int(center_y - total_h / 2)
    for line in lines:
        x = int((CARD_W - text_width(draw, line, fnt)) / 2)
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + line_gap


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def add_soft_panel(draw, box, radius, fill, outline, width=3):
    rounded_rect(draw, box, radius, fill, outline, width)


def make_lantern_card(row, bg):
    img = bg.copy().convert("RGBA")
    panel = Image.new("RGBA", (CARD_W, CARD_H), (0, 0, 0, 0))
    draw_panel = ImageDraw.Draw(panel)
    add_soft_panel(draw_panel, (118, 508, CARD_W - 118, 1212), 44, (255, 250, 238, 222), (212, 157, 65, 150), 3)
    img = Image.alpha_composite(img, panel).convert("RGB")
    draw = ImageDraw.Draw(img)

    accent = CATEGORY_COLORS.get(row["category"], "#B77A2E")
    fnt, lines, gap = fit_multiline(draw, row["front_phrase"], 770, 320, 74, 46)
    draw_center_lines(draw, 705, lines, fnt, "#15202A", gap)
    draw.line((230, 910, CARD_W - 230, 910), fill=accent, width=6)

    desc_font = body_font(31)
    desc_lines = wrap_text(draw, row["subtext"], 720, desc_font)
    draw_center_lines(draw, 1035, desc_lines[:3], desc_font, "#354049", 10)

    label = f"{row['category']} · {row['keyword']}"
    label_font = body_font(26)
    label_w = text_width(draw, label, label_font) + 72
    rounded_rect(draw, ((CARD_W - label_w) // 2, 1256, (CARD_W + label_w) // 2, 1316), 30, "#FFF1D5", accent, 3)
    draw.text((CARD_W // 2 - text_width(draw, label, label_font) // 2, 1269), label, font=label_font, fill="#2D3033")
    return img


def make_score_card(row, bg):
    img = bg.copy().convert("RGBA")
    panel = Image.new("RGBA", (CARD_W, CARD_H), (0, 0, 0, 0))
    draw_panel = ImageDraw.Draw(panel)
    add_soft_panel(draw_panel, (150, 490, CARD_W - 150, 1140), 42, (14, 24, 37, 178), (214, 164, 77, 190), 3)
    img = Image.alpha_composite(img, panel).convert("RGB")
    draw = ImageDraw.Draw(img)

    label_font = title_font(74)
    label_lines = wrap_text(draw, row["label"], 700, label_font)
    draw_center_lines(draw, 645, label_lines, label_font, "#FFF1C9", 16)

    score = f"+ {row['score']}"
    score_font = title_font(152)
    draw.text((CARD_W // 2 - text_width(draw, score, score_font) // 2, 770), score, font=score_font, fill="#F0B746")

    desc_font = body_font(32)
    desc_lines = wrap_text(draw, row["description"], 680, desc_font)
    draw_center_lines(draw, 1040, desc_lines, desc_font, "#EFE4C8", 10)
    return img


def make_back_card(bg):
    img = bg.copy().convert("RGB")
    draw = ImageDraw.Draw(img)
    fnt = title_font(70)
    draw.text((CARD_W // 2 - text_width(draw, "TEAM", fnt) // 2, 1048), "TEAM", font=fnt, fill="#FFF1C9")
    draw.text((CARD_W // 2 - text_width(draw, "LANTERN CARD", fnt) // 2, 1134), "LANTERN CARD", font=fnt, fill="#FFF1C9")
    return img


def save_contact(paths, out_path, cols=6, thumb=(315, 450)):
    gap = 24
    margin = 34
    rows = math.ceil(len(paths) / cols)
    sheet = Image.new("RGB", (margin * 2 + cols * thumb[0] + (cols - 1) * gap, margin * 2 + rows * thumb[1] + (rows - 1) * gap), "#E7DECB")
    for idx, path in enumerate(paths):
        img = Image.open(path).convert("RGB").resize(thumb, Image.LANCZOS)
        x = margin + (idx % cols) * (thumb[0] + gap)
        y = margin + (idx // cols) * (thumb[1] + gap)
        sheet.paste(img, (x, y))
    sheet.save(out_path)


def main():
    FRONT_DIR.mkdir(parents=True, exist_ok=True)
    SCORE_DIR.mkdir(parents=True, exist_ok=True)

    front_bg = load_background(FRONT_BG)
    score_bg = load_background(SCORE_BG)
    back_bg = load_background(BACK_BG)

    front_paths = []
    for row in read_csv(LANTERN_DATA):
        img = make_lantern_card(row, front_bg)
        path = FRONT_DIR / f"{row['id']}_{row['keyword']}.png"
        img.save(path)
        front_paths.append(path)

    score_paths = []
    for row in read_csv(LIGHT_DATA):
        img = make_score_card(row, score_bg)
        path = SCORE_DIR / f"{row['id']}_{row['label']}.png"
        img.save(path)
        score_paths.append(path)

    back = make_back_card(back_bg)
    back.save(BACK_OUT)
    save_contact(front_paths, LANTERN_CONTACT, 6, (315, 450))
    save_contact(score_paths + [BACK_OUT], SCORE_CONTACT, 4, (315, 450))
    print(LANTERN_CONTACT)
    print(SCORE_CONTACT)
    print(BACK_OUT)
    print(OUT_DIR)


if __name__ == "__main__":
    main()
