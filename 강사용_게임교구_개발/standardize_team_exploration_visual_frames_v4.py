from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BASE = Path(__file__).resolve().parent
SRC = BASE / "팀탐험_카드이미지" / "AI생성_단품카드_프레임외곽맞춤_v3"
OUT = BASE / "팀탐험_카드이미지" / "AI생성_단품카드_시각프레임통일_v4"
SLIDE_ASSETS = BASE / "slide_assets_team_exploration_v1"

TARGET_SIZE = (1050, 1500)
SOURCE_CROP = (35, 35, 1015, 1465)
INNER_BOX = (43, 43, 1007, 1457)
OUTER_FRAME = (12, 12, 1038, 1488)
INNER_LINE = (45, 45, 1005, 1455)

FILES = [
    ("AI_00_공통_뒷면_v1.png", "card_back.png"),
    ("AI_01_깃발_6점_v1.png", "card_flag.png"),
    ("AI_02_나침반_5점_v1.png", "card_compass.png"),
    ("AI_03_지도_4점_v1.png", "card_map.png"),
    ("AI_04_랜턴_3점_v1.png", "card_lantern.png"),
    ("AI_05_로프_2점_v1.png", "card_rope.png"),
    ("AI_06_식량_1점_v1.png", "card_food.png"),
]


def font(size: int):
    for font_path in [Path("C:/Windows/Fonts/malgunbd.ttf"), Path("C:/Windows/Fonts/malgun.ttf")]:
        if font_path.exists():
            return ImageFont.truetype(str(font_path), size)
    return ImageFont.load_default()


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def draw_common_frame(im: Image.Image) -> Image.Image:
    draw = ImageDraw.Draw(im)
    draw.rounded_rectangle(OUTER_FRAME, radius=64, outline="#182E32", width=14)
    draw.rounded_rectangle((24, 24, 1026, 1476), radius=56, outline="#B8954E", width=4)
    draw.rounded_rectangle(INNER_LINE, radius=44, outline="#263F34", width=3)
    return im


def standardize(src_path: Path, out_path: Path) -> Image.Image:
    source = Image.open(src_path).convert("RGB")
    crop = source.crop(SOURCE_CROP)
    inner_w = INNER_BOX[2] - INNER_BOX[0]
    inner_h = INNER_BOX[3] - INNER_BOX[1]
    resized = crop.resize((inner_w, inner_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGB", TARGET_SIZE, "#F4EBD5")
    mask = rounded_mask((inner_w, inner_h), 40)
    canvas.paste(resized, (INNER_BOX[0], INNER_BOX[1]), mask)
    canvas = draw_common_frame(canvas)
    canvas.save(out_path)
    return canvas


def contain(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    canvas = Image.new("RGBA", size, (255, 255, 255, 0))
    ratio = min(size[0] / im.width, size[1] / im.height)
    new_size = (int(im.width * ratio), int(im.height * ratio))
    resized = im.resize(new_size, Image.Resampling.LANCZOS).convert("RGBA")
    pos = ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2)
    canvas.alpha_composite(resized, pos)
    return canvas


def make_montage(images: list[tuple[str, Image.Image]]) -> None:
    thumb_size = (210, 300)
    cols = 4
    gap_x = 44
    gap_y = 72
    label_h = 42
    margin = 42
    rows = (len(images) + cols - 1) // cols
    width = margin * 2 + cols * thumb_size[0] + (cols - 1) * gap_x
    height = margin * 2 + rows * (thumb_size[1] + label_h) + (rows - 1) * gap_y
    canvas = Image.new("RGB", (width, height), "#f5f1e8")
    draw = ImageDraw.Draw(canvas)
    label_font = font(20)

    for idx, (name, im) in enumerate(images):
        x = margin + (idx % cols) * (thumb_size[0] + gap_x)
        y = margin + (idx // cols) * (thumb_size[1] + label_h + gap_y)
        thumb = contain(im, thumb_size)
        canvas.paste(thumb.convert("RGB"), (x, y), thumb)
        draw.rectangle([x, y, x + thumb_size[0] - 1, y + thumb_size[1] - 1], outline="#18313a", width=2)
        draw.text((x, y + thumb_size[1] + 10), name.replace(".png", ""), fill="#18313a", font=label_font)

    canvas.save(OUT / "AI_팀탐험_시각프레임통일_단품카드_모음_v4.png")
    canvas.save(SLIDE_ASSETS / "cards_montage.png")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    SLIDE_ASSETS.mkdir(parents=True, exist_ok=True)
    standardized = []
    for source_name, slide_name in FILES:
        image = standardize(SRC / source_name, OUT / source_name)
        image.save(SLIDE_ASSETS / slide_name)
        standardized.append((source_name, image))
    make_montage(standardized)
    print(f"target_size={TARGET_SIZE[0]}x{TARGET_SIZE[1]}")
    print(f"source_crop={SOURCE_CROP}")
    print(f"outer_frame={OUTER_FRAME}")
    print(f"inner_line={INNER_LINE}")
    print(OUT)


if __name__ == "__main__":
    main()
