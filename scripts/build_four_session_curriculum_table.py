from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path("C:/코딩/교육설계")
FONT_DIR = ROOT / ".codex-work/ai-collab-course-slides/fonts/pretendard/public/static/alternative"
OUT_DIR = ROOT / "output/img/주력강의재설계_후기카드"
OUT = OUT_DIR / "4회차_커리큘럼_표_일정제외.png"
OUT_WHITE = OUT_DIR / "4회차_커리큘럼_표_일정제외_화이트버전.png"

W = 1600
H = 900
LEFT_W = 360
ROW_H = H // 4

BG_RIGHT = "#050505"
LINE = "#111111"
ACCENT = "#4B22FF"
TEXT = "#F5F5F5"
MUTED = "#D4D4D4"
RESULT = "#FFD86B"


SESSIONS = [
    {
        "no": "1강",
        "title": "학습 환경과 강의 이해",
        "desc": "학습자가 배울 수 있는 환경을 직접 경험하고, 내 강의의 오프닝과 WHO(누구를 위한 강의인가)·WHY(왜 이 강의인가)를 정리합니다.",
        "result": "결과물: 오프닝 설계안, WHO·WHY 정리본",
    },
    {
        "no": "2강",
        "title": "핵심 콘텐츠와 구조",
        "desc": "학습자가 반드시 이해해야 할 핵심(WHAT)을 압축하고, Why → What → How → If 흐름으로 내 강의의 뼈대를 만듭니다.",
        "result": "결과물: 강의 정의 문장, 1차 구조안",
    },
    {
        "no": "3강",
        "title": "질문·활동·촉진 설계",
        "desc": "질문 설계, 활동 구성, Paired Share로 참여도와 에너지 흐름을 직접 설계합니다.",
        "result": "결과물: 질문·활동 설계안, 참여 흐름 설계",
    },
    {
        "no": "4강",
        "title": "전달 기술과 미니 시연",
        "desc": "설명, 전환, 강조, 마무리, 동선, 비언어를 점검하고 핵심 구간을 직접 시연합니다.",
        "result": "결과물: 시연 피드백 기록, 시그니처 강의 개선안",
    },
]


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / name), size=size)


F_NO = font("Pretendard-Bold.ttf", 55)
F_TITLE = font("Pretendard-Bold.ttf", 43)
F_DESC = font("Pretendard-Regular.ttf", 31)
F_RESULT = font("Pretendard-SemiBold.ttf", 30)


def text_w(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def text_h(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[3] - box[1]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    words = text.split(" ")
    lines: list[str] = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if text_w(draw, trial, fnt) <= max_w:
            current = trial
            continue
        if current:
            lines.append(current)
        if text_w(draw, word, fnt) <= max_w:
            current = word
            continue
        piece = ""
        for ch in word:
            trial_piece = piece + ch
            if text_w(draw, trial_piece, fnt) <= max_w:
                piece = trial_piece
            else:
                if piece:
                    lines.append(piece)
                piece = ch
        current = piece
    if current:
        lines.append(current)
    return lines


def draw_left_gradient(img: Image.Image) -> None:
    pix = img.load()
    c1 = (255, 52, 52)
    c2 = (255, 151, 74)
    for x in range(LEFT_W):
        t = x / max(1, LEFT_W - 1)
        r = int(c1[0] * (1 - t) + c2[0] * t)
        g = int(c1[1] * (1 - t) + c2[1] * t)
        b = int(c1[2] * (1 - t) + c2[2] * t)
        for y in range(H):
            pix[x, y] = (r, g, b)


def draw_left_gradient_white(img: Image.Image) -> None:
    pix = img.load()
    c1 = (255, 239, 230)
    c2 = (255, 206, 168)
    for x in range(LEFT_W):
        t = x / max(1, LEFT_W - 1)
        r = int(c1[0] * (1 - t) + c2[0] * t)
        g = int(c1[1] * (1 - t) + c2[1] * t)
        b = int(c1[2] * (1 - t) + c2[2] * t)
        for y in range(H):
            pix[x, y] = (r, g, b)


def draw_table() -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (W, H), BG_RIGHT)
    draw_left_gradient(img)
    draw = ImageDraw.Draw(img)

    draw.rectangle((0, 0, W - 1, H - 1), outline=LINE, width=4)
    draw.line((LEFT_W, 0, LEFT_W, H), fill=LINE, width=4)
    for idx in range(1, 4):
        y = idx * ROW_H
        draw.line((0, y, W, y), fill=LINE, width=4)

    right_x = LEFT_W + 54
    right_w = W - LEFT_W - 92
    desc_lh = 42

    for idx, session in enumerate(SESSIONS):
        y0 = idx * ROW_H
        y1 = y0 + ROW_H
        center_y = y0 + ROW_H // 2

        no_w = text_w(draw, session["no"], F_NO)
        no_h = text_h(draw, session["no"], F_NO)
        draw.text(((LEFT_W - no_w) // 2, center_y - no_h // 2 - 4), session["no"], font=F_NO, fill="#050505")

        title_y = y0 + 34
        draw.text((right_x, title_y), session["title"], font=F_TITLE, fill=ACCENT)

        desc_lines = wrap_text(draw, session["desc"], F_DESC, right_w)
        desc_y = title_y + 62
        for line in desc_lines:
            draw.text((right_x, desc_y), line, font=F_DESC, fill=TEXT)
            desc_y += desc_lh

        result_y = min(y1 - 48, desc_y + 16)
        draw.text((right_x, result_y), session["result"], font=F_RESULT, fill=RESULT)

    img.save(OUT, quality=96)
    return OUT


def draw_table_white() -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (W, H), "#FFFFFF")
    draw_left_gradient_white(img)
    draw = ImageDraw.Draw(img)

    line = "#D6D6D6"
    title = "#3517D8"
    desc = "#202020"
    result = "#A56A00"
    left_text = "#111111"

    draw.rectangle((0, 0, W - 1, H - 1), outline=line, width=4)
    draw.line((LEFT_W, 0, LEFT_W, H), fill=line, width=4)
    for idx in range(1, 4):
        y = idx * ROW_H
        draw.line((0, y, W, y), fill=line, width=4)

    right_x = LEFT_W + 54
    right_w = W - LEFT_W - 92
    desc_lh = 42

    for idx, session in enumerate(SESSIONS):
        y0 = idx * ROW_H
        y1 = y0 + ROW_H
        center_y = y0 + ROW_H // 2

        no_w = text_w(draw, session["no"], F_NO)
        no_h = text_h(draw, session["no"], F_NO)
        draw.text(((LEFT_W - no_w) // 2, center_y - no_h // 2 - 4), session["no"], font=F_NO, fill=left_text)

        title_y = y0 + 34
        draw.text((right_x, title_y), session["title"], font=F_TITLE, fill=title)

        desc_lines = wrap_text(draw, session["desc"], F_DESC, right_w)
        desc_y = title_y + 62
        for line_text in desc_lines:
            draw.text((right_x, desc_y), line_text, font=F_DESC, fill=desc)
            desc_y += desc_lh

        result_y = min(y1 - 48, desc_y + 16)
        draw.text((right_x, result_y), session["result"], font=F_RESULT, fill=result)

    img.save(OUT_WHITE, quality=96)
    return OUT_WHITE


def main() -> None:
    print(draw_table())
    print(draw_table_white())


if __name__ == "__main__":
    main()
