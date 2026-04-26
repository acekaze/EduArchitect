from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
OUT_PDF = ROOT / "agentic_ai_설치_안내.pdf"
OUT_STEP_PDF = ROOT / "antigravity_fast_step_by_step.pdf"
SHOT_DIR = ROOT / "screenshots"
SHOT_DIR.mkdir(parents=True, exist_ok=True)
OUT_PNG = SHOT_DIR / "antigravity_설치흐름_캡처대체.png"

FONT_CANDIDATES = [
    Path("C:/Users/aceka/Downloads/Pretendard-1.3.9/public/static/alternative/Pretendard-Regular.ttf"),
    Path("C:/Users/aceka/AppData/Local/Microsoft/Windows/Fonts/PretendardVariable.ttf"),
]
FONT_BOLD_CANDIDATES = [
    Path("C:/Users/aceka/Downloads/Pretendard-1.3.9/public/static/alternative/Pretendard-Black.ttf"),
    Path("C:/Users/aceka/AppData/Local/Microsoft/Windows/Fonts/Pretendard-Black.otf"),
]


def pick_font(candidates):
    for path in candidates:
        if path.exists():
            return path
    raise FileNotFoundError("Pretendard font file not found")


FONT_REGULAR = pick_font(FONT_CANDIDATES)
FONT_BOLD = pick_font(FONT_BOLD_CANDIDATES)


def register_pdf_fonts():
    pdfmetrics.registerFont(TTFont("Pretendard", str(FONT_REGULAR)))
    pdfmetrics.registerFont(TTFont("PretendardBlack", str(FONT_BOLD)))


def draw_wrapped(c, text, x, y, width, font_name="Pretendard", size=10, leading=14):
    words = text.split(" ")
    line = ""
    for word in words:
        test = f"{line} {word}".strip()
        if c.stringWidth(test, font_name, size) <= width:
            line = test
        else:
            c.drawString(x, y, line)
            y -= leading
            line = word
    if line:
        c.drawString(x, y, line)
        y -= leading
    return y


def make_pdf():
    register_pdf_fonts()
    c = canvas.Canvas(str(OUT_PDF), pagesize=A4)
    w, h = A4
    margin = 18 * mm
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("PretendardBlack", 20)
    c.drawString(margin, h - 26 * mm, "Agentic AI 설치·세팅 실습 안내")
    c.setFont("Pretendard", 9)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(margin, h - 34 * mm, "공통 실습 도구: Google Antigravity / 대상: 일반 직장인 / 방식: 현장 설치")

    y = h - 48 * mm
    sections = [
        ("오늘 할 일", ["Antigravity 설치와 로그인", "샘플 폴더 열기", "첫 요청문 작성", "결과물 생성 전 승인 받기"]),
        ("쓰지 않을 것", ["실제 회사 자료", "개인정보", "계정키와 비밀번호", "외부 발송이 필요한 업무"]),
        ("첫 요청문", [
            "이 폴더는 Agentic AI 설치 실습용 샘플 폴더야.",
            "먼저 폴더 안의 자료를 읽고 업무 목적, 만들 수 있는 산출물, 필요한 질문, 승인받아야 할 행동을 정리해줘.",
            "내가 승인하기 전에는 파일을 만들거나 수정하지 마.",
        ]),
        ("설치가 안 될 때", ["옆 사람과 페어 실습으로 전환", "본인은 요청문 작성과 결과 점검 담당", "마지막 적용 문장은 개인별 작성"]),
    ]
    for title, items in sections:
        c.setFillColor(colors.HexColor("#0F3A66"))
        c.setFont("PretendardBlack", 13)
        c.drawString(margin, y, title)
        y -= 8 * mm
        c.setFillColor(colors.HexColor("#1F2937"))
        c.setFont("Pretendard", 10)
        for item in items:
            c.circle(margin + 2 * mm, y + 1.5 * mm, 1.2, fill=1, stroke=0)
            y = draw_wrapped(c, item, margin + 7 * mm, y, w - margin * 2 - 8 * mm, "Pretendard", 10, 14)
            y -= 2 * mm
        y -= 3 * mm

    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("PretendardBlack", 12)
    c.drawString(margin, 28 * mm, "내 업무 적용 문장")
    c.setFont("Pretendard", 9)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.drawString(margin, 21 * mm, "내가 맡기고 싶은 일은 ________ 이다. AI가 읽어도 되는 자료는 ________ 까지다.")
    c.drawString(margin, 16 * mm, "파일 생성과 수정은 내 승인 뒤에 진행한다. 최종 판단은 내가 직접 한다.")
    c.save()


def section_title(c, title, x, y):
    c.setFillColor(colors.HexColor("#0F3A66"))
    c.setFont("PretendardBlack", 13)
    c.drawString(x, y, title)
    return y - 8 * mm


def bullet(c, text, x, y, width, size=9.4):
    c.setFillColor(colors.HexColor("#2F7D4A"))
    c.circle(x + 2 * mm, y + 1.2 * mm, 1.15, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.setFont("Pretendard", size)
    return draw_wrapped(c, text, x + 7 * mm, y, width - 7 * mm, "Pretendard", size, 13) - 1.5 * mm


def step_box(c, no, title, body, x, y, w, h):
    c.setStrokeColor(colors.HexColor("#D7DEE8"))
    c.setFillColor(colors.HexColor("#FBFCFE"))
    c.roundRect(x, y - h, w, h, 5, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#2F7D4A"))
    c.circle(x + 8 * mm, y - 9 * mm, 5.2 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("PretendardBlack", 10)
    c.drawCentredString(x + 8 * mm, y - 10.8 * mm, str(no))
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("PretendardBlack", 10.5)
    c.drawString(x + 17 * mm, y - 8.8 * mm, title)
    c.setFillColor(colors.HexColor("#1F2937"))
    c.setFont("Pretendard", 8.5)
    draw_wrapped(c, body, x + 5 * mm, y - 18 * mm, w - 10 * mm, "Pretendard", 8.5, 11)


def make_step_pdf():
    register_pdf_fonts()
    c = canvas.Canvas(str(OUT_STEP_PDF), pagesize=A4)
    w, h = A4
    margin = 16 * mm

    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("PretendardBlack", 19)
    c.drawString(margin, h - 24 * mm, "Antigravity Fast 기반 설치·세팅 가이드")
    c.setFont("Pretendard", 8.8)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(margin, h - 31 * mm, "무료 제공 범위에서 먼저 실습하고, 다른 연결은 선택 확장으로 안내한다.")

    c.setFillColor(colors.HexColor("#EAF2FF"))
    c.setStrokeColor(colors.HexColor("#0F3A66"))
    c.roundRect(margin, h - 52 * mm, w - margin * 2, 15 * mm, 4, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Pretendard", 8.8)
    draw_wrapped(
        c,
        "오늘은 화면에 표시되는 무료 Fast 또는 빠른 기본 모드를 우선 선택한다. 화면 이름이 바뀌면 무료로 제공되는 빠른 모델을 고른다.",
        margin + 5 * mm,
        h - 42 * mm,
        w - margin * 2 - 10 * mm,
        "Pretendard",
        8.8,
        11,
    )

    y = h - 64 * mm
    y = section_title(c, "1. 설치 순서", margin, y)
    box_w = (w - margin * 2 - 8 * mm) / 2
    box_h = 31 * mm
    steps = [
        ("다운로드 페이지 열기", "antigravity.google/download로 이동한다. 브라우저는 Chrome 또는 Edge를 권장한다."),
        ("운영체제 선택", "Windows, macOS, Linux 중 본인 노트북에 맞는 설치 파일을 받는다."),
        ("설치 후 로그인", "설치 파일을 실행하고 Google 계정 또는 사용 가능한 계정으로 로그인한다."),
        ("Fast 기반으로 시작", "모델 선택 화면이 나오면 무료 Fast 또는 빠른 기본 모드를 고른다."),
        ("샘플 폴더 열기", "sample_workspace 폴더를 연다. 실제 회사 자료와 계정키는 넣지 않는다."),
        ("첫 요청문 입력", "파일 생성 전 계획과 승인 항목을 먼저 묻게 한다."),
    ]
    for idx, (title, body) in enumerate(steps, start=1):
        col = (idx - 1) % 2
        row = (idx - 1) // 2
        x = margin + col * (box_w + 8 * mm)
        yy = y - row * (box_h + 6 * mm)
        step_box(c, idx, title, body, x, yy, box_w, box_h)

    y = y - 3 * (box_h + 6 * mm) - 2 * mm
    y = section_title(c, "2. 첫 요청문", margin, y)
    prompt = [
        "이 폴더는 Agentic AI 설치 실습용 샘플 폴더야.",
        "먼저 폴더 안의 자료를 읽고 업무 목적, 만들 수 있는 산출물, 필요한 질문, 승인받아야 할 행동을 정리해줘.",
        "내가 승인하기 전에는 파일을 만들거나 수정하지 마.",
    ]
    c.setFillColor(colors.HexColor("#101318"))
    c.roundRect(margin, y - 33 * mm, w - margin * 2, 33 * mm, 5, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.setFont("Pretendard", 8.5)
    py = y - 8 * mm
    for line in prompt:
        c.drawString(margin + 5 * mm, py, line)
        py -= 8 * mm

    c.showPage()

    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("PretendardBlack", 17)
    c.drawString(margin, h - 24 * mm, "Fast 다음에 연결할 것")
    c.setFont("Pretendard", 8.8)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(margin, h - 31 * mm, "오늘은 설치 성공과 요청문 작성이 우선이다. 연결 옵션은 흐름만 안내한다.")

    y = h - 45 * mm
    rows = [
        ("고성능 모델", "모델 선택 메뉴에서 고성능 모델 선택 흐름만 보여준다.", "요금, 사용량, 계정 상태가 달라질 수 있다."),
        ("Codex", "같은 샘플 폴더를 읽고 계획을 제시하는 흐름을 강사 시연으로 비교한다.", "무료 계정 사용량과 로그인 상태가 사람마다 다를 수 있다."),
        ("Hermes", "반복 업무를 기억과 스킬로 축적하는 구조를 심화 시연으로 소개한다.", "WSL2, 모델/API 설정이 필요해 현장 설치에는 부담이 크다."),
        ("MCP·외부 도구", "파일, 브라우저, 일정, 메일 같은 도구 연결의 개념만 다룬다.", "외부 발송, 배포, 비용 발생, 개인정보 접근은 승인 후 진행한다."),
    ]
    col_w = [34 * mm, 76 * mm, 64 * mm]
    headers = ["연결 항목", "수업에서 다루는 방식", "주의할 점"]
    c.setFillColor(colors.HexColor("#F1F5F9"))
    c.setStrokeColor(colors.HexColor("#D7DEE8"))
    x = margin
    for i, header in enumerate(headers):
        c.rect(x, y - 10 * mm, col_w[i], 10 * mm, fill=1, stroke=1)
        c.setFillColor(colors.HexColor("#111827"))
        c.setFont("PretendardBlack", 8.5)
        c.drawString(x + 3 * mm, y - 6.5 * mm, header)
        x += col_w[i]
        c.setFillColor(colors.HexColor("#F1F5F9"))
    y -= 10 * mm
    for r, row in enumerate(rows):
        row_h = 27 * mm
        x = margin
        for i, cell in enumerate(row):
            c.setFillColor(colors.white if r % 2 == 0 else colors.HexColor("#F8FAFC"))
            c.setStrokeColor(colors.HexColor("#D7DEE8"))
            c.rect(x, y - row_h, col_w[i], row_h, fill=1, stroke=1)
            c.setFillColor(colors.HexColor("#1F2937"))
            c.setFont("PretendardBlack" if i == 0 else "Pretendard", 8.2)
            draw_wrapped(c, cell, x + 3 * mm, y - 7 * mm, col_w[i] - 6 * mm, "PretendardBlack" if i == 0 else "Pretendard", 8.2, 10.5)
            x += col_w[i]
        y -= row_h

    y -= 12 * mm
    y = section_title(c, "운영 문장", margin, y)
    y = bullet(c, "오늘의 목표: Antigravity를 설치하고 샘플 폴더에서 첫 에이전트 요청을 실행한다.", margin, y, w - margin * 2)
    y = bullet(c, "오늘의 제한: 실제 회사 자료, 개인정보, 계정키, 외부 발송 업무는 쓰지 않는다.", margin, y, w - margin * 2)
    y = bullet(c, "오늘의 결과: 내 업무에 적용할 요청문 1개와 승인 범위 1개를 작성한다.", margin, y, w - margin * 2)

    c.setFillColor(colors.HexColor("#64748B"))
    c.setFont("Pretendard", 7.5)
    c.drawString(margin, 18 * mm, "자료 대조일: 2026-04-26. 서비스 정책과 화면 명칭은 바뀔 수 있으므로 현장에서는 실제 무료 선택지를 우선한다.")
    c.save()


def make_png():
    img = Image.new("RGB", (1600, 900), "#F8FAFC")
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(str(FONT_REGULAR), 34)
    font_bold = ImageFont.truetype(str(FONT_BOLD), 46)
    small = ImageFont.truetype(str(FONT_REGULAR), 26)
    d.rounded_rectangle((80, 70, 1520, 830), radius=38, fill="#FFFFFF", outline="#D8E1EA", width=3)
    d.rectangle((80, 70, 1520, 160), fill="#EAF7EF")
    d.text((130, 98), "Antigravity 설치 흐름", font=font_bold, fill="#111827")
    steps = [
        ("1", "다운로드 페이지 열기"),
        ("2", "운영체제 선택"),
        ("3", "설치 후 로그인"),
        ("4", "샘플 폴더 열기"),
        ("5", "첫 요청문 입력"),
    ]
    x = 150
    for n, label in steps:
        d.rounded_rectangle((x, 290, x + 210, 480), radius=26, fill="#F8FAFC", outline="#CBD8E5", width=3)
        d.ellipse((x + 72, 320, x + 138, 386), fill="#2F7D4A")
        d.text((x + 92, 332), n, font=font, fill="#FFFFFF")
        d.text((x + 28, 420), label, font=small, fill="#1F2937")
        if n != "5":
            d.line((x + 230, 385, x + 290, 385), fill="#CBD8E5", width=8)
            d.polygon([(x + 290, 385), (x + 270, 372), (x + 270, 398)], fill="#CBD8E5")
        x += 270
    d.text((130, 640), "설치 실패자는 페어 실습으로 전환합니다. 핵심은 도구 설치보다 요청문과 승인 범위 작성입니다.", font=font, fill="#111827")
    img.save(OUT_PNG)


if __name__ == "__main__":
    make_pdf()
    make_step_pdf()
    make_png()
    print(OUT_PDF)
    print(OUT_STEP_PDF)
    print(OUT_PNG)
