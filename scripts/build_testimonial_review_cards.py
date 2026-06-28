from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path("C:/코딩/교육설계")
FONT_DIR = ROOT / ".codex-work/ai-collab-course-slides/fonts/pretendard/public/static/alternative"
OUT_DIR = ROOT / "output/img/주력강의재설계_후기카드"

W = 1600
PAD_X = 26
PAD_TOP = 28
PAD_BOTTOM = 28
LINE_GAP = 10
PARA_GAP = 28


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / name), size=size)


F_TITLE = font("Pretendard-Medium.ttf", 24)
F_META = font("Pretendard-Regular.ttf", 23)
F_BODY = font("Pretendard-Regular.ttf", 26)
F_BODY_BOLD = font("Pretendard-SemiBold.ttf", 26)
F_STARS = font("Pretendard-Bold.ttf", 31)


REVIEWS = [
    {
        "slug": "01_문제행동중재",
        "body": """주력 강의 주제: 문제행동중재

지금 방향이 맞는지 고민이었는데, 핵심 니즈를 적용한 학습자 동기부여를 만드는 WHY 질문법과 IF를 통한 성찰 및 변화행동 질문 작성이 가장 도움이 되었습니다. 수강자들이 집에 돌아가 쉽게 실행할 수 있도록 도울 수 있을 것 같습니다. 특히 오프닝 부분의 상호작용과 실제 실행 부분을 바로 적용해보고 싶습니다. 내 강의를 좀 더 발전시키고 싶은 강사분들, 강의를 오래 해왔지만 지금 내 강의의 방향이 맞는지 막막하신 분들께 이 과정을 권하고 싶습니다.""",
    },
    {
        "slug": "02_세종대왕실록_실전리더십",
        "body": """주력 강의 주제: 세종대왕실록(실록 기반) 실전 리더십

오프닝과 클로징을 할 때 수강생들의 참여율을 높이고 싶었습니다. WHO 정리를 통한 니즈 확인부터 질문법, 키워드 도출, 학습 촉진 기법, 전달 기술 및 미니 시연까지 전 과정이 큰 도움이 되었습니다. 단순히 '시간 됐으니까 해야지'가 아니라, 해야 하는 이유와 수업 주제를 연결하며 청중에게 쉽게 다가가는 법을 배웠습니다. 앞으로 청중들과 더 의미 있는 호흡이 가능해질 것 같고, 강의안 제작 시 기준점이 명확해져서 순서대로 바꿔보려 합니다. 강의 경력이 3~5년 정도 되시는 분들 중 자신의 단점을 파악하고 메타인지를 높이고 싶은 분들께 추천합니다. 만족도 높은 강의에 안주하던 제가 부끄러워졌을 때 이 과정을 만났습니다.""",
    },
    {
        "slug": "03_실전형_멘탈케어",
        "body": """주력 강의 주제: 실전형 멘탈케어 (오피스 명상요가 + 독서명상)

참여자들의 에너지를 끌어올리는 멘트나 강의 구성, 특히 명상이라는 무거운 주제의 심리적 허들을 낮추기 위한 실전 장치가 고민이었습니다. 이번 교육을 통해 '본질'을 명확하게 잡을 수 있어서 마음이 훨씬 편안해졌습니다. 학습자를 위해 단계별로 구조화된 질문들로 Why를 자극하는 설계가 기대됩니다. 특히 오프닝에서 학습자들이 겪는 문제점을 해결할 수 있다는 신뢰를 전하며 시작하는 Why 설계를 바로 적용해보고 싶습니다. 오프닝이나 참여형 강의가 어려운 강사, 새로운 성장을 원하는 기업 교육 강사분들께 추천합니다. 교육 후 바로 실천할 수 있는 실전 스킬을 배울 수 있는 시간입니다.""",
    },
    {
        "slug": "04_언어능력과_언어자극",
        "body": """주력 강의 주제: 언어능력과 언어자극

청중의 참여와 실행력을 북돋는 방법, 이론과 실제의 병행 방법에 대해 고민이 많았습니다. 강의 경력이 쌓이면서 콘텐츠보다 전달력과 구성에 대한 고민이 커졌는데, 이번에 청중의 동기와 변화를 끌어내는 구체적인 방법을 알게 되었습니다. 특히 오프닝에서 시그니처 스토리와 연계하여 강의를 열고, 최종 실행력을 위해 방향과 요약을 준비하는 점이 크게 달라질 것 같습니다. 취약했던 참여형 수업 모듈 구성도 촘촘히 계획할 수 있게 되었습니다. 3년 차 이상의 열정 있는 강사분들께 추천하며, 강사 맞춤형으로 이루어지는 최고의 강의 코칭이라 생각합니다.""",
    },
    {
        "slug": "05_스피치",
        "body": """주력 강의 주제: 스피치

강의 대상 구체화와 강사로서의 커리어 성장에 대한 고민이 있었습니다. WHO를 구체화하는 것의 중요성을 깨달았고, 미니 시연을 통해 전문가의 피드백을 직접 받을 수 있어 귀한 경험이었습니다. 전달 동선, 앵커링 등 비언어적 요소의 중요성도 강력하게 느꼈습니다. 이제 강의 설계의 기쁨을 느끼며 타겟을 더 뾰족하게 설정해보고 싶습니다. 강의를 더 잘하고 싶어 고민하는 강사들에게 추천합니다. 전종목 강사님은 온몸을 던져 변화를 이끌어내는 진짜 교육을 하시는 분입니다.""",
    },
    {
        "slug": "06_다시_실행하는_태도",
        "body": """주력 강의 주제: 다시 실행하는 태도

강의 구성 방법과 청중의 참여 유도 방법이 고민이었습니다. 강의 목적(WHY)에 맞게 요소를 적절히 배치하는 법을 배웠고, 단순히 내가 잘하는 영역을 넘어 청중을 위해 준비해야 할 강사의 역할에 대해 깊이 고민하게 되었습니다. 강사의 역할에 맞는 요소를 내 강의에 삽입하는 것을 바로 실천해보려 합니다. 강의 구조가 정리되지 않는 강사분들에게 추천하며, 강사로서 준비하는 강의가 어떠해야 하는지 제대로 배울 수 있는 과정입니다.""",
    },
]


def text_w(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def wrap_line(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    if not text:
        return [""]
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


def wrap_body(draw: ImageDraw.ImageDraw, body: str, max_w: int) -> list[tuple[str, ImageFont.FreeTypeFont, bool]]:
    wrapped: list[tuple[str, ImageFont.FreeTypeFont, bool]] = []
    paragraphs = body.split("\n")
    for p_idx, paragraph in enumerate(paragraphs):
        if paragraph == "":
            wrapped.append(("", F_BODY, True))
            continue
        fnt = F_BODY_BOLD if paragraph.startswith("주력 강의 주제:") else F_BODY
        for line in wrap_line(draw, paragraph, fnt, max_w):
            wrapped.append((line, fnt, False))
        if p_idx != len(paragraphs) - 1:
            wrapped.append(("", F_BODY, True))
    return wrapped


def line_height(fnt: ImageFont.FreeTypeFont) -> int:
    ascent, descent = fnt.getmetrics()
    return ascent + descent


def draw_card(review: dict[str, str]) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    temp = Image.new("RGB", (W, 800), "white")
    draw = ImageDraw.Draw(temp)
    max_w = W - PAD_X * 2
    body_lines = wrap_body(draw, review["body"], max_w)

    header_h = 84
    body_h = 0
    for _, fnt, is_gap in body_lines:
        body_h += PARA_GAP if is_gap else line_height(fnt) + LINE_GAP
    h = PAD_TOP + header_h + body_h + PAD_BOTTOM

    image = Image.new("RGB", (W, h), "white")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, W - 1, h - 1), outline="#111111", width=2)

    y = PAD_TOP
    draw.text((PAD_X, y), "주력강의 재설계 과정", font=F_TITLE, fill="#202020")
    y += 34

    draw.text((PAD_X, y), "★★★★★", font=F_STARS, fill="#FF3B30")
    star_w = text_w(draw, "★★★★★", F_STARS)
    draw.text((PAD_X + star_w + 16, y + 3), "수강생 후기", font=F_META, fill="#303030")
    y += 50

    for line, fnt, is_gap in body_lines:
        if is_gap:
            y += PARA_GAP
            continue
        draw.text((PAD_X, y), line, font=fnt, fill="#222222")
        y += line_height(fnt) + LINE_GAP

    out = OUT_DIR / f"{review['slug']}.png"
    image.save(out, quality=96)
    return out


def build_contact_sheet(paths: list[Path]) -> Path:
    thumbs = []
    thumb_w = 780
    for path in paths:
        img = Image.open(path).convert("RGB")
        thumb_h = int(img.height * thumb_w / img.width)
        thumbs.append(img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS))

    gap = 24
    rows = []
    for i in range(0, len(thumbs), 2):
        left = thumbs[i]
        right = thumbs[i + 1] if i + 1 < len(thumbs) else Image.new("RGB", left.size, "white")
        row_h = max(left.height, right.height)
        row = Image.new("RGB", (thumb_w * 2 + gap, row_h), "white")
        row.paste(left, (0, 0))
        row.paste(right, (thumb_w + gap, 0))
        rows.append(row)

    sheet_h = sum(row.height for row in rows) + gap * (len(rows) - 1)
    sheet = Image.new("RGB", (thumb_w * 2 + gap, sheet_h), "white")
    y = 0
    for row in rows:
        sheet.paste(row, (0, y))
        y += row.height + gap
    out = OUT_DIR / "후기카드_6종_미리보기.png"
    sheet.save(out, quality=96)
    return out


def main() -> None:
    paths = [draw_card(review) for review in REVIEWS]
    sheet = build_contact_sheet(paths)
    for path in paths:
        print(path)
    print(sheet)


if __name__ == "__main__":
    main()
