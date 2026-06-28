from __future__ import annotations

from pathlib import Path
import unicodedata

from PIL import Image, ImageDraw, ImageFont


ROOT = Path("C:/코딩/교육설계")
FONT_DIR = ROOT / ".codex-work/ai-collab-course-slides/fonts/pretendard/public/static/alternative"
OUT_DIR = ROOT / "output/img/주력강의재설계_후기카드"
OUT = OUT_DIR / "긴후기_10년차강사_캡처스타일.png"

W = 900
PAD_X = 28
PAD_TOP = 18
PAD_BOTTOM = 26
BODY_LINE_GAP = 9
PARA_GAP = 22


REVIEW = """10년 전,  전종목 코치님께 강의 수업을 들으며 강사 생활을 시작했어요. 

덕분에 제 강의는 처음부터 결이 다르다는 평을 들었고, 만족도는 늘 높았고, 수강생들은 아낌없이 박수를 쳐주었답니다. 

그렇게 10년이라는 시간이 흘렀지만, 사실 20년으로 향하는 길목에서 문득 막막함이 찾아왔어요.

사람들은 여전히 제 강의에 환호를 보내는데 정작 가르치는 저는 재미를 잃어가고 있었고, 단순히 지식 전달을 넘어 수강생의 삶을 바꾸는 진짜 교육에 대한 갈증이 너무 심했어요.

 특히 비즈니스 현장의 날것과 마주해야 하는 기업 교육 비중이 커질수록, 제 이야기를 전하는 수준을 넘어 강의를 완전히 재정의해야 한다는 압박에 밤잠을 설치기도 하다가 한의원에 다니는 건 부지기수..

그렇게 막막한 강의가 계속 이어지고 있을 때 코치님이 강의를 하신다는 소식을 들었어요. 

실은 코치님을 뵐 때마다 강의 좀 열어달라고 간곡히 요청하곤 했었는데, 제 강의를 객관적으로 평가하고 이끌어줄 선배이자 컨설턴트가 제게는 너무나 절실했기 때문.. (아시죠?연차가 찰수록 혼내고, 교육해줄 선생님이 안계시다는 것..)

모두가 쉬는 5월 1일,2일. 코치님의 수업을 들으며 아침 10시부터 저녁 7시까지, 단 1분도 허투루 쓰지 않고.. 이틀 동안 제 강의의 뼈대를 완전히 뒤엎었어요.

그동안 마이크 뒤에 숨겨두었던 강사로서의 고충과 부족함을 정면으로 마주하니 울컥 눈물이 나기도 했고, 저녁에는 호텔에서 동료와 밤늦게까지 숙제에 매달리며 스스로를 끊임없이 몰아붙였고요. 

마지막 시연까지 제 강점과 고칠 점을 예리하게 분석해 주시는 코치님을 보며, 왜 국내 탑 기업들이 그를 먼저 찾는지 다시 한번 뼈저리게 체감했습니다.

코치님의 강의를 10년이나 기다려온 제자로서 이번 수업은 제 강사 인생의 제2막을 여는 소중한 열쇠였어요. 이제 코치님의 수업을 기반으로 10년, 20년..
100년까지(!)

 수강생의 삶을 업그레이드하고 실질적인 결과를 만들어내는 강사로, 누구든지 믿고 맡기는, 돈값하는! 강사로 성장할 거고요. 

저처럼 자신의 한계를 깨고 스스로의 힘으로 날아오르고 싶은 강사라면, 코치님의 압도적인 통찰력을 절대 놓치지 않았으면 해요. 코치님, 진심으로 존경하고 사랑합니다🥰"""


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / name), size=size)


F_META = font("Pretendard-Regular.ttf", 28)
F_META_SMALL = font("Pretendard-Regular.ttf", 26)
F_BODY = font("Pretendard-Regular.ttf", 31)
F_STARS = font("Pretendard-Bold.ttf", 33)

EMOJI_FONT_PATH = Path("C:/Windows/Fonts/seguiemj.ttf")
F_EMOJI = ImageFont.truetype(str(EMOJI_FONT_PATH), size=31) if EMOJI_FONT_PATH.exists() else F_BODY


def is_emoji(ch: str) -> bool:
    return unicodedata.category(ch) == "So" or ord(ch) >= 0x1F000


def measure_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    if not text:
        return 0
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def measure_mixed(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    width = 0
    for ch in text:
        width += measure_text(draw, ch, F_EMOJI if is_emoji(ch) else fnt)
    return width


def wrap_paragraph(draw: ImageDraw.ImageDraw, paragraph: str, max_w: int) -> list[str]:
    if not paragraph:
        return [""]
    words = paragraph.split(" ")
    lines: list[str] = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if measure_mixed(draw, trial, F_BODY) <= max_w:
            current = trial
            continue
        if current:
            lines.append(current)
        if measure_mixed(draw, word, F_BODY) <= max_w:
            current = word
            continue
        piece = ""
        for ch in word:
            trial_piece = piece + ch
            if measure_mixed(draw, trial_piece, F_BODY) <= max_w:
                piece = trial_piece
            else:
                if piece:
                    lines.append(piece)
                piece = ch
        current = piece
    if current:
        lines.append(current)
    return lines


def wrapped_body(draw: ImageDraw.ImageDraw) -> list[tuple[str, bool]]:
    lines: list[tuple[str, bool]] = []
    paragraphs = REVIEW.split("\n")
    for idx, paragraph in enumerate(paragraphs):
        if paragraph == "":
            lines.append(("", True))
            continue
        for line in wrap_paragraph(draw, paragraph, W - PAD_X * 2):
            lines.append((line, False))
        if idx != len(paragraphs) - 1:
            lines.append(("", True))
    return lines


def line_height(fnt: ImageFont.FreeTypeFont) -> int:
    ascent, descent = fnt.getmetrics()
    return ascent + descent


def draw_mixed_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, fnt: ImageFont.FreeTypeFont, fill: str) -> None:
    x, y = xy
    for ch in text:
        ch_font = F_EMOJI if is_emoji(ch) else fnt
        kwargs = {"embedded_color": True} if is_emoji(ch) else {"fill": fill}
        draw.text((x, y), ch, font=ch_font, **kwargs)
        x += measure_text(draw, ch, ch_font)


def build_card() -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    temp = Image.new("RGB", (W, 1000), "white")
    draw = ImageDraw.Draw(temp)
    lines = wrapped_body(draw)

    header_h = 94
    body_h = 0
    for _, is_gap in lines:
        body_h += PARA_GAP if is_gap else line_height(F_BODY) + BODY_LINE_GAP
    h = PAD_TOP + header_h + body_h + PAD_BOTTOM

    img = Image.new("RGB", (W, h), "white")
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, W - 1, h - 1), outline="#111111", width=2)

    y = PAD_TOP
    draw.text((PAD_X, y), "★★★★★", font=F_STARS, fill="#FF3B30")
    star_w = measure_text(draw, "★★★★★", F_STARS)
    draw.text((PAD_X + star_w + 18, y + 1), "10년차 강사 후기", font=F_META, fill="#333333")
    y += 43
    draw.text((PAD_X, y), "주력강의 재설계 과정", font=F_META_SMALL, fill="#777777")
    y += 56

    for line, is_gap in lines:
        if is_gap:
            y += PARA_GAP
            continue
        draw_mixed_text(draw, (PAD_X, y), line, F_BODY, "#222222")
        y += line_height(F_BODY) + BODY_LINE_GAP

    img.save(OUT, quality=96)
    return OUT


def main() -> None:
    print(build_card())


if __name__ == "__main__":
    main()
