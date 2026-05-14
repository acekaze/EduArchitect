from pathlib import Path
from PIL import Image


BASE = Path(__file__).resolve().parent
SRC = BASE / "slide_assets_team_exploration_v1"
OUT = BASE / "slide_assets_scorecard_order_v1"
OUT.mkdir(exist_ok=True)


def contain(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    im = im.convert("RGBA")
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    ratio = min(size[0] / im.width, size[1] / im.height)
    new_size = (int(im.width * ratio), int(im.height * ratio))
    resized = im.resize(new_size, Image.Resampling.LANCZOS)
    pos = ((size[0] - new_size[0]) // 2, (size[1] - new_size[1]) // 2)
    canvas.alpha_composite(resized, pos)
    return canvas


def make_back_grid() -> None:
    card = Image.open(SRC / "card_back.png").convert("RGBA")
    thumb = contain(card, (92, 126))
    cols, rows = 10, 4
    gap_x, gap_y = 14, 14
    w = cols * thumb.width + (cols - 1) * gap_x
    h = rows * thumb.height + (rows - 1) * gap_y
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for r in range(rows):
        for c in range(cols):
            canvas.alpha_composite(thumb, (c * (thumb.width + gap_x), r * (thumb.height + gap_y)))
    canvas.save(OUT / "back_grid_10x4.png")


def make_card_row(name: str, files: list[str]) -> None:
    thumbs = [contain(Image.open(SRC / f).convert("RGBA"), (190, 255)) for f in files]
    gap = 18
    w = len(thumbs) * 190 + (len(thumbs) - 1) * gap
    h = 255
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for idx, thumb in enumerate(thumbs):
        canvas.alpha_composite(thumb, (idx * (190 + gap), 0))
    canvas.save(OUT / name)


def make_cover_headline() -> None:
    from PIL import ImageDraw, ImageFont

    canvas = Image.new("RGBA", (880, 330), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    font_paths = [
        Path("C:/Windows/Fonts/malgunbd.ttf"),
        Path("C:/Windows/Fonts/malgun.ttf"),
    ]
    font = None
    for font_path in font_paths:
        if font_path.exists():
            font = ImageFont.truetype(str(font_path), 72)
            break
    if font is None:
        font = ImageFont.load_default()

    y = 0
    for line in ["활동도 하고!", "카드도 모으고!", "마지막에 공개하고!"]:
        draw.text((0, y), line, font=font, fill=(255, 255, 255, 255))
        y += 104
    canvas.save(OUT / "cover_headline.png")


if __name__ == "__main__":
    make_cover_headline()
    make_back_grid()
    make_card_row(
        "card_row_all_1to6.png",
        ["card_food.png", "card_rope.png", "card_lantern.png", "card_map.png", "card_compass.png", "card_flag.png"],
    )
    make_card_row(
        "draw_win_1_2_3_4.png",
        ["card_food.png", "card_rope.png", "card_lantern.png", "card_map.png"],
    )
    make_card_row(
        "draw_lose_5_6.png",
        ["card_compass.png", "card_flag.png"],
    )
    print(OUT)
