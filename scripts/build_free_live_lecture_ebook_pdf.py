from __future__ import annotations

import html
import re
from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    Flowable,
    PageBreak,
    PageBreakIfNotEmpty,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from pypdf import PdfReader, PdfWriter


ROOT = Path("C:/코딩/교육설계")
SOURCE = ROOT / "output/doc/무료라이브특강_전자책_첫강의5단계워크북_개정판.md"
OUTPUT = ROOT / "output/doc/무료라이브특강_전자책_첫강의5단계워크북_내용구분_디자인판.pdf"
TMP_OUTPUT = OUTPUT.with_name(OUTPUT.stem + "_tmp.pdf")
FONT_DIR = ROOT / ".codex-work/ai-collab-course-slides/fonts/pretendard/public/static/alternative"

PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
MARGIN_TOP = 19 * mm
MARGIN_BOTTOM = 17 * mm
CONTENT_W = PAGE_W - (MARGIN_X * 2)

C = {
    "bg": colors.HexColor("#F7FAF9"),
    "ink": colors.HexColor("#13292C"),
    "soft": colors.HexColor("#516568"),
    "muted": colors.HexColor("#8CA0A3"),
    "line": colors.HexColor("#D9E4E2"),
    "panel": colors.HexColor("#EEF5F4"),
    "panel2": colors.HexColor("#F3F7F6"),
    "teal": colors.HexColor("#0D4B52"),
    "teal2": colors.HexColor("#1F6970"),
    "accent": colors.HexColor("#C48A36"),
    "accent_soft": colors.HexColor("#F4E8D7"),
    "white": colors.white,
}


def register_fonts() -> None:
    fonts = {
        "Pretendard": FONT_DIR / "Pretendard-Regular.ttf",
        "PretendardBold": FONT_DIR / "Pretendard-Bold.ttf",
        "PretendardExtraBold": FONT_DIR / "Pretendard-ExtraBold.ttf",
    }
    for name, path in fonts.items():
        if not path.exists():
            raise FileNotFoundError(path)
        pdfmetrics.registerFont(TTFont(name, str(path)))


def esc(text: str) -> str:
    text = html.escape(text.strip())
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`(.+?)`", r"<font name='PretendardBold'>\1</font>", text)
    return text


def styles():
    getSampleStyleSheet()
    return {
        "h1": ParagraphStyle(
            "h1",
            fontName="PretendardExtraBold",
            fontSize=25,
            leading=32,
            textColor=C["teal"],
            spaceAfter=8,
            alignment=TA_LEFT,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName="PretendardExtraBold",
            fontSize=15.8,
            leading=21,
            textColor=C["ink"],
            spaceBefore=3,
            spaceAfter=7,
        ),
        "h3": ParagraphStyle(
            "h3",
            fontName="PretendardBold",
            fontSize=11.8,
            leading=16,
            textColor=C["teal2"],
            spaceBefore=2,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body",
            fontName="Pretendard",
            fontSize=9.5,
            leading=15,
            textColor=C["ink"],
            spaceAfter=5,
        ),
        "list": ParagraphStyle(
            "list",
            fontName="Pretendard",
            fontSize=9.2,
            leading=14,
            leftIndent=10,
            firstLineIndent=-10,
            textColor=C["ink"],
            spaceAfter=4,
        ),
        "quote": ParagraphStyle(
            "quote",
            fontName="PretendardBold",
            fontSize=10.2,
            leading=16,
            textColor=C["teal"],
            leftIndent=0,
            rightIndent=0,
            spaceAfter=0,
        ),
        "small": ParagraphStyle(
            "small",
            fontName="Pretendard",
            fontSize=8.1,
            leading=12,
            textColor=C["soft"],
            spaceAfter=3,
        ),
        "cover_title": ParagraphStyle(
            "cover_title",
            fontName="PretendardExtraBold",
            fontSize=30,
            leading=38,
            textColor=C["ink"],
            alignment=TA_LEFT,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            fontName="PretendardBold",
            fontSize=11,
            leading=17,
            textColor=C["teal"],
            alignment=TA_LEFT,
        ),
    }


class CoverPage(Flowable):
    def __init__(self, title: str, subtitle: str, author: str, st: dict):
        super().__init__()
        self.title = title
        self.subtitle = subtitle
        self.author = author
        self.st = st

    def wrap(self, avail_width, avail_height):
        self.width = avail_width
        self.height = avail_height
        return avail_width, avail_height

    def draw(self):
        c = self.canv
        w, h = PAGE_W, PAGE_H
        c.saveState()
        c.setFillColor(C["bg"])
        c.rect(-MARGIN_X, -MARGIN_BOTTOM, w, h, stroke=0, fill=1)

        c.setStrokeColor(C["line"])
        c.setLineWidth(0.7)
        for y in (h - 44 * mm, h - 183 * mm):
            c.line(0, y, w - 2 * MARGIN_X, y)

        c.setFillColor(C["white"])
        c.roundRect(0, 96 * mm, w - 2 * MARGIN_X, 104 * mm, 8, stroke=0, fill=1)
        c.setStrokeColor(C["line"])
        c.roundRect(0, 96 * mm, w - 2 * MARGIN_X, 104 * mm, 8, stroke=1, fill=0)

        c.setFillColor(C["accent"])
        c.rect(0, 96 * mm, 3.2 * mm, 104 * mm, stroke=0, fill=1)

        title = Paragraph(esc(self.title), self.st["cover_title"])
        title.wrapOn(c, w - 54 * mm, 70 * mm)
        title.drawOn(c, 14 * mm, 154 * mm)

        sub = Paragraph(esc(self.subtitle), self.st["cover_sub"])
        sub.wrapOn(c, w - 58 * mm, 25 * mm)
        sub.drawOn(c, 14 * mm, 124 * mm)

        c.setFont("PretendardBold", 10)
        c.setFillColor(C["soft"])
        c.drawString(14 * mm, 111 * mm, self.author)

        labels = ["씨앗", "WHO", "WHY", "WHAT", "HOW", "IF"]
        x = 14 * mm
        for i, label in enumerate(labels):
            fill = C["teal"] if i == 0 else C["panel"]
            fg = C["white"] if i == 0 else C["teal"]
            c.setFillColor(fill)
            c.roundRect(x, 81 * mm, 18 * mm, 6.5 * mm, 3.2 * mm, stroke=0, fill=1)
            c.setFillColor(fg)
            c.setFont("PretendardBold", 6.8)
            c.drawCentredString(x + 9 * mm, 83.1 * mm, label)
            x += 21 * mm

        c.setFont("Pretendard", 8.5)
        c.setFillColor(C["soft"])
        c.drawString(0, 18 * mm, "무료 라이브 특강 참여자용 전자책")
        c.restoreState()


def draw_page(c, doc):
    c.saveState()
    w, h = PAGE_W, PAGE_H
    c.setFillColor(C["bg"])
    c.rect(0, 0, w, h, stroke=0, fill=1)
    if doc.page > 1:
        c.setStrokeColor(C["line"])
        c.setLineWidth(0.6)
        c.line(MARGIN_X, h - 13 * mm, w - MARGIN_X, h - 13 * mm)
        c.setFillColor(C["teal"])
        c.roundRect(MARGIN_X, h - 11.5 * mm, 34 * mm, 5.5 * mm, 2.7 * mm, stroke=0, fill=1)
        c.setFont("PretendardBold", 6.4)
        c.setFillColor(C["white"])
        c.drawCentredString(MARGIN_X + 17 * mm, h - 9.7 * mm, "FREE LIVE CLASS")
        c.setFont("Pretendard", 6.8)
        c.setFillColor(C["muted"])
        c.drawString(MARGIN_X, 8.5 * mm, "내 경험을 첫 강의로 바꾸는 5단계 워크북")
    c.restoreState()


def split_chunks(text: str) -> list[list[str]]:
    chunks: list[list[str]] = []
    current: list[str] = []
    for line in text.splitlines():
        if line.strip() == "---":
            if current:
                chunks.append(current)
                current = []
            continue
        current.append(line.rstrip())
    if current:
        chunks.append(current)
    return chunks


def is_table_line(line: str) -> bool:
    return line.strip().startswith("|") and line.strip().endswith("|")


def parse_table(lines: list[str], st: dict) -> Table | None:
    rows: list[list[str]] = []
    for line in lines:
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if all(re.fullmatch(r":?-{2,}:?", cell or "") for cell in cells):
            continue
        rows.append(cells)
    if not rows:
        return None
    cols = max(len(row) for row in rows)
    for row in rows:
        row.extend([""] * (cols - len(row)))

    data = []
    for r, row in enumerate(rows):
        style = ParagraphStyle(
            f"table_{r}",
            parent=st["small"],
            fontName="PretendardBold" if r == 0 else "Pretendard",
            textColor=C["ink"],
            leading=11.2,
        )
        data.append([Paragraph(esc(cell), style) for cell in row])

    if cols == 2:
        col_widths = [CONTENT_W * 0.32, CONTENT_W * 0.68]
    elif cols == 3:
        col_widths = [CONTENT_W * 0.24, CONTENT_W * 0.38, CONTENT_W * 0.38]
    else:
        col_widths = [CONTENT_W / cols for _ in range(cols)]

    table = Table(data, colWidths=col_widths, hAlign="LEFT", repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), C["panel"]),
                ("TEXTCOLOR", (0, 0), (-1, 0), C["teal"]),
                ("FONTNAME", (0, 0), (-1, 0), "PretendardBold"),
                ("FONTNAME", (0, 1), (-1, -1), "Pretendard"),
                ("GRID", (0, 0), (-1, -1), 0.45, C["line"]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def quote_box(text: str, st: dict) -> Table:
    inner = Paragraph(esc(text), st["quote"])
    table = Table([[inner]], colWidths=[CONTENT_W])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), C["panel"]),
                ("BOX", (0, 0), (-1, -1), 0.55, C["line"]),
                ("LINEBEFORE", (0, 0), (0, -1), 2.2, C["accent"]),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def add_step_nav(story: list, title: str, st: dict) -> None:
    m = re.match(r"(\d)단계\.", title)
    if not m:
        return
    current = int(m.group(1))
    cells = []
    for i in range(1, 6):
        bg = C["teal"] if i == current else C["panel"]
        fg = C["white"] if i == current else C["teal"]
        p = Paragraph(f"<font color='{fg.hexval()}'>STEP {i:02d}</font>", st["small"])
        cells.append(p)
    table = Table([cells], colWidths=[CONTENT_W / 5] * 5)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), C["panel"]),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOX", (0, 0), (-1, -1), 0.4, C["line"]),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, C["line"]),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    for i in range(5):
        table.setStyle(TableStyle([("BACKGROUND", (i, 0), (i, 0), C["teal"] if i + 1 == current else C["panel"])]))
    story.append(table)
    story.append(Spacer(1, 7))


def lines_to_flowables(lines: list[str], st: dict) -> list:
    story: list = []
    para: list[str] = []
    table_lines: list[str] = []
    quote_lines: list[str] = []

    def flush_para():
        nonlocal para
        if para:
            text = " ".join(part.strip() for part in para if part.strip())
            if text:
                story.append(Paragraph(esc(text), st["body"]))
            para = []

    def flush_table():
        nonlocal table_lines
        if table_lines:
            table = parse_table(table_lines, st)
            if table is not None:
                story.append(table)
                story.append(Spacer(1, 7))
            table_lines = []

    def flush_quote():
        nonlocal quote_lines
        if quote_lines:
            story.append(quote_box(" ".join(quote_lines), st))
            story.append(Spacer(1, 7))
            quote_lines = []

    for raw in lines:
        line = raw.strip()
        if is_table_line(line):
            flush_para()
            flush_quote()
            table_lines.append(line)
            continue
        flush_table()

        if line.startswith(">"):
            flush_para()
            quote_lines.append(line.lstrip(">").strip())
            continue
        flush_quote()

        if not line:
            flush_para()
            story.append(Spacer(1, 4))
            continue

        if line.startswith("# "):
            flush_para()
            title = line[2:].strip()
            add_step_nav(story, title, st)
            story.append(Paragraph(esc(title), st["h1"]))
            story.append(Spacer(1, 6))
        elif line.startswith("## "):
            flush_para()
            story.append(Paragraph(esc(line[3:].strip()), st["h2"]))
        elif line.startswith("### "):
            flush_para()
            story.append(Paragraph(esc(line[4:].strip()), st["h3"]))
        elif re.match(r"^\d+\.\s+", line):
            flush_para()
            story.append(Paragraph(esc(line), st["list"]))
        elif line.startswith("- "):
            flush_para()
            story.append(Paragraph(esc("• " + line[2:].strip()), st["list"]))
        else:
            para.append(line)

    flush_para()
    flush_table()
    flush_quote()
    return story


def build() -> None:
    register_fonts()
    st = styles()
    text = SOURCE.read_text(encoding="utf-8")
    chunks = split_chunks(text)
    cover_lines = [line for line in chunks[0] if line.strip()]
    title = cover_lines[0].lstrip("# ").strip()
    subtitle = cover_lines[1].strip() if len(cover_lines) > 1 else ""
    author = cover_lines[2].strip() if len(cover_lines) > 2 else "전종목"

    doc = SimpleDocTemplate(
        str(TMP_OUTPUT),
        pagesize=A4,
        leftMargin=MARGIN_X,
        rightMargin=MARGIN_X,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOTTOM,
        title=title,
        author=author,
    )

    story: list = [CoverPage(title, subtitle, author, st), PageBreak()]
    for i, chunk in enumerate(chunks[1:], start=1):
        flowables = lines_to_flowables(chunk, st)
        story.extend(flowables)
        if i != len(chunks) - 1:
            story.append(PageBreakIfNotEmpty())

    doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
    remove_blank_pages_and_number(TMP_OUTPUT, OUTPUT)
    TMP_OUTPUT.unlink(missing_ok=True)


def page_number_overlay(page_number: int) -> PdfReader:
    packet = BytesIO()
    c = canvas.Canvas(packet, pagesize=A4)
    c.setFont("Pretendard", 6.8)
    c.setFillColor(C["muted"])
    c.drawRightString(PAGE_W - MARGIN_X, 8.5 * mm, str(page_number))
    c.save()
    packet.seek(0)
    return PdfReader(packet)


def remove_blank_pages_and_number(src: Path, dest: Path) -> None:
    reader = PdfReader(str(src))
    writer = PdfWriter()
    footer = "내 경험을 첫 강의로 바꾸는 5단계 워크북"
    kept = []
    for index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        cleaned = text.replace("FREE LIVE CLASS", "").replace(footer, "")
        cleaned = re.sub(r"\s+", "", cleaned)
        if index > 1 and len(cleaned) < 4:
            continue
        kept.append(page)

    for new_index, page in enumerate(kept, start=1):
        if new_index > 1:
            overlay = page_number_overlay(new_index)
            page.merge_page(overlay.pages[0])
        writer.add_page(page)

    with dest.open("wb") as f:
        writer.write(f)


if __name__ == "__main__":
    build()
