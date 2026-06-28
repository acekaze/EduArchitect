from pathlib import Path

import fitz
from PIL import Image, ImageChops


ROOT = Path(r"C:\코딩\교육설계")
SRC = Path(r"C:\Users\aceka\Downloads\주력강의재설계과정_인쇄용_최종본.pdf")
ROPEFREE_LOGO = Path(r"C:\Users\aceka\Downloads\로프프리_영문_White.png")
FONT_DIR = ROOT / ".codex-work" / "ai-collab-course-slides" / "fonts" / "pretendard" / "public" / "static" / "alternative"
FONT_REGULAR = FONT_DIR / "Pretendard-Regular.ttf"
FONT_MEDIUM = FONT_DIR / "Pretendard-Medium.ttf"
FONT_BOLD = FONT_DIR / "Pretendard-Bold.ttf"
FONT_EXTRABOLD = FONT_DIR / "Pretendard-ExtraBold.ttf"

TMP_DIR = ROOT / "_tmp" / "workbook_cover_fix"
OUT_DIR = ROOT / "output" / "doc"
IMG_DIR = ROOT / "output" / "img"

TITLE = "시그니처 강의 개발 클래스"
WORKBOOK_LABEL = "참가자 워크북"
SUBTITLE = "자기 강의를 실제로 손보고 개선안을 만드는 4주 과정"
INNER_SUBTITLE = "자기 강의를 실제로 손보고 개선안을 만드는 4주 워크북"
FOOTER = "시그니처 강의 개발 클래스 워크북"

BLUE = (0x16 / 255, 0x36 / 255, 0x6C / 255)
GRAY = (0x5F / 255, 0x6E / 255, 0x86 / 255)
BLACK = (0, 0, 0)
WHITE = (1, 1, 1)
PALE_BLUE = (241 / 255, 246 / 255, 252 / 255)
CELL_BLUE = (234 / 255, 239 / 255, 250 / 255)


def crop_logo() -> Path:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    img = Image.open(ROPEFREE_LOGO).convert("RGBA")
    white = Image.new("RGB", img.size, (255, 255, 255))
    diff = ImageChops.difference(img.convert("RGB"), white)
    bbox = diff.getbbox()
    if not bbox:
        raise RuntimeError("Logo crop failed.")
    pad_x, pad_y = 24, 16
    left = max(0, bbox[0] - pad_x)
    top = max(0, bbox[1] - pad_y)
    right = min(img.width, bbox[2] + pad_x)
    bottom = min(img.height, bbox[3] + pad_y)
    cropped = img.crop((left, top, right, bottom))
    out = TMP_DIR / "ropefree_cropped.png"
    cropped.save(out)
    return out


def register_fonts(page: fitz.Page) -> None:
    page.insert_font(fontname="PretendardRegular", fontfile=str(FONT_REGULAR))
    page.insert_font(fontname="PretendardMedium", fontfile=str(FONT_MEDIUM))
    page.insert_font(fontname="PretendardBold", fontfile=str(FONT_BOLD))
    page.insert_font(fontname="PretendardExtraBold", fontfile=str(FONT_EXTRABOLD))


def erase(page: fitz.Page, rect, fill=WHITE) -> None:
    page.draw_rect(fitz.Rect(*rect), color=fill, fill=fill, overlay=True)


def text_box(page: fitz.Page, rect, text, fontname, size, color, align=fitz.TEXT_ALIGN_CENTER) -> None:
    page.insert_textbox(
        fitz.Rect(*rect),
        text,
        fontname=fontname,
        fontsize=size,
        color=color,
        align=align,
        overlay=True,
    )


def add_top_brand(page: fitz.Page, logo_path: Path) -> None:
    erase(page, (150, 70, 455, 104), WHITE)
    text_w = 84
    x_w = 12
    logo_w = 82
    gap = 8
    total_w = text_w + gap + x_w + gap + logo_w
    x0 = (page.rect.width - total_w) / 2
    y0 = 77

    text_box(page, (x0, y0, x0 + text_w, y0 + 18), "전환설계연구소", "PretendardMedium", 11.5, GRAY, fitz.TEXT_ALIGN_LEFT)
    text_box(page, (x0 + text_w + gap, y0 + 0.5, x0 + text_w + gap + x_w, y0 + 18.5), "X", "PretendardMedium", 10.5, GRAY, fitz.TEXT_ALIGN_CENTER)

    logo_rect = fitz.Rect(x0 + text_w + gap + x_w + gap, y0 + 1.8, x0 + text_w + gap + x_w + gap + logo_w, y0 + 16.8)
    page.insert_image(logo_rect, filename=str(logo_path), keep_proportion=True, overlay=True)


def update_cover(page: fitz.Page, logo_path: Path) -> None:
    redact(page, (150, 70, 455, 104), WHITE)
    redact(page, (75, 180, 520, 242), WHITE)
    redact(page, (230, 246, 365, 276), WHITE)
    redact(page, (170, 744, 430, 772), WHITE)
    apply_page_redactions(page)
    register_fonts(page)
    add_top_brand(page, logo_path)

    erase(page, (75, 180, 520, 242), WHITE)
    text_box(page, (60, 184, 535, 242), TITLE, "PretendardExtraBold", 26.8, BLUE)

    erase(page, (230, 246, 365, 276), WHITE)
    text_box(page, (205, 249, 390, 276), WORKBOOK_LABEL, "PretendardExtraBold", 15.5, BLACK)

    erase(page, (170, 744, 430, 772), WHITE)
    text_box(page, (140, 750, 455, 766), SUBTITLE, "PretendardMedium", 10.3, GRAY)


def update_inner_title_page(page: fitz.Page) -> None:
    redact(page, (52, 52, 544, 146), PALE_BLUE)
    redact(page, (120, 160, 475, 202), WHITE)
    redact(page, (120, 212, 475, 238), WHITE)
    redact(page, (220, 786, 380, 810), WHITE)
    apply_page_redactions(page)
    register_fonts(page)

    # Keep the original frame and table. Only replace title/date wording that conflicts with the 4-week use.
    erase(page, (52, 52, 544, 146), PALE_BLUE)
    page.draw_rect(fitz.Rect(51, 51, 545, 147), color=BLACK, width=0.6, overlay=True)
    text_box(page, (70, 78, 525, 120), TITLE, "PretendardExtraBold", 21.5, BLUE)
    text_box(page, (150, 119, 445, 145), WORKBOOK_LABEL, "PretendardExtraBold", 15, BLUE)

    erase(page, (120, 160, 475, 202), WHITE)
    text_box(page, (150, 160, 445, 190), "4주 과정", "PretendardMedium", 11.5, GRAY)

    erase(page, (120, 212, 475, 238), WHITE)
    text_box(page, (120, 210, 475, 242), INNER_SUBTITLE, "PretendardMedium", 11.2, GRAY)

    erase(page, (220, 786, 380, 810), WHITE)
    text_box(page, (185, 786, 410, 810), FOOTER, "PretendardMedium", 8.8, GRAY)


def render_first_pages(pdf_path: Path, prefix: str, pages=2) -> list[Path]:
    rendered = []
    doc = fitz.open(pdf_path)
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    for idx in range(min(pages, doc.page_count)):
        page = doc[idx]
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        out = IMG_DIR / f"{prefix}_p{idx + 1}.png"
        pix.save(out)
        rendered.append(out)
    doc.close()
    return rendered


def redact(page: fitz.Page, rect, fill=WHITE) -> None:
    page.add_redact_annot(fitz.Rect(*rect), fill=fill)


def apply_page_redactions(page: fitz.Page) -> None:
    page.apply_redactions()


def baseline_text(page: fitz.Page, x: float, y: float, text: str, fontname: str, size: float, color=BLACK) -> None:
    page.insert_text(
        fitz.Point(x, y),
        text,
        fontname=fontname,
        fontsize=size,
        color=color,
        overlay=True,
    )


def update_course_language_pages(base_pdf: Path, output_name: str, image_prefix: str) -> None:
    doc = fitz.open(base_pdf)

    for idx in range(1, doc.page_count):
        page = doc[idx]
        # Footer wording appears on every inner page. Redact it so copied text does not keep the old name.
        redact(page, (185, 786, 410, 810), WHITE)
        apply_page_redactions(page)
        register_fonts(page)
        text_box(page, (185, 790, 410, 808), FOOTER, "PretendardMedium", 8.8, GRAY)

    page3 = doc[2]
    redact(page3, (48, 132, 540, 154), WHITE)
    redact(page3, (48, 188, 540, 211), WHITE)
    apply_page_redactions(page3)
    register_fonts(page3)
    baseline_text(page3, 51, 147.5, "•", "PretendardRegular", 10.5, BLACK)
    baseline_text(page3, 69, 147.5, "현재 운영 중이거나 만들고 싶은 시그니처 강의 1개를 기준으로 작성합니다.", "PretendardRegular", 10.2, BLACK)
    baseline_text(page3, 51, 203.5, "•", "PretendardRegular", 10.5, BLACK)
    baseline_text(page3, 69, 203.5, "과정 종료 시 강의 정의 문장, 전달력 플로우 구조안, 질문·활동 설계안, 시그니처 강의 개선안을 정리합니다.", "PretendardRegular", 9.9, BLACK)

    page5 = doc[4]
    redact(page5, (235, 108, 365, 142), PALE_BLUE)
    apply_page_redactions(page5)
    register_fonts(page5)
    baseline_text(page5, 214, 133.5, "시그니처 강의 설계", "PretendardExtraBold", 18.2, BLUE)

    page6 = doc[5]
    redact(page6, (92, 151, 174, 174), CELL_BLUE)
    apply_page_redactions(page6)
    register_fonts(page6)
    text_box(page6, (78, 154, 188, 173), "시그니처 강의명", "PretendardExtraBold", 9.9, BLUE)

    page30 = doc[29]
    redact(page30, (48, 45, 240, 84), WHITE)
    apply_page_redactions(page30)
    register_fonts(page30)
    baseline_text(page30, 51, 74, "시그니처 강의 개선안", "PretendardExtraBold", 18, BLUE)

    out_pdf = OUT_DIR / output_name
    if out_pdf.exists():
        out_pdf.unlink()
    doc.save(out_pdf, garbage=4, deflate=True)
    doc.close()

    render_first_pages(out_pdf, image_prefix, pages=2)
    render_selected_pages(out_pdf, image_prefix, [3, 5, 6, 30, 33])


def render_selected_pages(pdf_path: Path, prefix: str, page_numbers: list[int]) -> list[Path]:
    rendered = []
    doc = fitz.open(pdf_path)
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    for page_no in page_numbers:
        if 1 <= page_no <= doc.page_count:
            page = doc[page_no - 1]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            out = IMG_DIR / f"{prefix}_p{page_no}.png"
            pix.save(out)
            rendered.append(out)
    doc.close()
    return rendered


def build(update_inner: bool, output_name: str, image_prefix: str) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    logo_path = crop_logo()
    doc = fitz.open(SRC)
    update_cover(doc[0], logo_path)
    if update_inner and doc.page_count > 1:
        update_inner_title_page(doc[1])

    out_pdf = OUT_DIR / output_name
    if out_pdf.exists():
        out_pdf.unlink()
    doc.save(out_pdf, garbage=4, deflate=True)
    doc.close()
    render_first_pages(out_pdf, image_prefix, pages=2)


def main() -> None:
    build(
        update_inner=False,
        output_name="시그니처강의개발클래스_4주과정_표지만수정_ropefree추가.pdf",
        image_prefix="시그니처강의개발클래스_4주과정_표지만수정_ropefree추가",
    )
    build(
        update_inner=True,
        output_name="시그니처강의개발클래스_4주과정_표지_속표지최소수정_ropefree추가.pdf",
        image_prefix="시그니처강의개발클래스_4주과정_표지_속표지최소수정_ropefree추가",
    )
    update_course_language_pages(
        OUT_DIR / "시그니처강의개발클래스_4주과정_표지_속표지최소수정_ropefree추가.pdf",
        "시그니처강의개발클래스_4주과정_본문표기수정본.pdf",
        "시그니처강의개발클래스_4주과정_본문표기수정본",
    )


if __name__ == "__main__":
    main()
