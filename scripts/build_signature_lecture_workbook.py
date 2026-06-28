from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from textwrap import dedent

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path("C:/코딩/교육설계")
OUT_DIR = ROOT / "output/doc"
FONT_DIR = ROOT / ".codex-work/ai-collab-course-slides/fonts/pretendard/public/static/alternative"

PDF_OUT = OUT_DIR / "시그니처강의개발클래스_4회차_참가자워크북_재편본.pdf"
MD_OUT = OUT_DIR / "시그니처강의개발클래스_4회차_참가자워크북_재편본.md"

PAGE_W, PAGE_H = A4
MARGIN_X = 48
TOP = 58
BOTTOM = 50

NAVY = "#111827"
INK = "#171717"
MUTED = "#666666"
LIGHT = "#F3F4F6"
LINE = "#D7D7D7"
PURPLE = "#3517D8"
AMBER = "#A56A00"
PEACH = "#FFE7D5"


@dataclass
class Session:
    no: str
    title: str
    desc: str
    outputs: str


SESSIONS = [
    Session(
        "1강",
        "학습 환경과 강의 이해",
        "학습자가 배울 수 있는 환경을 직접 경험하고, 내 강의의 오프닝과 WHO(누구를 위한 강의인가)·WHY(왜 이 강의인가)를 정리합니다.",
        "오프닝 설계안, WHO·WHY 정리본",
    ),
    Session(
        "2강",
        "핵심 콘텐츠와 구조",
        "학습자가 반드시 이해해야 할 핵심(WHAT)을 압축하고, Why → What → How → If 흐름으로 내 강의의 뼈대를 만듭니다.",
        "강의 정의 문장, 1차 구조안",
    ),
    Session(
        "3강",
        "질문·활동·촉진 설계",
        "질문 설계, 활동 구성, Paired Share로 참여도와 에너지 흐름을 직접 설계합니다.",
        "질문·활동 설계안, 참여 흐름 설계",
    ),
    Session(
        "4강",
        "전달 기술과 미니 시연",
        "설명, 전환, 강조, 마무리, 동선, 비언어를 점검하고 핵심 구간을 직접 시연합니다.",
        "시연 피드백 기록, 시그니처 강의 개선안",
    ),
]


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Pretendard", str(FONT_DIR / "Pretendard-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Pretendard-Medium", str(FONT_DIR / "Pretendard-Medium.ttf")))
    pdfmetrics.registerFont(TTFont("Pretendard-SemiBold", str(FONT_DIR / "Pretendard-SemiBold.ttf")))
    pdfmetrics.registerFont(TTFont("Pretendard-Bold", str(FONT_DIR / "Pretendard-Bold.ttf")))


def hex_to_rgb(hex_color: str) -> tuple[float, float, float]:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) / 255 for i in (0, 2, 4))


def set_fill(c: canvas.Canvas, color: str) -> None:
    c.setFillColorRGB(*hex_to_rgb(color))


def set_stroke(c: canvas.Canvas, color: str) -> None:
    c.setStrokeColorRGB(*hex_to_rgb(color))


def draw_text(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    size: int = 11,
    font: str = "Pretendard",
    color: str = INK,
) -> None:
    c.setFont(font, size)
    set_fill(c, color)
    c.drawString(x, y, text)


def draw_wrapped(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    size: int = 11,
    leading: float = 17,
    font: str = "Pretendard",
    color: str = INK,
) -> float:
    c.setFont(font, size)
    set_fill(c, color)
    lines: list[str] = []
    for paragraph in text.split("\n"):
        if not paragraph:
            lines.append("")
            continue
        wrapped = simpleSplit(paragraph, font, size, width)
        lines.extend(wrapped)
    for line in lines:
        if line:
            c.drawString(x, y, line)
        y -= leading
    return y


def new_page(c: canvas.Canvas, title: str | None = None, section: str | None = None) -> None:
    if getattr(c, "_code", []):
        c.showPage()
    set_stroke(c, LINE)
    c.setLineWidth(0.7)
    c.line(MARGIN_X, BOTTOM - 8, PAGE_W - MARGIN_X, BOTTOM - 8)
    draw_text(c, "시그니처 강의 개발 클래스 참가자 워크북", MARGIN_X, BOTTOM - 28, 8, color=MUTED)
    draw_text(c, str(c.getPageNumber()), PAGE_W - MARGIN_X - 8, BOTTOM - 28, 8, color=MUTED)
    if section:
        draw_text(c, section, MARGIN_X, PAGE_H - 32, 9, "Pretendard-SemiBold", PURPLE)
    if title:
        draw_text(c, title, MARGIN_X, PAGE_H - TOP, 23, "Pretendard-Bold", INK)


def section_page(c: canvas.Canvas, session: Session) -> None:
    c.showPage()
    set_fill(c, NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    set_fill(c, PEACH)
    c.rect(0, 0, 138, PAGE_H, fill=1, stroke=0)
    draw_text(c, session.no, 44, PAGE_H / 2 + 18, 36, "Pretendard-Bold", INK)
    draw_text(c, session.title, 180, PAGE_H / 2 + 38, 34, "Pretendard-Bold", "#FFFFFF")
    y = draw_wrapped(c, session.desc, 180, PAGE_H / 2 - 10, 340, 13, 22, "Pretendard", "#E5E7EB")
    draw_text(c, f"결과물: {session.outputs}", 180, y - 18, 13, "Pretendard-SemiBold", "#FFD86B")


def write_lines(c: canvas.Canvas, x: float, y: float, width: float, count: int = 5, gap: float = 28) -> float:
    set_stroke(c, LINE)
    c.setLineWidth(0.8)
    for _ in range(count):
        c.line(x, y, x + width, y)
        y -= gap
    return y


def label_box(c: canvas.Canvas, label: str, x: float, y: float, w: float, h: float) -> None:
    set_stroke(c, LINE)
    set_fill(c, "#FFFFFF")
    c.roundRect(x, y - h, w, h, 8, fill=0, stroke=1)
    draw_text(c, label, x + 12, y - 20, 10, "Pretendard-SemiBold", MUTED)


def worksheet_page(
    c: canvas.Canvas,
    title: str,
    body: str,
    prompts: list[str],
    section: str,
    lines_each: int = 3,
) -> None:
    new_page(c, title, section)
    y = PAGE_H - TOP - 42
    y = draw_wrapped(c, body, MARGIN_X, y, PAGE_W - MARGIN_X * 2, 11, 18, color=MUTED)
    y -= 16
    for prompt in prompts:
        draw_text(c, prompt, MARGIN_X, y, 11, "Pretendard-SemiBold", INK)
        y -= 20
        y = write_lines(c, MARGIN_X, y, PAGE_W - MARGIN_X * 2, lines_each, 25)
        y -= 12
        if y < 115:
            break


def checklist_page(c: canvas.Canvas, title: str, items: list[str], notes: list[str], section: str) -> None:
    new_page(c, title, section)
    y = PAGE_H - TOP - 48
    for item in items:
        draw_text(c, "□", MARGIN_X, y, 13, "Pretendard-Bold", INK)
        y = draw_wrapped(c, item, MARGIN_X + 24, y, PAGE_W - MARGIN_X * 2 - 24, 11, 17)
        y -= 8
    y -= 10
    for note in notes:
        draw_text(c, note, MARGIN_X, y, 11, "Pretendard-SemiBold", INK)
        y -= 20
        y = write_lines(c, MARGIN_X, y, PAGE_W - MARGIN_X * 2, 3, 25)
        y -= 12


def table_course_map(c: canvas.Canvas) -> None:
    new_page(c, "4회차 과정 맵")
    y = PAGE_H - TOP - 54
    row_h = 116
    left_w = 84
    for s in SESSIONS:
        set_fill(c, PEACH)
        c.rect(MARGIN_X, y - row_h + 10, left_w, row_h, fill=1, stroke=0)
        set_stroke(c, LINE)
        c.rect(MARGIN_X, y - row_h + 10, PAGE_W - MARGIN_X * 2, row_h, fill=0, stroke=1)
        draw_text(c, s.no, MARGIN_X + 24, y - 48, 18, "Pretendard-Bold", INK)
        draw_text(c, s.title, MARGIN_X + left_w + 22, y - 28, 18, "Pretendard-Bold", PURPLE)
        desc_y = draw_wrapped(c, s.desc, MARGIN_X + left_w + 22, y - 54, PAGE_W - MARGIN_X * 2 - left_w - 44, 10, 16)
        draw_text(c, f"결과물: {s.outputs}", MARGIN_X + left_w + 22, desc_y - 4, 10, "Pretendard-SemiBold", AMBER)
        y -= row_h


def build_markdown() -> str:
    parts = [
        "# 시그니처 강의 개발 클래스 참가자 워크북",
        "",
        "내 강의를 실제로 설계하고, 운영 가능한 강의안으로 만드는 4회 과정",
        "",
        "## 교재 재편 방향",
        "",
        "- 기존 2일 과정용 문구와 날짜 표기를 제거했습니다.",
        "- 현재 강의를 운영 중인 강사뿐 아니라 강의 아이템을 가진 예비 강사도 작성할 수 있도록 바꿨습니다.",
        "- 1강부터 4강까지 결과물이 이어지도록 워크시트를 재배치했습니다.",
        "- 학습 환경, 오프닝, 질문 설계, 적용 질문을 독립된 장으로 보강했습니다.",
        "",
        "## 4회차 구성",
    ]
    for s in SESSIONS:
        parts += ["", f"### {s.no}. {s.title}", "", s.desc, "", f"결과물: {s.outputs}"]
    parts += [
        "",
        "## 핵심 운영 원칙",
        "",
        "좋은 강의는 정보 전달보다 먼저 학습자가 배울 수 있는 상태를 만드는 일에서 시작합니다. 학습자가 낯섦과 긴장을 낮추고, 지금 이 강의가 자기 문제와 연결된다고 느낄 때 이해와 참여가 올라갑니다.",
        "",
        "오프닝은 무겁게 고백시키는 시간이 아니라, 서로 어색함을 낮추고 강의의 필요를 자연스럽게 만나게 하는 시간입니다. 과거 경험, 상상 질문, 필요 질문을 활용하되 질문은 짧고 명확해야 합니다.",
        "",
        "질문은 이해 여부를 묻는 도구가 아니라 학습자가 자기 머리로 한 번 더 정리하게 만드는 장치입니다. 강의의 마지막은 요약만으로 끝내지 않고 적용 질문으로 연결합니다.",
    ]
    return "\n".join(parts) + "\n"


def build_pdf() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(PDF_OUT), pagesize=A4)

    # Cover
    set_fill(c, NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    set_fill(c, PEACH)
    c.rect(0, 0, PAGE_W, 145, fill=1, stroke=0)
    draw_text(c, "전환설계연구소", MARGIN_X, PAGE_H - 74, 12, "Pretendard-SemiBold", "#FFFFFF")
    draw_text(c, "시그니처 강의", MARGIN_X, PAGE_H - 170, 42, "Pretendard-Bold", "#FFFFFF")
    draw_text(c, "개발 클래스", MARGIN_X, PAGE_H - 222, 42, "Pretendard-Bold", "#FFFFFF")
    draw_text(c, "참가자 워크북", MARGIN_X, PAGE_H - 278, 22, "Pretendard-SemiBold", "#FFD86B")
    draw_wrapped(c, "내 강의를 실제로 설계하고, 운영 가능한 강의안으로 만드는 4회 과정", MARGIN_X, 112, PAGE_W - MARGIN_X * 2, 15, 23, "Pretendard-SemiBold", INK)
    c.showPage()

    # Participant info
    new_page(c, "워크북 정보")
    y = PAGE_H - TOP - 54
    draw_wrapped(c, "이 워크북은 강의 아이템을 가진 사람 또는 이미 강의를 운영 중인 사람이 자신의 강의를 실제 운영 가능한 형태로 설계하기 위해 사용합니다.", MARGIN_X, y, PAGE_W - MARGIN_X * 2, 12, 19, color=MUTED)
    y -= 86
    for label in ["이름", "소속", "강의 주제", "연락처", "이메일"]:
        draw_text(c, label, MARGIN_X, y, 11, "Pretendard-SemiBold", INK)
        set_stroke(c, LINE)
        c.line(MARGIN_X + 82, y - 2, PAGE_W - MARGIN_X, y - 2)
        y -= 42

    # How to use
    new_page(c, "이 워크북을 쓰는 방법")
    y = PAGE_H - TOP - 52
    bullets = [
        "현재 운영 중인 강의가 있다면 그 강의 1개를 선택합니다. 아직 강의가 없다면 만들고 싶은 강의 아이템 1개로 작성합니다.",
        "완성된 문장을 쓰려 하기보다 수정 가능한 초안을 만드는 데 집중합니다.",
        "피드백을 받으면 평가로만 듣지 말고, 다음 수정 행동으로 바꿔 적습니다.",
        "과정이 끝나면 오프닝 설계안, WHO·WHY 정리본, 강의 정의 문장, 질문·활동 설계안, 시연 피드백 기록, 시그니처 강의 개선안을 갖게 됩니다.",
    ]
    for b in bullets:
        draw_text(c, "•", MARGIN_X, y, 12, "Pretendard-Bold", PURPLE)
        y = draw_wrapped(c, b, MARGIN_X + 20, y, PAGE_W - MARGIN_X * 2 - 20, 11, 18)
        y -= 10
    y -= 18
    draw_text(c, "이번 과정에서 가장 얻고 싶은 것", MARGIN_X, y, 11, "Pretendard-SemiBold", INK)
    y -= 22
    write_lines(c, MARGIN_X, y, PAGE_W - MARGIN_X * 2, 4, 28)

    table_course_map(c)

    new_page(c, "핵심 관점: 강의는 환경에서 시작합니다")
    y = PAGE_H - TOP - 46
    paragraphs = [
        "학습자가 배울 수 있는 환경은 단순히 조용한 장소나 좋은 자료를 뜻하지 않습니다. 낯섦과 긴장이 낮아지고, 스스로 생각할 여지가 생기는 상태를 말합니다.",
        "학습자 간의 어색함이 줄어들고, 강의가 자기 필요와 연결될 때 참여가 시작됩니다. 그래서 오프닝은 형식적인 인사가 아니라 학습 환경을 여는 첫 설계입니다.",
        "이 과정의 목표는 강사가 더 많이 말하는 것이 아닙니다. 학습자가 자기 언어로 정리하고, 적용하고, 실제 행동으로 옮길 수 있도록 강의를 다시 구성하는 것입니다.",
    ]
    for p in paragraphs:
        y = draw_wrapped(c, p, MARGIN_X, y, PAGE_W - MARGIN_X * 2, 12, 21)
        y -= 18
    y -= 8
    draw_text(c, "내 강의에서 학습자가 편안해지는 순간은 언제인가", MARGIN_X, y, 11, "Pretendard-SemiBold", INK)
    y -= 22
    write_lines(c, MARGIN_X, y, PAGE_W - MARGIN_X * 2, 5, 28)

    # Session 1
    section_page(c, SESSIONS[0])
    worksheet_page(
        c,
        "내 강의 출발점",
        "현재 강의 또는 만들고 싶은 강의 아이템의 상태를 정리합니다.",
        ["강의 주제", "대상", "강의가 필요한 상황", "지금 가장 먼저 바꾸고 싶은 점"],
        "1강 학습 환경과 강의 이해",
    )
    worksheet_page(
        c,
        "WHO 정리",
        "이 강의가 누구를 위한 강의인지 구체적으로 적습니다.",
        ["이 강의를 가장 필요로 하는 사람", "그 사람이 지금 겪는 실제 문제", "강의 전 그 사람의 상태", "강의 후 기대되는 변화"],
        "1강 학습 환경과 강의 이해",
    )
    worksheet_page(
        c,
        "WHY 정리",
        "왜 이 강의가 필요한지 학습자 입장에서 정리합니다.",
        ["학습자가 이 강의를 들어야 하는 이유", "지금 배우지 않으면 생기는 어려움", "잘 배웠을 때 얻는 이익", "강사가 이 주제를 다룰 수 있는 이유"],
        "1강 학습 환경과 강의 이해",
    )
    worksheet_page(
        c,
        "오프닝 연결 질문 설계",
        "강의 시작은 연결과 공감이어야 합니다. 다만 무겁게 시작하지 않습니다. 학습자의 필요와 바로 연결되는 질문을 짧고 자연스럽게 설계합니다.",
        ["니즈와 연결되는 첫 질문", "과거 경험을 떠올리게 하는 질문", "잘 되었을 때와 잘 되지 않았을 때를 상상하게 하는 질문", "옆 사람과 짧게 나눌 질문"],
        "1강 학습 환경과 강의 이해",
    )
    new_page(c, "5분 오프닝 설계 예시", "1강 학습 환경과 강의 이해")
    y = PAGE_H - TOP - 48
    example = (
        "예시 질문\n"
        "만약 내 강의가 잘 만들어지면 어떻게 될까요? 반대로 강의가 최악으로 구성된다면 어떤 일이 생길까요? 잠깐 상상해 보고 옆 사람과 이야기 나눠 봅시다.\n\n"
        "예시 한 문장 약속\n"
        "오늘 제 강의를 들으신다면 학습자가 제대로 배울 수 있도록 설계되고 구성된, 자신만의 탁월한 강의를 가져가시게 될 겁니다."
    )
    y = draw_wrapped(c, example, MARGIN_X, y, PAGE_W - MARGIN_X * 2, 12, 22)
    y -= 22
    draw_text(c, "내 강의 오프닝 초안", MARGIN_X, y, 11, "Pretendard-SemiBold", INK)
    y -= 22
    write_lines(c, MARGIN_X, y, PAGE_W - MARGIN_X * 2, 8, 26)

    # Session 2
    section_page(c, SESSIONS[1])
    worksheet_page(
        c,
        "WHAT 핵심 압축",
        "학습자가 반드시 이해해야 할 핵심을 줄여 적습니다. 좋은 강의는 많이 넣는 강의가 아니라 무엇을 가져가야 하는지 분명한 강의입니다.",
        ["이 강의의 핵심 한 문장", "반드시 가져가야 할 핵심 메시지 3개", "지금 덜어낼 수 있는 내용", "반드시 남겨야 할 사례나 활동"],
        "2강 핵심 콘텐츠와 구조",
    )
    worksheet_page(
        c,
        "강의 정의 문장",
        "누구에게, 어떤 내용으로, 어떤 이익을 줄 수 있는지 한 문장으로 정리합니다.",
        ["초안", "더 짧고 직관적으로 바꾼 문장", "어린아이도 이해할 수 있는 표현", "최종 문장"],
        "2강 핵심 콘텐츠와 구조",
    )
    worksheet_page(
        c,
        "Why → What → How → If 구조",
        "강의의 뼈대를 네 흐름으로 정리합니다.",
        ["Why: 왜 이 강의가 필요한가", "What: 무엇을 이해해야 하는가", "How: 어떻게 적용할 것인가", "If: 적용하면 무엇이 달라지는가"],
        "2강 핵심 콘텐츠와 구조",
    )
    worksheet_page(
        c,
        "1차 구조안",
        "도입, 전개, 적용, 마무리 순서로 강의 구조를 적습니다.",
        ["도입", "전개", "적용", "마무리"],
        "2강 핵심 콘텐츠와 구조",
        lines_each=4,
    )

    # Session 3
    section_page(c, SESSIONS[2])
    new_page(c, "질문 타입과 예시", "3강 질문·활동·촉진 설계")
    y = PAGE_H - TOP - 45
    q_types = [
        ("니즈 연결 질문", "학습자가 왜 지금 이 강의를 들어야 하는지 자기 상황과 연결합니다.", "예시: 이 주제가 제대로 해결되면 지금 하는 일에서 무엇이 가장 달라질까요?"),
        ("경험 회상 질문", "이미 겪은 상황을 떠올리게 해 강의 내용의 필요를 체감하게 합니다.", "예시: 비슷한 상황에서 가장 답답했던 순간은 언제였나요?"),
        ("상상 질문", "잘 되었을 때와 잘 되지 않았을 때를 비교하게 합니다.", "예시: 이 강의가 잘 만들어지면 어떤 반응을 듣게 될까요? 반대로 준비가 부족하면 어떤 문제가 생길까요?"),
        ("정리 질문", "학습자가 들은 내용을 자기 언어로 한 번 더 정리하게 합니다.", "예시: 방금 내용을 한 문장으로 말한다면 어떻게 표현하시겠습니까?"),
        ("적용 질문", "강의 내용을 삶이나 일의 다음 행동으로 연결합니다.", "예시: 오늘 바로 바꿔볼 한 가지는 무엇입니까?"),
    ]
    for name, desc, ex in q_types:
        draw_text(c, name, MARGIN_X, y, 13, "Pretendard-Bold", PURPLE)
        y -= 20
        y = draw_wrapped(c, desc, MARGIN_X, y, PAGE_W - MARGIN_X * 2, 10.5, 16, color=INK)
        y = draw_wrapped(c, ex, MARGIN_X, y - 2, PAGE_W - MARGIN_X * 2, 10.5, 16, color=AMBER)
        y -= 12

    worksheet_page(
        c,
        "질문 설계안",
        "질문은 단순히 이해됐는지 묻는 확인 문장이 아닙니다. 학습자가 자기 머리로 한 번 더 정리하게 만드는 장치입니다.",
        ["오프닝 질문", "핵심 내용 이해를 돕는 질문", "짝과 나눌 질문", "마지막 적용 질문"],
        "3강 질문·활동·촉진 설계",
    )
    worksheet_page(
        c,
        "활동 설계안",
        "활동은 분위기 전환용 장치가 아니라 학습자가 직접 정리하고 적용하도록 돕는 구조입니다.",
        ["활동 이름", "활동 목적", "진행 방식", "활동 후 공유 방식"],
        "3강 질문·활동·촉진 설계",
    )
    worksheet_page(
        c,
        "Paired Share 설계",
        "두 사람이 짧게 나누는 방식으로 참여 장벽을 낮추고 에너지를 올립니다.",
        ["짝과 나눌 질문", "대화 시간 공지", "공유 방식", "강사가 다시 연결할 멘트"],
        "3강 질문·활동·촉진 설계",
    )
    worksheet_page(
        c,
        "참여 흐름 설계",
        "초반에는 부담이 낮은 참여에서 시작하고, 후반에는 자기 언어로 정리하고 적용하는 참여로 옮겨갑니다.",
        ["초반 참여", "중반 참여", "후반 참여", "참여가 약해질 때 보완할 장치"],
        "3강 질문·활동·촉진 설계",
    )

    # Session 4
    section_page(c, SESSIONS[3])
    checklist_page(
        c,
        "전달 기술 점검표",
        [
            "설명: 핵심을 짧고 명확하게 말한다.",
            "전환: 다음 내용으로 넘어가는 이유를 알려준다.",
            "강조: 중요한 문장을 속도, 멈춤, 반복으로 살린다.",
            "마무리: 요약보다 적용 질문으로 끝낸다.",
            "시간: 활동 시간과 공유 시간을 정확히 공지한다.",
        ],
        ["전달이 약한 구간", "바로 수정할 표현"],
        "4강 전달 기술과 미니 시연",
    )
    worksheet_page(
        c,
        "동선과 비언어 설계",
        "설명, 질문, 활동, 마무리마다 강사의 위치와 비언어가 달라질 수 있습니다. 이동은 의미가 있을 때만 사용합니다.",
        ["설명할 때 위치", "질문할 때 위치", "활동을 안내할 때 위치", "고쳐야 할 비언어 습관"],
        "4강 전달 기술과 미니 시연",
    )
    worksheet_page(
        c,
        "미니 시연 준비",
        "전체 강의가 아니라 핵심 구간을 짧게 시연합니다. 무엇을 점검받을지 먼저 적어야 피드백이 실제 수정으로 이어집니다.",
        ["시연 구간", "시연 목표", "점검받고 싶은 포인트", "시연 전 마지막으로 다듬을 문장"],
        "4강 전달 기술과 미니 시연",
    )
    worksheet_page(
        c,
        "시연 피드백 기록",
        "피드백은 좋았다, 아쉬웠다로 끝내지 않습니다. 문장, 구조, 촉진, 전달로 나누어 적습니다.",
        ["잘한 점", "수정하면 더 좋아질 점", "문장 피드백", "구조 피드백", "촉진 피드백", "전달 피드백"],
        "4강 전달 기술과 미니 시연",
        lines_each=2,
    )
    worksheet_page(
        c,
        "시그니처 강의 개선안",
        "과정 전체를 반영해 내 강의의 최종 개선안을 정리합니다.",
        ["강의명", "강의 정의 문장", "핵심 메시지", "오프닝 설계", "질문·활동 핵심", "전달 수정 포인트"],
        "4강 전달 기술과 미니 시연",
        lines_each=2,
    )
    worksheet_page(
        c,
        "과정 후 실행 계획",
        "강의는 듣는 시간만으로 완성되지 않습니다. 자기 언어로 말하고, 적고, 적용할 때 실제 변화가 시작됩니다.",
        ["바로 수정할 것 3개", "다음 운영 전 보완할 것 3개", "2주 안에 실행할 행동", "다음 피드백을 받을 사람"],
        "마무리",
    )
    for idx in range(1, 3):
        new_page(c, f"Memo {idx}", "메모")
        write_lines(c, MARGIN_X, PAGE_H - TOP - 48, PAGE_W - MARGIN_X * 2, 18, 31)

    c.save()


def main() -> None:
    register_fonts()
    build_pdf()
    MD_OUT.write_text(build_markdown(), encoding="utf-8")
    print(PDF_OUT)
    print(MD_OUT)


if __name__ == "__main__":
    main()
