import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const artifact = await import(
  "file:///C:/Users/aceka/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs"
);
const jsx = await import(
  "file:///C:/Users/aceka/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/presentation-jsx/index.mjs"
);

const {
  Presentation,
  PresentationFile,
  row,
  column,
  grid,
  layers,
  panel,
  text,
  image,
  shape,
  rule,
  fill,
  hug,
  fixed,
  wrap,
  grow,
  fr,
} = artifact;
const { paint, stroke } = jsx;

const __filename = fileURLToPath(import.meta.url);
const BASE = path.dirname(__filename);
const OUT = path.join(BASE, "팀탐험_보상카드_안내슬라이드_v1.pptx");
const RENDER_DIR = path.join(BASE, "팀탐험_보상카드_안내슬라이드_v1_render");
const ASSET_DIR = path.join(BASE, "slide_assets_team_exploration_v1");

const assets = {
  montage: path.join(ASSET_DIR, "cards_montage.png"),
  back: path.join(ASSET_DIR, "card_back.png"),
  flag: path.join(ASSET_DIR, "card_flag.png"),
  compass: path.join(ASSET_DIR, "card_compass.png"),
  map: path.join(ASSET_DIR, "card_map.png"),
  lantern: path.join(ASSET_DIR, "card_lantern.png"),
  rope: path.join(ASSET_DIR, "card_rope.png"),
  food: path.join(ASSET_DIR, "card_food.png"),
};

const W = 1920;
const H = 1080;
const C = {
  green: "#1F332D",
  green2: "#2F4A3F",
  paper: "#F7F3E8",
  cream: "#FFFDF5",
  gold: "#B58437",
  ink: "#222A25",
  muted: "#68736A",
  light: "#E8EFE9",
  line: "#D8CFBD",
  red: "#B44738",
  teal: "#2C6870",
  olive: "#657A4C",
  amber: "#C58A24",
  indigo: "#263C63",
};

function t(value, opts = {}) {
  return text(value, {
    name: opts.name,
    width: opts.width ?? fill,
    height: opts.height ?? hug,
    style: {
      fontFace: "Malgun Gothic",
      fontSize: opts.size ?? 30,
      bold: opts.bold ?? false,
      color: opts.color ?? C.ink,
      ...(opts.style ?? {}),
    },
  });
}

function k(label, value, color = C.green) {
  return column(
    {
      name: `metric-${label}`,
      width: fill,
      height: hug,
      gap: 8,
      align: "center",
    },
    [
      t(value, { size: 50, bold: true, color }),
      t(label, { size: 19, color: C.muted }),
    ],
  );
}

function cardImage(name, assetPath, h = 360) {
  return image({
    name,
    path: assetPath,
    width: fill,
    height: fixed(h),
    fit: "contain",
    alt: name,
  });
}

function titleSlide(slide, kicker, title, subtitle, children = []) {
  slide.compose(
    layers({ name: "stage", width: fill, height: fill }, [
      shape({ name: "bg", width: fill, height: fill, fill: paint(C.paper) }),
      column(
        {
          name: "content",
          width: fill,
          height: fill,
          padding: { x: 96, y: 70 },
          gap: 26,
        },
        [
          t(kicker, { size: 20, bold: true, color: C.gold }),
          t(title, { size: 78, bold: true, color: C.green, width: wrap(1060) }),
          rule({ name: "title-rule", width: fixed(180), stroke: C.gold, weight: 5 }),
          t(subtitle, { size: 30, color: C.muted, width: wrap(1080) }),
          ...children,
        ],
      ),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

function normalSlide(slide, title, subtitle, body) {
  slide.compose(
    layers({ name: "stage", width: fill, height: fill }, [
      shape({ name: "bg", width: fill, height: fill, fill: paint(C.cream) }),
      shape({ name: "left-rail", width: fixed(28), height: fill, fill: paint(C.green) }),
      column(
        {
          name: "root",
          width: fill,
          height: fill,
          padding: { x: 86, y: 58 },
          gap: 28,
        },
        [
          column({ name: "title-stack", width: fill, height: hug, gap: 10 }, [
            t(title, { name: "slide-title", size: 54, bold: true, color: C.green }),
            subtitle ? t(subtitle, { name: "subtitle", size: 24, color: C.muted }) : null,
          ].filter(Boolean)),
          body,
        ],
      ),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

function bulletList(items, size = 30) {
  return column(
    { name: "bullet-list", width: fill, height: hug, gap: 18 },
    items.map((item, idx) =>
      row(
        { name: `bullet-${idx + 1}`, width: fill, height: hug, gap: 18, align: "start" },
        [
          shape({
            name: `dot-${idx + 1}`,
            width: fixed(16),
            height: fixed(16),
            fill: paint(C.gold),
            borderRadius: "rounded-full",
          }),
          t(item, { size, color: C.ink, width: wrap(1320) }),
        ],
      ),
    ),
  );
}

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

// 1. Cover
{
  const slide = presentation.slides.add();
  slide.compose(
    layers({ name: "cover-stage", width: fill, height: fill }, [
      shape({ name: "bg", width: fill, height: fill, fill: paint(C.paper) }),
      grid(
        {
          name: "cover-root",
          width: fill,
          height: fill,
          columns: [fr(1.05), fr(0.95)],
          columnGap: 72,
          padding: { x: 80, y: 84 },
        },
        [
          grid(
            {
              name: "cover-card-grid",
              width: fill,
              height: fill,
              columns: [fr(1), fr(1), fr(1)],
              rows: [fr(1), fr(1)],
              columnGap: 20,
              rowGap: 20,
            },
            [
              image({ name: "cover-flag", path: assets.flag, width: fill, height: fill, fit: "contain", alt: "깃발 카드" }),
              image({ name: "cover-compass", path: assets.compass, width: fill, height: fill, fit: "contain", alt: "나침반 카드" }),
              image({ name: "cover-map", path: assets.map, width: fill, height: fill, fit: "contain", alt: "지도 카드" }),
              image({ name: "cover-lantern", path: assets.lantern, width: fill, height: fill, fit: "contain", alt: "랜턴 카드" }),
              image({ name: "cover-rope", path: assets.rope, width: fill, height: fill, fit: "contain", alt: "로프 카드" }),
              image({ name: "cover-food", path: assets.food, width: fill, height: fill, fit: "contain", alt: "식량 카드" }),
            ],
          ),
          column(
            {
              name: "cover-copy",
              width: fill,
              height: hug,
              gap: 28,
              justify: "center",
            },
            [
              t("TEAM EXPLORATION CARD", { size: 22, bold: true, color: C.gold }),
              t("팀 탐험\n보상 카드", { size: 88, bold: true, color: C.green, width: wrap(780) }),
              rule({ name: "cover-rule", width: fixed(180), stroke: C.gold, weight: 5 }),
              t("점수판 없이 참여 행동을 모으고,\n마지막 정산으로 학습 경험을 마무리합니다.", {
                size: 30,
                color: C.muted,
                width: wrap(780),
              }),
            ],
          ),
        ],
      ),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

// 2. Philosophy
{
  const slide = presentation.slides.add();
  titleSlide(
    slide,
    "운영 철학",
    "점수판이 아니라,\n마지막 정산의 기대감",
    "실시간 순위보다 끝까지 참여할 이유를 설계합니다.",
    [
      grid(
        {
          name: "principles",
          width: fill,
          height: grow(1),
          columns: [fr(1), fr(1), fr(1)],
          columnGap: 26,
        },
        [
          panel({ name: "p1", fill: paint("#FFFDF5"), line: stroke("#D8CFBD"), padding: 28, borderRadius: 18 },
            column({ width: fill, height: hug, gap: 14 }, [
              t("1", { size: 48, bold: true, color: C.gold }),
              t("지금 점수를 보여주지 않는다", { size: 28, bold: true, color: C.green }),
              t("카드는 팀 봉투에 모으고 마지막에 함께 정산합니다.", { size: 22, color: C.muted }),
            ])),
          panel({ name: "p2", fill: paint("#FFFDF5"), line: stroke("#D8CFBD"), padding: 28, borderRadius: 18 },
            column({ width: fill, height: hug, gap: 14 }, [
              t("2", { size: 48, bold: true, color: C.gold }),
              t("행동에 보상을 붙인다", { size: 28, bold: true, color: C.green }),
              t("좋은 질문, 협업, 적용 아이디어에 카드를 지급합니다.", { size: 22, color: C.muted }),
            ])),
          panel({ name: "p3", fill: paint("#FFFDF5"), line: stroke("#D8CFBD"), padding: 28, borderRadius: 18 },
            column({ width: fill, height: hug, gap: 14 }, [
              t("3", { size: 48, bold: true, color: C.gold }),
              t("조합으로 반전을 만든다", { size: 28, bold: true, color: C.green }),
              t("6종을 모두 모으면 완주 보너스가 붙습니다.", { size: 22, color: C.muted }),
            ])),
        ],
      ),
    ],
  );
}

// 3. Rule overview
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "오늘의 규칙은 간단합니다",
    "활동을 하고, 카드를 모으고, 마지막에 정산합니다.",
    row(
      { name: "flow", width: fill, height: grow(1), gap: 34, align: "center" },
      [
        column({ width: fixed(460), height: hug, gap: 14, align: "center" }, [
          t("활동", { size: 56, bold: true, color: C.green }),
          t("팀 과제에 참여합니다.", { size: 26, color: C.muted }),
        ]),
        t("→", { size: 56, bold: true, color: C.gold, width: fixed(60) }),
        column({ width: fixed(460), height: hug, gap: 14, align: "center" }, [
          image({ name: "back-card", path: assets.back, width: fixed(250), height: fixed(360), fit: "contain", alt: "카드 뒷면" }),
          t("카드", { size: 56, bold: true, color: C.green }),
          t("팀 봉투에 모아둡니다.", { size: 26, color: C.muted }),
        ]),
        t("→", { size: 56, bold: true, color: C.gold, width: fixed(60) }),
        column({ width: fixed(460), height: hug, gap: 14, align: "center" }, [
          t("정산", { size: 56, bold: true, color: C.green }),
          t("마지막에 한 번에 공개합니다.", { size: 26, color: C.muted }),
        ]),
      ],
    ),
  );
}

// 4. Card lineup
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "탐험 카드 6종",
    "높은 점수 카드는 적고, 낮은 점수 카드는 완주에 필요합니다.",
    grid(
      {
        name: "cards-grid",
        width: fill,
        height: grow(1),
        columns: [fr(1), fr(1), fr(1), fr(1), fr(1), fr(1)],
        columnGap: 16,
      },
      [
        column({ width: fill, height: hug, gap: 10, align: "center" }, [cardImage("flag", assets.flag, 390), t("깃발 6점", { size: 24, bold: true, color: C.red })]),
        column({ width: fill, height: hug, gap: 10, align: "center" }, [cardImage("compass", assets.compass, 390), t("나침반 5점", { size: 24, bold: true, color: C.teal })]),
        column({ width: fill, height: hug, gap: 10, align: "center" }, [cardImage("map", assets.map, 390), t("지도 4점", { size: 24, bold: true, color: C.olive })]),
        column({ width: fill, height: hug, gap: 10, align: "center" }, [cardImage("lantern", assets.lantern, 390), t("랜턴 3점", { size: 24, bold: true, color: C.amber })]),
        column({ width: fill, height: hug, gap: 10, align: "center" }, [cardImage("rope", assets.rope, 390), t("로프 2점", { size: 24, bold: true, color: C.indigo })]),
        column({ width: fill, height: hug, gap: 10, align: "center" }, [cardImage("food", assets.food, 390), t("식량 1점", { size: 24, bold: true, color: C.olive })]),
      ],
    ),
  );
}

// 5. Completion bonus
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "6종을 모두 모으면 완주 보너스",
    "카드 개수만큼 중요한 것은 조합입니다.",
    grid(
      {
        name: "bonus-layout",
        width: fill,
        height: grow(1),
        columns: [fr(0.92), fr(1.08)],
        columnGap: 56,
      },
      [
        image({ name: "bonus-montage", path: assets.montage, width: fill, height: fill, fit: "contain", alt: "탐험 카드 전체" }),
        column({ name: "bonus-copy", width: fill, height: hug, gap: 34, justify: "center" }, [
          row({ width: fill, height: hug, gap: 18, align: "center" }, [
            k("6종 기본 합산", "21점", C.green),
            t("+", { size: 56, bold: true, color: C.gold, width: fixed(60) }),
            k("완주 보너스", "9점", C.gold),
          ]),
          rule({ name: "bonus-rule", width: fill, stroke: C.line, weight: 3 }),
          t("완주 1회 = 30점", { size: 70, bold: true, color: C.green }),
          t("식량과 로프처럼 낮은 점수 카드도 완주에 필요합니다.", { size: 27, color: C.muted }),
        ]),
      ],
    ),
  );
}

// 6. Reward behaviors
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "카드는 이런 행동에 지급합니다",
    "정답보다 팀의 학습 행동을 보상합니다.",
    column(
      { name: "reward-list", width: fill, height: hug, gap: 24 },
      [
        panel({ fill: paint(C.light), padding: { x: 32, y: 26 }, borderRadius: 16 },
          row({ width: fill, gap: 32, align: "center" }, [
            t("4장", { size: 60, bold: true, color: C.gold, width: fixed(130) }),
            t("라운드 우승", { size: 38, bold: true, color: C.green }),
          ])),
        panel({ fill: paint("#F8F2E6"), padding: { x: 32, y: 26 }, borderRadius: 16 },
          row({ width: fill, gap: 32, align: "center" }, [
            t("2장", { size: 60, bold: true, color: C.gold, width: fixed(130) }),
            t("시간 안에 과제 완료  ·  참여 완료", { size: 38, bold: true, color: C.green }),
          ])),
        panel({ fill: paint(C.light), padding: { x: 32, y: 26 }, borderRadius: 16 },
          row({ width: fill, gap: 32, align: "center" }, [
            t("1장", { size: 60, bold: true, color: C.gold, width: fixed(130) }),
            t("좋은 질문  ·  실제 적용 아이디어  ·  다른 팀을 돕는 행동", {
              size: 34,
              bold: true,
              color: C.green,
              width: wrap(1320),
            }),
          ])),
      ],
    ),
  );
}

// 7. During operation
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "진행 중에는 짧게, 마지막에는 선명하게",
    "카드 뽑기는 활동의 보상이지 별도 행사로 키우지 않습니다.",
    grid(
      {
        name: "operation-grid",
        width: fill,
        height: grow(1),
        columns: [fr(0.9), fr(1.1)],
        columnGap: 56,
      },
      [
        image({ name: "back-card-large", path: assets.back, width: fill, height: fill, fit: "contain", alt: "카드 뒷면" }),
        column({ width: fill, height: hug, gap: 26, justify: "center" }, [
          bulletList([
            "보상 사유를 먼저 말한다.",
            "팀 대표가 정해진 수만큼 뽑는다.",
            "카드는 팀 봉투에 넣는다.",
            "점수 계산은 마지막에 한다.",
          ], 32),
          panel({ fill: paint(C.light), padding: 26, borderRadius: 16 },
            t("“카드는 열어봐도 됩니다. 계산은 마지막에 함께 하겠습니다.”", { size: 28, color: C.green })),
        ]),
      ],
    ),
  );
}

// 8. Settlement
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "마지막 정산 순서",
    "봉투를 여는 순간이 오늘 활동의 작은 결말입니다.",
    row(
      { name: "settlement", width: fill, height: grow(1), gap: 28, align: "center" },
      [
        column({ width: fixed(320), height: hug, gap: 18, align: "center" }, [t("1", { size: 72, bold: true, color: C.gold }), t("카드 분류", { size: 30, bold: true, color: C.green })]),
        t("→", { size: 48, color: C.gold, width: fixed(50) }),
        column({ width: fixed(320), height: hug, gap: 18, align: "center" }, [t("2", { size: 72, bold: true, color: C.gold }), t("기본 점수", { size: 30, bold: true, color: C.green })]),
        t("→", { size: 48, color: C.gold, width: fixed(50) }),
        column({ width: fixed(320), height: hug, gap: 18, align: "center" }, [t("3", { size: 72, bold: true, color: C.gold }), t("완주 보너스", { size: 30, bold: true, color: C.green })]),
        t("→", { size: 48, color: C.gold, width: fixed(50) }),
        column({ width: fixed(320), height: hug, gap: 18, align: "center" }, [t("4", { size: 72, bold: true, color: C.gold }), t("최종 공개", { size: 30, bold: true, color: C.green })]),
      ],
    ),
  );
}

// 9. Closing message
{
  const slide = presentation.slides.add();
  titleSlide(
    slide,
    "마무리 멘트",
    "결과는 운만으로\n만들어지지 않았습니다",
    "끝까지 참여한 행동, 좋은 질문, 팀 안에서 만든 연결이 카드로 쌓였습니다.",
    [
      panel(
        {
          name: "closing-line",
          fill: paint("#FFFDF5"),
          line: stroke("#D8CFBD"),
          padding: { x: 34, y: 28 },
          borderRadius: 18,
        },
        t("교육에서도 중요한 것은 점수가 아니라,\n내가 반복하기로 선택한 행동입니다.", {
          size: 34,
          bold: true,
          color: C.green,
          width: wrap(1120),
        }),
      ),
    ],
  );
}

const pendingImages = presentation.getPendingImageHydrationRequests();
const hydratedImages = [];
for (const request of pendingImages) {
  const data = await fs.readFile(request.uri);
  hydratedImages.push({
    assetId: request.assetId,
    contentType: request.contentType,
    data,
  });
}
presentation.hydrateImageAssets(hydratedImages);

await fs.mkdir(RENDER_DIR, { recursive: true });
const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(OUT);

for (let i = 0; i < presentation.slides.count; i += 1) {
  const slide = presentation.slides.getItem(i);
  const blob = await slide.export({ format: "png" });
  const bytes = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(path.join(RENDER_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`), bytes);
}

console.log(OUT);
console.log(RENDER_DIR);
