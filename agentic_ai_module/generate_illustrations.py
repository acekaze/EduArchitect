from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent / "assets"
OUT.mkdir(parents=True, exist_ok=True)

S = 3
W, H = 1200, 800

COL = {
    "ink": "#111827",
    "muted": "#64748B",
    "line": "#CAD6E2",
    "paper": "#F8FAFC",
    "blue": "#0F3A66",
    "cyan": "#1B7C86",
    "green": "#2F7D4A",
    "orange": "#D9730D",
    "red": "#B42318",
    "soft_blue": "#EAF2FF",
    "soft_green": "#EAF7EF",
    "soft_orange": "#FFF4E6",
    "soft_red": "#FDECEC",
    "soft_cyan": "#E8F6F7",
    "white": "#FFFFFF",
}


def sc(v):
    return int(round(v * S))


def canvas():
    return Image.new("RGBA", (W * S, H * S), (255, 255, 255, 0))


def rounded(draw, box, r, fill, outline=None, width=1):
    b = tuple(sc(v) for v in box)
    draw.rounded_rectangle(b, radius=sc(r), fill=fill, outline=outline, width=sc(width))


def ellipse(draw, box, fill, outline=None, width=1):
    b = tuple(sc(v) for v in box)
    draw.ellipse(b, fill=fill, outline=outline, width=sc(width))


def line(draw, points, fill, width=3):
    draw.line([(sc(x), sc(y)) for x, y in points], fill=fill, width=sc(width), joint="curve")


def poly(draw, points, fill, outline=None):
    draw.polygon([(sc(x), sc(y)) for x, y in points], fill=fill, outline=outline)


def shadow_layer(img, box, r=28, alpha=32):
    if not hasattr(img, "alpha_composite"):
        return
    layer = Image.new("RGBA", img.size, (255, 255, 255, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle(tuple(sc(v) for v in box), radius=sc(r), fill=(17, 24, 39, alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(sc(14)))
    img.alpha_composite(layer)


def save(img, name):
    img = img.resize((W, H), Image.Resampling.LANCZOS)
    img.save(OUT / name)


def draw_laptop(d, x, y, w, h, accent=COL["blue"]):
    shadow_layer(d.im, (x, y, x + w, y + h), 18, 20)
    rounded(d, (x, y, x + w, y + h), 18, COL["white"], COL["line"], 2)
    rounded(d, (x + 28, y + 24, x + w - 28, y + h - 70), 10, "#F3F7FB", "#E0E8F0", 1)
    rounded(d, (x + 55, y + 52, x + 230, y + 74), 5, accent)
    rounded(d, (x + 55, y + 100, x + w - 70, y + 114), 5, "#DCE6F0")
    rounded(d, (x + 55, y + 140, x + w - 120, y + 154), 5, "#DCE6F0")
    rounded(d, (x + 55, y + 180, x + w - 190, y + 194), 5, "#DCE6F0")
    rounded(d, (x + 80, y + h - 48, x + w - 80, y + h - 22), 11, "#E6EDF4")


def draw_robot(d, x, y, scale=1.0, accent=COL["cyan"]):
    r = 44 * scale
    ellipse(d, (x - r, y - r, x + r, y + r), COL["white"], accent, 5)
    ellipse(d, (x - 21 * scale, y - 10 * scale, x - 7 * scale, y + 4 * scale), accent)
    ellipse(d, (x + 7 * scale, y - 10 * scale, x + 21 * scale, y + 4 * scale), accent)
    line(d, [(x - 20 * scale, y + 22 * scale), (x + 20 * scale, y + 22 * scale)], accent, 5)
    line(d, [(x, y - r - 16 * scale), (x, y - r - 42 * scale)], accent, 4)
    ellipse(d, (x - 8 * scale, y - r - 56 * scale, x + 8 * scale, y - r - 40 * scale), accent)


def draw_person(d, x, y, scale=1.0, color=COL["blue"]):
    ellipse(d, (x - 28 * scale, y - 95 * scale, x + 28 * scale, y - 39 * scale), "#FFD6B8")
    rounded(d, (x - 46 * scale, y - 38 * scale, x + 46 * scale, y + 62 * scale), 18, color)
    line(d, [(x - 48 * scale, y - 12 * scale), (x - 95 * scale, y + 34 * scale)], color, 11)
    line(d, [(x + 48 * scale, y - 12 * scale), (x + 95 * scale, y + 32 * scale)], color, 11)


def card(d, x, y, w, h, fill, accent):
    shadow_layer(d.im, (x, y, x + w, y + h), 18, 16)
    rounded(d, (x, y, x + w, y + h), 18, fill, "#D9E2EC", 2)
    rounded(d, (x + 28, y + 26, x + 150, y + 43), 6, accent)
    rounded(d, (x + 28, y + 78, x + w - 38, y + 92), 6, "#CBD8E5")
    rounded(d, (x + 28, y + 115, x + w - 88, y + 129), 6, "#CBD8E5")


def cover():
    img = canvas()
    d = ImageDraw.Draw(img)
    draw_laptop(d, 350, 325, 480, 260, COL["blue"])
    draw_robot(d, 690, 245, 1.35, COL["cyan"])
    draw_person(d, 345, 545, 1.1, COL["blue"])
    for x, y, c in [(250, 210, COL["soft_blue"]), (885, 210, COL["soft_green"]), (940, 505, COL["soft_orange"]), (180, 480, COL["soft_cyan"])]:
        rounded(d, (x, y, x + 150, y + 96), 22, c, COL["line"], 2)
    line(d, [(330, 258), (610, 250), (885, 258)], COL["line"], 5)
    line(d, [(790, 310), (940, 505)], COL["line"], 5)
    save(img, "cover_agentic.png")


def ai_tools():
    img = canvas()
    d = ImageDraw.Draw(img)
    draw_laptop(d, 360, 330, 480, 255, COL["cyan"])
    draw_robot(d, 600, 245, 1.25, COL["cyan"])
    items = [
        (225, 230, COL["soft_blue"], COL["blue"]),
        (835, 215, COL["soft_orange"], COL["orange"]),
        (230, 540, COL["soft_green"], COL["green"]),
        (875, 530, COL["soft_red"], COL["red"]),
    ]
    for x, y, fill, accent in items:
        rounded(d, (x, y, x + 150, y + 125), 24, fill, accent, 3)
        line(d, [(x + 42, y + 62), (x + 108, y + 62)], accent, 7)
        line(d, [(x + 75, y + 32), (x + 75, y + 94)], accent, 7)
    line(d, [(360, 405), (300, 290)], COL["line"], 5)
    line(d, [(840, 405), (910, 277)], COL["line"], 5)
    line(d, [(370, 520), (305, 590)], COL["line"], 5)
    line(d, [(830, 520), (950, 585)], COL["line"], 5)
    save(img, "ai_tools.png")


def approval():
    img = canvas()
    d = ImageDraw.Draw(img)
    rounded(d, (300, 170, 900, 630), 34, COL["white"], COL["line"], 2)
    rounded(d, (300, 170, 900, 245), 34, COL["soft_blue"], COL["line"], 2)
    for i, c in enumerate([COL["green"], COL["orange"], COL["red"]]):
        y = 315 + i * 90
        ellipse(d, (390, y, 435, y + 45), c)
        rounded(d, (470, y + 10, 790, y + 28), 7, "#D9E2EC")
    line(d, [(620, 558), (685, 615), (805, 475)], COL["green"], 18)
    draw_person(d, 235, 610, 0.9, COL["blue"])
    draw_robot(d, 970, 340, 1.0, COL["cyan"])
    save(img, "approval_gate.png")


def placement_map():
    img = canvas()
    d = ImageDraw.Draw(img)
    line(d, [(160, 560), (360, 430), (590, 500), (770, 330), (1040, 245)], "#CAD6E2", 16)
    for x, y, fill, accent in [
        (100, 515, COL["soft_blue"], COL["blue"]),
        (315, 385, COL["soft_green"], COL["green"]),
        (545, 455, COL["soft_orange"], COL["orange"]),
        (725, 285, COL["soft_cyan"], COL["cyan"]),
        (980, 200, COL["soft_red"], COL["red"]),
    ]:
        rounded(d, (x, y, x + 120, y + 80), 18, fill, accent, 3)
        ellipse(d, (x + 43, y + 24, x + 77, y + 58), accent)
    draw_laptop(d, 410, 165, 380, 205, COL["blue"])
    save(img, "placement_map.png")


def coding_agent():
    img = canvas()
    d = ImageDraw.Draw(img)
    draw_laptop(d, 280, 230, 620, 340, COL["blue"])
    draw_robot(d, 920, 220, 1.1, COL["blue"])
    for i, c in enumerate([COL["blue"], COL["green"], COL["orange"]]):
        rounded(d, (360, 330 + i * 54, 720 - i * 45, 350 + i * 54), 6, c)
    line(d, [(885, 290), (810, 370)], COL["line"], 5)
    save(img, "coding_agent.png")


def ide_agent():
    img = canvas()
    d = ImageDraw.Draw(img)
    rounded(d, (220, 190, 980, 610), 28, COL["white"], COL["line"], 2)
    rounded(d, (220, 190, 980, 250), 28, COL["soft_orange"], COL["line"], 2)
    rounded(d, (255, 285, 610, 560), 16, "#F3F7FB", "#E0E8F0", 2)
    rounded(d, (635, 285, 945, 560), 16, "#111827", "#111827", 2)
    for i in range(5):
        rounded(d, (285, 320 + i * 36, 560 - i * 20, 332 + i * 36), 5, "#CBD8E5")
    for i in range(4):
        rounded(d, (668, 330 + i * 42, 900 - i * 18, 345 + i * 42), 5, "#2F7D4A")
    draw_robot(d, 205, 525, 0.95, COL["orange"])
    save(img, "ide_agent.png")


def antigravity():
    img = canvas()
    d = ImageDraw.Draw(img)
    rounded(d, (130, 170, 1070, 610), 34, COL["white"], COL["line"], 2)
    for i, (x, y, c) in enumerate([(190, 245, COL["blue"]), (455, 220, COL["green"]), (720, 260, COL["orange"])]):
        rounded(d, (x, y, x + 220, y + 150), 20, "#F8FAFC", "#D9E2EC", 2)
        rounded(d, (x + 24, y + 28, x + 105, y + 43), 5, c)
        rounded(d, (x + 24, y + 72, x + 180, y + 84), 5, "#CBD8E5")
        rounded(d, (x + 24, y + 105, x + 150, y + 117), 5, "#CBD8E5")
    line(d, [(300, 485), (570, 475), (835, 500)], COL["line"], 8)
    draw_robot(d, 600, 530, 0.9, COL["green"])
    save(img, "antigravity_artifacts.png")


def openclaw():
    img = canvas()
    d = ImageDraw.Draw(img)
    draw_robot(d, 610, 300, 1.2, COL["red"])
    for x, y, fill, accent in [
        (155, 210, COL["soft_red"], COL["red"]),
        (160, 465, COL["soft_blue"], COL["blue"]),
        (845, 205, COL["soft_green"], COL["green"]),
        (845, 465, COL["soft_orange"], COL["orange"]),
    ]:
        rounded(d, (x, y, x + 230, y + 126), 26, fill, accent, 3)
        rounded(d, (x + 34, y + 38, x + 164, y + 52), 6, accent)
        rounded(d, (x + 34, y + 78, x + 198, y + 91), 6, "#CBD8E5")
    line(d, [(385, 270), (540, 295)], COL["line"], 5)
    line(d, [(390, 525), (550, 365)], COL["line"], 5)
    line(d, [(845, 270), (680, 295)], COL["line"], 5)
    line(d, [(845, 525), (680, 365)], COL["line"], 5)
    save(img, "openclaw_channels.png")


def hermes():
    img = canvas()
    d = ImageDraw.Draw(img)
    for i, (x, y, c) in enumerate([(320, 470, COL["soft_blue"]), (360, 420, COL["soft_green"]), (400, 370, COL["soft_cyan"])]):
        rounded(d, (x, y, x + 360, y + 110), 22, c, COL["line"], 2)
        rounded(d, (x + 34, y + 35, x + 190, y + 50), 6, COL["cyan"])
    draw_robot(d, 650, 260, 1.25, COL["cyan"])
    line(d, [(710, 365), (730, 430), (690, 500)], COL["line"], 6)
    for x, y, c in [(835, 245, COL["orange"]), (885, 390, COL["green"]), (795, 520, COL["blue"])]:
        ellipse(d, (x, y, x + 72, y + 72), c)
    save(img, "hermes_memory.png")


def final_check():
    img = canvas()
    d = ImageDraw.Draw(img)
    rounded(d, (300, 140, 900, 660), 34, COL["white"], COL["line"], 2)
    rounded(d, (360, 220, 840, 270), 10, COL["soft_blue"], COL["blue"], 2)
    rounded(d, (360, 320, 840, 370), 10, COL["soft_green"], COL["green"], 2)
    rounded(d, (360, 420, 840, 470), 10, COL["soft_orange"], COL["orange"], 2)
    rounded(d, (360, 520, 840, 570), 10, COL["soft_red"], COL["red"], 2)
    for y, c in [(232, COL["blue"]), (332, COL["green"]), (432, COL["orange"]), (532, COL["red"])]:
        line(d, [(390, y), (412, y + 20), (455, y - 24)], c, 9)
    draw_person(d, 230, 610, 0.85, COL["blue"])
    draw_robot(d, 980, 390, 1.0, COL["cyan"])
    save(img, "final_check.png")


for fn in [
    cover,
    ai_tools,
    approval,
    placement_map,
    coding_agent,
    ide_agent,
    antigravity,
    openclaw,
    hermes,
    final_check,
]:
    fn()

print(OUT)
