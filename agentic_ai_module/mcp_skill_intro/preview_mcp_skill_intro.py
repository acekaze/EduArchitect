from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


OUT = Path(__file__).resolve().parent / "mcp_skill_소개_1페이지_preview.png"
FONT_REG = Path("C:/Users/aceka/Downloads/Pretendard-1.3.9/public/static/alternative/Pretendard-Regular.ttf")
FONT_BLACK = Path("C:/Users/aceka/Downloads/Pretendard-1.3.9/public/static/alternative/Pretendard-Black.ttf")


def font(path, size):
    return ImageFont.truetype(str(path), size)


img = Image.new("RGB", (1600, 900), "#FFFFFF")
d = ImageDraw.Draw(img)
black = font(FONT_BLACK, 46)
title_font = font(FONT_BLACK, 32)
body = font(FONT_REG, 24)
small = font(FONT_REG, 20)
tag = font(FONT_BLACK, 18)

d.text((90, 82), "MCP와 스킬은 오늘 실습이 아니라 다음 확장 단계다", font=black, fill="#111827")
d.text((92, 150), "일반 직장인 과정에서는 개념만 소개하고, 실제 설정과 제작은 심화 과정으로 분리한다.", font=small, fill="#64748B")

d.rectangle((95, 246, 365, 500), fill="#111827")
d.text((184, 287), "오늘", font=title_font, fill="#FFFFFF")
d.multiline_text((155, 350), "설치\nFast 사용\n첫 요청문", font=title_font, fill="#FFFFFF", spacing=8, align="center")

d.line((380, 375, 510, 375), fill="#D7DEE8", width=7)
d.polygon([(510, 375), (490, 360), (490, 390)], fill="#D7DEE8")
d.rounded_rectangle((520, 286, 815, 460), radius=20, fill="#E8F6F7", outline="#1B7C86", width=4)
d.text((595, 340), "Agentic AI", font=title_font, fill="#111827")
d.text((604, 388), "일을 맡기는 환경", font=small, fill="#64748B")

d.line((825, 342, 940, 272), fill="#D7DEE8", width=5)
d.polygon([(940, 272), (912, 269), (925, 292)], fill="#D7DEE8")
d.line((825, 415, 940, 484), fill="#D7DEE8", width=5)
d.polygon([(940, 484), (912, 487), (925, 463)], fill="#D7DEE8")

def rail(x, y, w, h, fill, line, label, title, desc):
    d.rectangle((x, y, x + w, y + h), fill=fill)
    d.line((x, y, x + w, y), fill=line, width=8)
    d.text((x + 28, y + 28), label, font=tag, fill=line)
    d.text((x + 28, y + 68), title, font=title_font, fill="#111827")
    d.multiline_text((x + 28, y + 122), desc, font=small, fill="#1F2937", spacing=5)

rail(950, 215, 550, 220, "#EAF2FF", "#0F3A66", "MCP", "외부 도구와 연결하는 통로", "파일, 브라우저, 일정, 메일, 사내 시스템처럼\nAI가 접근할 수 있는 도구를 정한다.")
rail(950, 488, 550, 220, "#FFF4E6", "#D9730D", "SKILL", "반복 업무 방식을 저장하는 단위", "자주 쓰는 절차, 문체, 검토 순서,\n산출물 형식을 재사용 가능하게 정리한다.")

d.line((95, 718, 1500, 718), fill="#D7DEE8", width=3)
d.text((98, 754), "이번 과정의 처리", font=tag, fill="#2F7D4A")
d.text((255, 748), "MCP와 스킬은 5분 소개만 한다. 실제 연결, 권한 설계, 스킬 제작은 다음 과정에서 다룬다.", font=body, fill="#111827")
d.text((255, 795), "강의 멘트: 오늘은 AI에게 일을 맡기는 기본 환경을 만든다. 외부 연결과 반복 업무 자동화는 심화 과정에서 실습한다.", font=small, fill="#64748B")

img.save(OUT)
print(OUT)
