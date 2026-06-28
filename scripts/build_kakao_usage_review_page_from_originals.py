from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path("C:/코딩/교육설계")
FONT_DIR = ROOT / ".codex-work/ai-collab-course-slides/fonts/pretendard/public/static/alternative"
SRC_DIR = Path("C:/Users/aceka/Downloads/Mobile Devices")
OUT_DIR = ROOT / "output/img/주력강의재설계_후기카드/카톡_실전활용후기_원본7장"

BG = "#F4F6F8"
TEXT = "#171717"
MUTED = "#626A73"
GREEN = "#2E7D52"
MASK_DARK = "#070707"


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / name), size=size)


F_EYEBROW = font("Pretendard-SemiBold.ttf", 30)
F_TITLE = font("Pretendard-Bold.ttf", 70)
F_BODY = font("Pretendard-Regular.ttf", 31)


ITEMS = [
    {
        "file": "Screenshot_20260622_115031_KakaoTalk.jpg",
        "slug": "01_환경질문_연결질문_적용",
        "crop": (118, 0, 1049, 579),
        "mask_ellipses": [],
        "mask_rects": [],
    },
    {
        "file": "Screenshot_20260622_115055_KakaoTalk.jpg",
        "slug": "02_수업일지_환경제공",
        "crop": (120, 0, 930, 1036),
        "mask_ellipses": [],
        "mask_rects": [],
    },
    {
        "file": "Screenshot_20260622_115108_KakaoTalk.jpg",
        "slug": "03_오프닝_적용_답장",
        "crop": (118, 0, 1080, 629),
        "mask_ellipses": [],
        "mask_rects": [(0, 335, 380, 392)],
    },
    {
        "file": "Screenshot_20260622_115127_KakaoTalk.jpg",
        "slug": "04_IF_강의법_적용",
        "crop": (118, 0, 1025, 359),
        "mask_ellipses": [],
        "mask_rects": [],
    },
    {
        "file": "Screenshot_20260622_114911_KakaoTalk.jpg",
        "slug": "05_적용포인트_정리",
        "crop": (136, 300, 1080, 2210),
        "mask_ellipses": [],
        "mask_rects": [(0, 145, 210, 218), (0, 1172, 210, 1242)],
    },
    {
        "file": "Screenshot_20260622_114931_KakaoTalk.jpg",
        "slug": "06_소그룹강의_적용",
        "crop": (118, 82, 1080, 598),
        "mask_ellipses": [],
        "mask_rects": [(0, 42, 420, 92)],
    },
    {
        "file": "Screenshot_20260622_115010_KakaoTalk.jpg",
        "slug": "07_참여반응_후기",
        "crop": (118, 0, 1055, 335),
        "mask_ellipses": [],
        "mask_rects": [],
    },
]


def text_w(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def draw_centered(draw: ImageDraw.ImageDraw, y: int, text: str, fnt: ImageFont.FreeTypeFont, fill: str, width: int) -> None:
    draw.text(((width - text_w(draw, text, fnt)) // 2, y), text, font=fnt, fill=fill)


def anonymize_item(item: dict) -> Image.Image:
    img = Image.open(SRC_DIR / item["file"]).convert("RGBA")
    crop = item["crop"]
    if crop:
        img = img.crop(crop)

    draw = ImageDraw.Draw(img)
    for box in item["mask_ellipses"]:
        draw.ellipse(box, fill=MASK_DARK)
    for box in item["mask_rects"]:
        draw.rounded_rectangle(box, radius=14, fill=MASK_DARK)
    return img


def save_individual_cards() -> list[Path]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    paths = []
    for item in ITEMS:
        img = anonymize_item(item)
        out = OUT_DIR / f"{item['slug']}_익명처리.png"
        img.convert("RGB").save(out, quality=96)
        paths.append(out)
    return paths


def add_card(canvas: Image.Image, img: Image.Image, xy: tuple[int, int], target_w: int) -> int:
    ratio = target_w / img.width
    resized = img.resize((target_w, int(img.height * ratio)), Image.Resampling.LANCZOS)

    radius = 18
    mask = Image.new("L", resized.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, resized.width - 1, resized.height - 1), radius=radius, fill=255)

    rounded = Image.new("RGBA", resized.size, (0, 0, 0, 0))
    rounded.alpha_composite(resized)
    rounded.putalpha(mask)

    shadow = Image.new("RGBA", (resized.width + 38, resized.height + 38), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((19, 19, 19 + resized.width, 19 + resized.height), radius=radius, fill=(0, 0, 0, 58))
    shadow = shadow.filter(ImageFilter.GaussianBlur(13))

    x, y = xy
    canvas.alpha_composite(shadow, (x - 19, y - 12))
    canvas.alpha_composite(rounded, (x, y))
    return resized.height


def build_page() -> Path:
    cards = [anonymize_item(item) for item in ITEMS]
    page_w = 1600
    margin = 88
    col_gap = 34
    row_gap = 34
    col_w = (page_w - margin * 2 - col_gap) // 2

    columns = [
        [0, 1, 6],
        [2, 3, 5],
    ]
    top_cards = [4]

    y_base = 310
    bottom_margin = 92

    left_h = sum(int(cards[i].height * col_w / cards[i].width) + row_gap for i in columns[0]) - row_gap
    right_h = sum(int(cards[i].height * col_w / cards[i].width) + row_gap for i in columns[1]) - row_gap
    top_h = int(cards[top_cards[0]].height * (page_w - margin * 2) / cards[top_cards[0]].width)
    page_h = y_base + max(left_h, right_h) + row_gap + top_h + bottom_margin

    canvas = Image.new("RGBA", (page_w, page_h), BG)
    draw = ImageDraw.Draw(canvas)
    draw_centered(draw, 60, "실전 적용 후기", F_EYEBROW, GREEN, page_w)
    draw_centered(draw, 110, "배운 내용을 바로 적용한 뒤 받은 메시지", F_TITLE, TEXT, page_w)
    draw_centered(draw, 198, "오프닝, 환경질문, 연결질문, IF 설계를 현장에 적용한 실제 카톡 후기입니다.", F_BODY, MUTED, page_w)

    for col_idx, ids in enumerate(columns):
        x = margin + col_idx * (col_w + col_gap)
        y = y_base
        for idx in ids:
            y += add_card(canvas, cards[idx], (x, y), col_w) + row_gap

    full_y = y_base + max(left_h, right_h) + row_gap
    add_card(canvas, cards[4], (margin, full_y), page_w - margin * 2)

    out = OUT_DIR / "카톡_실전활용후기_원본7장_페이지_익명처리.png"
    canvas.convert("RGB").save(out, quality=96)
    return out


def main() -> None:
    paths = save_individual_cards()
    page = build_page()
    for path in paths:
        print(path)
    print(page)


if __name__ == "__main__":
    main()
