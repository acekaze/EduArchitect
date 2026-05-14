from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BASE = Path(__file__).resolve().parent
SRC = BASE / "팀탐험_카드이미지" / "AI생성_단품카드_v1"
OUT = BASE / "팀탐험_카드이미지" / "AI생성_단품카드_프레임외곽맞춤_v3"
SLIDE_ASSETS = BASE / "slide_assets_team_exploration_v1"
TARGET_SIZE = (1050, 1500)
TARGET_RATIO = TARGET_SIZE[0] / TARGET_SIZE[1]

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


def exterior_content_bbox(im: Image.Image) -> tuple[int, int, int, int]:
    """Find the visible card frame and artwork, excluding near-white exterior margins."""
    import numpy as np

    arr = np.array(im.convert("RGBA"))
    rgb = arr[..., :3]
    alpha = arr[..., 3]
    mask = (alpha > 10) & np.any(rgb < 245, axis=2)
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return (0, 0, im.width, im.height)
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def expand_bbox_to_ratio(
    bbox: tuple[int, int, int, int],
    image_size: tuple[int, int],
    ratio: float,
) -> tuple[int, int, int, int]:
    left, top, right, bottom = bbox
    image_w, image_h = image_size
    width = right - left
    height = bottom - top
    current_ratio = width / height

    if current_ratio > ratio:
        target_h = round(width / ratio)
        extra = max(0, target_h - height)
        top -= extra // 2
        bottom += extra - extra // 2
    else:
        target_w = round(height * ratio)
        extra = max(0, target_w - width)
        left -= extra // 2
        right += extra - extra // 2

    if left < 0:
        right -= left
        left = 0
    if top < 0:
        bottom -= top
        top = 0
    if right > image_w:
        left -= right - image_w
        right = image_w
    if bottom > image_h:
        top -= bottom - image_h
        bottom = image_h

    left = max(0, left)
    top = max(0, top)
    right = min(image_w, right)
    bottom = min(image_h, bottom)
    return (left, top, right, bottom)


def normalize_card(src_path: Path, out_path: Path) -> Image.Image:
    im = Image.open(src_path).convert("RGBA")
    bbox = exterior_content_bbox(im)
    cropped = im.crop(bbox)
    normalized = cropped.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    normalized.save(out_path)
    return normalized


def contain(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    canvas = Image.new("RGBA", size, (255, 255, 255, 0))
    ratio = min(size[0] / im.width, size[1] / im.height)
    new_size = (int(im.width * ratio), int(im.height * ratio))
    resized = im.resize(new_size, Image.Resampling.LANCZOS)
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

    canvas.save(OUT / "AI_팀탐험_프레임외곽맞춤_단품카드_모음_v3.png")
    canvas.save(SLIDE_ASSETS / "cards_montage.png")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    SLIDE_ASSETS.mkdir(parents=True, exist_ok=True)
    normalized_images = []

    for source_name, slide_name in FILES:
        source_path = SRC / source_name
        out_path = OUT / source_name
        slide_path = SLIDE_ASSETS / slide_name
        normalized = normalize_card(source_path, out_path)
        normalized.save(slide_path)
        normalized_images.append((source_name, normalized))

    make_montage(normalized_images)
    print(f"target_size={TARGET_SIZE[0]}x{TARGET_SIZE[1]}")
    print(OUT)


if __name__ == "__main__":
    main()
