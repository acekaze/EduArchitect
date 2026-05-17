import csv
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


BASE = Path(__file__).resolve().parent
LANTERN_DATA = BASE / "팀등불_등불카드데이터_v1.csv"
LIGHT_DATA = BASE / "팀등불_빛조각카드데이터_v1.csv"
OUT_DIR = BASE / "팀등불_카드디자인시안_v1"
LANTERN_CONTACT = BASE / "팀등불_등불카드_전체미리보기_v1.png"
LIGHT_CONTACT = BASE / "팀등불_빛조각카드_전체미리보기_v1.png"
BACK_CARD = BASE / "팀등불_카드뒷면_시안_v1.png"

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
    "듣기": "#287277",
    "협업": "#4868A8",
    "실행": "#B77A2E",
    "사고": "#8A5AA5",
    "전환": "#4E8A5F",
    "분위기": "#C86B78",
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


def text_box(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont):
    return draw.textbbox((0, 0), text, font=fnt)


def text_width(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont) -> int:
    box = text_box(draw, text, fnt)
    return box[2] - box[0]


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
                split = wrap_long_word(draw, word, max_width, fnt)
                lines.extend(split[:-1])
                line = split[-1] if split else ""
    if line:
        lines.append(line)
    return lines


def fit_multiline(draw, text, max_width, max_height, start_size, min_size, line_gap_ratio=0.2):
    size = start_size
    while size >= min_size:
        fnt = title_font(size)
        lines = wrap_text(draw, text, max_width, fnt)
        gap = int(size * line_gap_ratio)
        height = len(lines) * size + max(0, len(lines) - 1) * gap
        if height <= max_height and all(text_width(draw, line, fnt) <= max_width for line in lines):
            return fnt, lines, gap
        size -= 2
    fnt = title_font(min_size)
    return fnt, wrap_text(draw, text, max_width, fnt), int(min_size * line_gap_ratio)


def draw_center_lines(draw, center_y, lines, fnt, fill, line_gap):
    total_h = len(lines) * fnt.size + max(0, len(lines) - 1) * line_gap
    y = int(center_y - total_h / 2)
    for line in lines:
        box = text_box(draw, line, fnt)
        x = int((CARD_W - (box[2] - box[0])) / 2)
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + line_gap


def add_paper_texture(img: Image.Image, seed: str, strength: int = 13):
    rng = random.Random(seed)
    noise = Image.effect_noise(img.size, strength).convert("L")
    tint = Image.new("RGB", img.size, (rng.randint(244, 255), rng.randint(238, 248), rng.randint(220, 236)))
    texture = Image.merge("RGB", (noise, noise, noise))
    return Image.blend(Image.blend(img, tint, 0.04), texture, 0.045)


def radial_glow(size, center, color, max_radius, steps=28):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    r, g, b = color
    for i in range(steps, 0, -1):
        radius = int(max_radius * i / steps)
        alpha = int(8 * (i / steps) ** 2)
        x, y = center
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(r, g, b, alpha))
    return layer


def draw_lantern_icon(draw, cx, cy, color, scale=1.0):
    w = int(120 * scale)
    h = int(150 * scale)
    line = int(10 * scale)
    draw.arc((cx - w // 2, cy - h // 2 - 40, cx + w // 2, cy + h // 2), 205, 335, fill=color, width=line)
    draw.rounded_rectangle((cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2), radius=int(34 * scale), outline=color, width=line)
    draw.rounded_rectangle((cx - w // 4, cy - h // 2 - 28, cx + w // 4, cy - h // 2 + 10), radius=int(12 * scale), fill=color)
    draw.line((cx, cy - h // 2 - 65, cx, cy - h // 2 - 28), fill=color, width=line)
    draw.ellipse((cx - int(28 * scale), cy - int(16 * scale), cx + int(28 * scale), cy + int(42 * scale)), fill="#F2B94B")


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def make_lantern_card(row):
    accent = CATEGORY_COLORS.get(row["category"], "#C89541")
    img = Image.new("RGB", (CARD_W, CARD_H), "#172231")
    img = add_paper_texture(img, row["id"], 10)
    overlay = radial_glow((CARD_W, CARD_H), (CARD_W // 2, 350), (235, 177, 76), 540, 34)
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    rounded_rect(draw, (34, 34, CARD_W - 35, CARD_H - 35), 72, "#FFF8E7", "#D3A24E", 7)
    rounded_rect(draw, (74, 74, CARD_W - 75, CARD_H - 75), 52, "#FFFDF5", "#E6D7B7", 3)
    rounded_rect(draw, (112, 112, CARD_W - 113, CARD_H - 113), 42, "#FFFDF5", accent, 8)

    draw_lantern_icon(draw, CARD_W // 2, 248, accent, 1.15)
    draw.text((CARD_W // 2 - text_width(draw, "TEAM LANTERN", body_font(30)) // 2, 410), "TEAM LANTERN", font=body_font(30), fill="#6E6659")

    fnt, lines, gap = fit_multiline(draw, row["front_phrase"], 780, 360, 86, 50, 0.24)
    draw_center_lines(draw, 710, lines, fnt, "#16242B", gap)

    draw.line((205, 940, CARD_W - 205, 940), fill=accent, width=8)

    desc_font = body_font(35)
    desc_lines = wrap_text(draw, row["subtext"], 760, desc_font)
    draw_center_lines(draw, 1070, desc_lines[:3], desc_font, "#344149", 12)

    label = f"{row['category']} · {row['keyword']}"
    label_font = body_font(28)
    label_w = text_width(draw, label, label_font) + 74
    rounded_rect(draw, ((CARD_W - label_w) // 2, 1308, (CARD_W + label_w) // 2, 1370), 31, "#F7ECD0", accent, 3)
    draw.text((CARD_W // 2 - text_width(draw, label, label_font) // 2, 1320), label, font=label_font, fill="#26343C")
    return img


def make_light_card(row):
    score = int(row["score"])
    colors = {
        1: ("#DCA94B", "#2A3442"),
        2: ("#E9B95C", "#263C48"),
        3: ("#F2C36B", "#3B334C"),
        5: ("#F6D37B", "#453044"),
    }
    accent, base = colors.get(score, ("#DCA94B", "#2A3442"))
    img = Image.new("RGB", (CARD_W, CARD_H), base)
    img = add_paper_texture(img, row["id"], 9)
    glow = radial_glow((CARD_W, CARD_H), (CARD_W // 2, 630), (245, 190, 91), 610, 34)
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)

    rounded_rect(draw, (34, 34, CARD_W - 35, CARD_H - 35), 72, "#172231", "#D6A44E", 7)
    rounded_rect(draw, (96, 96, CARD_W - 97, CARD_H - 97), 52, "#203040", accent, 5)
    draw_lantern_icon(draw, CARD_W // 2, 300, accent, 1.35)
    draw.text((CARD_W // 2 - text_width(draw, "LIGHT PIECE", body_font(34)) // 2, 475), "LIGHT PIECE", font=body_font(34), fill="#E5D5AF")

    label_font = title_font(88)
    label_lines = wrap_text(draw, row["label"], 760, label_font)
    draw_center_lines(draw, 685, label_lines, label_font, "#FFF4CF", 18)

    score_text = f"+ {score}"
    score_font = title_font(150)
    draw.text((CARD_W // 2 - text_width(draw, score_text, score_font) // 2, 840), score_text, font=score_font, fill=accent)

    desc_font = body_font(34)
    desc_lines = wrap_text(draw, row["description"], 760, desc_font)
    draw_center_lines(draw, 1130, desc_lines, desc_font, "#E8E0CC", 12)
    return img


def make_back_card():
    img = Image.new("RGB", (CARD_W, CARD_H), "#172231")
    img = add_paper_texture(img, "back", 8)
    glow = radial_glow((CARD_W, CARD_H), (CARD_W // 2, CARD_H // 2), (235, 177, 76), 620, 36)
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)
    rounded_rect(draw, (34, 34, CARD_W - 35, CARD_H - 35), 72, "#172231", "#D6A44E", 7)
    rounded_rect(draw, (96, 96, CARD_W - 97, CARD_H - 97), 52, "#1E2B3A", "#E7C177", 4)
    draw_lantern_icon(draw, CARD_W // 2, 575, "#E7C177", 1.8)
    fnt = title_font(70)
    draw.text((CARD_W // 2 - text_width(draw, "TEAM", fnt) // 2, 860), "TEAM", font=fnt, fill="#FFF4CF")
    draw.text((CARD_W // 2 - text_width(draw, "LANTERN CARD", fnt) // 2, 950), "LANTERN CARD", font=fnt, fill="#FFF4CF")
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


def read_csv(path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def main():
    OUT_DIR.mkdir(exist_ok=True)
    lantern_dir = OUT_DIR / "등불카드"
    light_dir = OUT_DIR / "빛조각카드"
    lantern_dir.mkdir(exist_ok=True)
    light_dir.mkdir(exist_ok=True)

    lantern_paths = []
    for row in read_csv(LANTERN_DATA):
        img = make_lantern_card(row)
        path = lantern_dir / f"{row['id']}_{row['keyword']}.png"
        img.save(path)
        lantern_paths.append(path)

    light_paths = []
    for row in read_csv(LIGHT_DATA):
        img = make_light_card(row)
        path = light_dir / f"{row['id']}_{row['label']}.png"
        img.save(path)
        light_paths.append(path)

    back = make_back_card()
    back.save(BACK_CARD)
    save_contact(lantern_paths, LANTERN_CONTACT, 6, (315, 450))
    save_contact(light_paths + [BACK_CARD], LIGHT_CONTACT, 5, (315, 450))
    print(LANTERN_CONTACT)
    print(LIGHT_CONTACT)
    print(BACK_CARD)
    print(OUT_DIR)


if __name__ == "__main__":
    main()
