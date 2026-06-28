from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

import build_long_review_capture_card as long_card
import build_testimonial_review_cards as cards


OUT_DIR = cards.OUT_DIR
HIGHLIGHT = "#FFF0A6"


SHORT_HIGHLIGHTS: dict[str, list[str]] = {
    "01_문제행동중재": [
        "핵심 니즈를 적용한 학습자 동기부여를 만드는 WHY 질문법과 IF를 통한 성찰 및 변화행동 질문 작성이 가장 도움이",
        "특히 오프닝 부분의 상호작용과 실제 실행 부분을 바로 적용해보고",
        "내 강의를 좀 더 발전시키고 싶은 강사분들, 강의를 오래 해왔지만",
    ],
    "02_세종대왕실록_실전리더십": [
        "WHO 정리를 통한 니즈 확인부터 질문법, 키워드 도출, 학습 촉진 기법, 전달 기술 및 미니",
        "시연까지 전 과정이 큰 도움이 되었습니다.",
        "자신의 단점을 파악하고 메타인지를 높이고 싶은 분들께 추천합니다.",
    ],
    "03_실전형_멘탈케어": [
        "통해 '본질'을 명확하게 잡을 수 있어서 마음이 훨씬 편안해졌습니다.",
        "시작하는 Why 설계를 바로 적용해보고 싶습니다.",
        "교육 후 바로 실천할 수 있는 실전 스킬을 배울 수 있는 시간입니다.",
    ],
    "04_언어능력과_언어자극": [
        "이번에 청중의 동기와 변화를 끌어내는 구체적인 방법을 알게 되었습니다.",
        "취약했던 참여형 수업 모듈 구성도 촘촘히 계획할 수 있게 되었습니다.",
        "강사 맞춤형으로 이루어지는 최고의 강의 코칭이라 생각합니다.",
    ],
    "05_스피치": [
        "WHO를 구체화하는 것의 중요성을 깨달았고, 미니 시연을 통해 전문가의 피드백을",
        "직접 받을 수 있어 귀한 경험이었습니다.",
        "전종목 강사님은 온몸을 던져 변화를 이끌어내는 진짜 교육을 하시는",
    ],
    "06_다시_실행하는_태도": [
        "강의 목적(WHY)에 맞게 요소를 적절히 배치하는 법을 배웠고",
        "청중을 위해 준비해야 할 강사의 역할에 대해 깊이 고민하게 되었습니다.",
        "강사로서 준비하는 강의가 어떠해야 하는지 제대로 배울 수 있는 과정입니다.",
    ],
}


LONG_HIGHLIGHTS = [
    "단순히 지식 전달을 넘어 수강생의 삶을",
    "바꾸는 진짜 교육에 대한 갈증이 너무 심했어요.",
    "제 강의를 객관적으로 평가하고 이끌어줄 선배이자",
    "컨설턴트가 제게는 너무나 절실했기 때문..",
    "이틀 동안 제 강의의 뼈대를",
    "완전히 뒤엎었어요.",
    "왜 국내 탑 기업들이 그를 먼저 찾는지",
    "이번 수업은 제 강사",
    "제 강사 인생의 제2막을 여는 소중한 열쇠였어요.",
    "인생의 제2막을 여는 소중한 열쇠였어요.",
    "수강생의 삶을 업그레이드하고 실질적인 결과를 만들어내는 강사로,",
    "코치님의 압도적인 통찰력을 절대 놓치지 않았으면 해요.",
]


def draw_segment_highlights(
    draw: ImageDraw.ImageDraw,
    line: str,
    x: int,
    y: int,
    fnt,
    snippets: list[str],
    *,
    measure,
    line_h: int,
) -> None:
    for snippet in snippets:
        start = line.find(snippet)
        if start < 0:
            continue
        end = start + len(snippet)
        left = x + measure(draw, line[:start], fnt)
        right = x + measure(draw, line[:end], fnt)
        draw.rectangle((left - 5, y + 2, right + 5, y + line_h + 3), fill=HIGHLIGHT)


def draw_short_card(review: dict[str, str]) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    temp = Image.new("RGB", (cards.W, 800), "white")
    draw = ImageDraw.Draw(temp)
    max_w = cards.W - cards.PAD_X * 2
    body_lines = cards.wrap_body(draw, review["body"], max_w)

    header_h = 84
    body_h = 0
    for _, fnt, is_gap in body_lines:
        body_h += cards.PARA_GAP if is_gap else cards.line_height(fnt) + cards.LINE_GAP
    h = cards.PAD_TOP + header_h + body_h + cards.PAD_BOTTOM

    image = Image.new("RGB", (cards.W, h), "white")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, cards.W - 1, h - 1), outline="#111111", width=2)

    y = cards.PAD_TOP
    draw.text((cards.PAD_X, y), "주력강의 재설계 과정", font=cards.F_TITLE, fill="#202020")
    y += 34

    draw.text((cards.PAD_X, y), "★★★★★", font=cards.F_STARS, fill="#FF3B30")
    star_w = cards.text_w(draw, "★★★★★", cards.F_STARS)
    draw.text((cards.PAD_X + star_w + 16, y + 3), "수강생 후기", font=cards.F_META, fill="#303030")
    y += 50

    snippets = SHORT_HIGHLIGHTS[review["slug"]]
    for line, fnt, is_gap in body_lines:
        if is_gap:
            y += cards.PARA_GAP
            continue
        line_h = cards.line_height(fnt)
        draw_segment_highlights(
            draw,
            line,
            cards.PAD_X,
            y,
            fnt,
            snippets,
            measure=lambda d, text, font: cards.text_w(d, text, font),
            line_h=line_h,
        )
        draw.text((cards.PAD_X, y), line, font=fnt, fill="#222222")
        y += line_h + cards.LINE_GAP

    out = OUT_DIR / f"{review['slug']}_하이라이트.png"
    image.save(out, quality=96)
    return out


def draw_long_card() -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    temp = Image.new("RGB", (long_card.W, 1000), "white")
    draw = ImageDraw.Draw(temp)
    lines = long_card.wrapped_body(draw)

    header_h = 94
    body_h = 0
    for _, is_gap in lines:
        body_h += long_card.PARA_GAP if is_gap else long_card.line_height(long_card.F_BODY) + long_card.BODY_LINE_GAP
    h = long_card.PAD_TOP + header_h + body_h + long_card.PAD_BOTTOM

    img = Image.new("RGB", (long_card.W, h), "white")
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, long_card.W - 1, h - 1), outline="#111111", width=2)

    y = long_card.PAD_TOP
    draw.text((long_card.PAD_X, y), "★★★★★", font=long_card.F_STARS, fill="#FF3B30")
    star_w = long_card.measure_text(draw, "★★★★★", long_card.F_STARS)
    draw.text((long_card.PAD_X + star_w + 18, y + 1), "10년차 강사 후기", font=long_card.F_META, fill="#333333")
    y += 43
    draw.text((long_card.PAD_X, y), "주력강의 재설계 과정", font=long_card.F_META_SMALL, fill="#777777")
    y += 56

    line_h = long_card.line_height(long_card.F_BODY)
    for line, is_gap in lines:
        if is_gap:
            y += long_card.PARA_GAP
            continue
        draw_segment_highlights(
            draw,
            line,
            long_card.PAD_X,
            y,
            long_card.F_BODY,
            LONG_HIGHLIGHTS,
            measure=lambda d, text, font: long_card.measure_mixed(d, text, font),
            line_h=line_h,
        )
        long_card.draw_mixed_text(draw, (long_card.PAD_X, y), line, long_card.F_BODY, "#222222")
        y += line_h + long_card.BODY_LINE_GAP

    out = OUT_DIR / "긴후기_10년차강사_캡처스타일_하이라이트.png"
    img.save(out, quality=96)
    return out


def split_long(path: Path) -> list[Path]:
    img = Image.open(path).convert("RGB")
    w, h = img.size
    split_y = 1243
    outputs = [
        OUT_DIR / "긴후기_10년차강사_캡처스타일_하이라이트_1.png",
        OUT_DIR / "긴후기_10년차강사_캡처스타일_하이라이트_2.png",
    ]
    boxes = [(0, 0, w, split_y), (0, split_y, w, h)]
    for out, box in zip(outputs, boxes):
        crop = img.crop(box)
        draw = ImageDraw.Draw(crop)
        draw.rectangle((0, 0, crop.size[0] - 1, crop.size[1] - 1), outline="#111111", width=2)
        crop.save(out, quality=96)
    return outputs


def build_contact_sheet(paths: list[Path]) -> Path:
    thumbs = []
    thumb_w = 780
    for path in paths:
        img = Image.open(path).convert("RGB")
        thumb_h = int(img.height * thumb_w / img.width)
        thumbs.append(img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS))

    gap = 24
    rows = []
    for idx in range(0, len(thumbs), 2):
        left = thumbs[idx]
        right = thumbs[idx + 1] if idx + 1 < len(thumbs) else Image.new("RGB", left.size, "white")
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
    out = OUT_DIR / "후기카드_6종_미리보기_하이라이트.png"
    sheet.save(out, quality=96)
    return out


def main() -> None:
    short_paths = [draw_short_card(review) for review in cards.REVIEWS]
    sheet = build_contact_sheet(short_paths)
    long_path = draw_long_card()
    long_parts = split_long(long_path)
    for path in [*short_paths, sheet, long_path, *long_parts]:
        print(path)


if __name__ == "__main__":
    main()
