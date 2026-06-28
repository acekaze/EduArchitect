from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter


ROOT = Path("C:/코딩/교육설계")
FONT_DIR = ROOT / ".codex-work/ai-collab-course-slides/fonts/pretendard/public/static/alternative"
LOGO_SOURCE = Path("C:/코딩/로고/brand-kit/assets/logo-flow-centered-black-on-white.png")
ROPEFREE_SOURCE = Path("C:/Users/aceka/Downloads/로프프리_영문_배경없음.png")
BASE_PDF = ROOT / "output/doc/무료라이브특강_전자책_첫강의5단계워크북_내용구분_디자인판.pdf"

OUT_DIR_IMG = ROOT / "output/img"
OUT_DIR_DOC = ROOT / "output/doc"
COVER_PNG = OUT_DIR_IMG / "무료라이브특강_전자책_표지_전환설계연구소_X_ropefree_v4.png"
COVER_PDF = OUT_DIR_DOC / "무료라이브특강_전자책_표지_전환설계연구소_X_ropefree_v4.pdf"
FINAL_PDF = OUT_DIR_DOC / "무료라이브특강_전자책_첫강의5단계워크북_표지이미지적용판.pdf"

W, H = 2480, 3508
PAGE_W, PAGE_H = A4


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / name), size=size)


F_REG = font("Pretendard-Regular.ttf", 52)
F_MED = font("Pretendard-Medium.ttf", 48)
F_BOLD = font("Pretendard-Bold.ttf", 68)
F_XB = font("Pretendard-ExtraBold.ttf", 152)
F_TITLE_SMALL = font("Pretendard-ExtraBold.ttf", 112)
F_COLLAB = font("Pretendard-SemiBold.ttf", 58)
F_COLLAB_X = font("Pretendard-Medium.ttf", 38)


def draw_center(draw: ImageDraw.ImageDraw, y: int, text: str, fnt, fill, spacing: int = 0) -> int:
    lines = text.split("\n")
    line_heights = []
    widths = []
    for line in lines:
        box = draw.textbbox((0, 0), line, font=fnt)
        widths.append(box[2] - box[0])
        line_heights.append(box[3] - box[1])
    total_h = sum(line_heights) + spacing * (len(lines) - 1)
    cur_y = y
    for line, width, height in zip(lines, widths, line_heights):
        draw.text(((W - width) / 2, cur_y), line, font=fnt, fill=fill)
        cur_y += height + spacing
    return y + total_h


def make_logo() -> Image.Image:
    if not LOGO_SOURCE.exists():
        raise FileNotFoundError(LOGO_SOURCE)
    src = Image.open(LOGO_SOURCE).convert("RGBA")
    gray = src.convert("L")
    alpha = Image.eval(gray, lambda px: max(0, min(255, 255 - px)))
    alpha = alpha.point(lambda px: 0 if px < 18 else min(255, int(px * 1.45)))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.2))

    logo = Image.new("RGBA", src.size, (0, 0, 0, 255))
    logo.putalpha(alpha)

    bbox = alpha.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    target_w = 2680
    target_h = int(logo.height * target_w / logo.width)
    return logo.resize((target_w, target_h), Image.Resampling.LANCZOS)


def make_ropefree_logo(target_h: int = 64) -> Image.Image:
    source = ROPEFREE_SOURCE
    if not source.exists():
        fallback = Path("C:/Users/aceka/Downloads/로프프리_영문_White.png")
        if fallback.exists():
            source = fallback
        else:
            raise FileNotFoundError(ROPEFREE_SOURCE)

    src = Image.open(source).convert("RGBA")
    alpha = src.getchannel("A")
    if alpha.getextrema() == (255, 255):
        rgb = src.convert("RGB")
        mask = Image.new("L", src.size, 0)
        mask_data = []
        for r, g, b in rgb.getdata():
            distance = abs(255 - r) + abs(255 - g) + abs(255 - b)
            mask_data.append(0 if distance < 24 else 255)
        mask.putdata(mask_data)
        alpha = mask.filter(ImageFilter.GaussianBlur(0.4))
        src.putalpha(alpha)

    bbox = alpha.getbbox()
    if bbox:
        src = src.crop(bbox)
    target_w = int(src.width * target_h / src.height)
    return src.resize((target_w, target_h), Image.Resampling.LANCZOS)


def draw_text_at(draw: ImageDraw.ImageDraw, x: int, y: int, text_value: str, fnt, fill) -> None:
    box = draw.textbbox((0, 0), text_value, font=fnt)
    draw.text((x, y - box[1]), text_value, font=fnt, fill=fill)


def draw_collaboration_row(bg: Image.Image, y: int, fill: str, muted: str) -> None:
    draw = ImageDraw.Draw(bg)
    left_text = "전환설계연구소"
    divider = "X"
    ropefree = make_ropefree_logo()

    left_box = draw.textbbox((0, 0), left_text, font=F_COLLAB)
    divider_box = draw.textbbox((0, 0), divider, font=F_COLLAB_X)
    left_w = left_box[2] - left_box[0]
    left_h = left_box[3] - left_box[1]
    divider_w = divider_box[2] - divider_box[0]
    divider_h = divider_box[3] - divider_box[1]
    gap = 34
    row_h = max(left_h, divider_h, ropefree.height)
    total_w = left_w + gap + divider_w + gap + ropefree.width
    x = (W - total_w) // 2

    draw_text_at(draw, x, y + (row_h - left_h) // 2, left_text, F_COLLAB, fill)
    x += left_w + gap
    draw_text_at(draw, x, y + (row_h - divider_h) // 2, divider, F_COLLAB_X, muted)
    x += divider_w + gap
    bg.alpha_composite(ropefree, (x, y + (row_h - ropefree.height) // 2))


def build_cover_png() -> None:
    OUT_DIR_IMG.mkdir(parents=True, exist_ok=True)
    OUT_DIR_DOC.mkdir(parents=True, exist_ok=True)

    bg = Image.new("RGBA", (W, H), "#FFFFFF")
    draw = ImageDraw.Draw(bg)

    navy = "#183B72"
    text = "#111111"
    muted = "#5C6A7D"

    draw_collaboration_row(bg, 338, text, muted)

    draw_center(draw, 930, "첫 강의\n5단계 워크북", F_XB, navy, spacing=42)
    draw_center(draw, 1390, "무료 라이브 특강 참여자용 전자책", F_BOLD, "#121212")

    logo = make_logo()
    bg.alpha_composite(logo, ((W - logo.width) // 2, 1730))
    draw = ImageDraw.Draw(bg)

    draw_center(draw, 3200, "내 경험을 사람들이 듣고 싶어 하는 강의로 설계하는 실전 워크북", F_MED, muted)
    COVER_PNG.parent.mkdir(parents=True, exist_ok=True)
    bg.convert("RGB").save(COVER_PNG, quality=96, dpi=(300, 300))


def build_cover_pdf() -> None:
    c = canvas.Canvas(str(COVER_PDF), pagesize=A4)
    c.drawImage(ImageReader(str(COVER_PNG)), 0, 0, width=PAGE_W, height=PAGE_H)
    c.save()


def replace_cover() -> None:
    cover_reader = PdfReader(str(COVER_PDF))
    base_reader = PdfReader(str(BASE_PDF))
    writer = PdfWriter()
    writer.add_page(cover_reader.pages[0])
    for page in base_reader.pages[1:]:
        writer.add_page(page)
    with FINAL_PDF.open("wb") as f:
        writer.write(f)


def main() -> None:
    build_cover_png()
    build_cover_pdf()
    replace_cover()
    print(COVER_PNG)
    print(FINAL_PDF)


if __name__ == "__main__":
    main()
