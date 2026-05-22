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
const OUT = path.join(BASE, "팀탐험_보상카드_점수카드순서_v1.pptx");
const RENDER_DIR = path.join(BASE, "팀탐험_보상카드_점수카드순서_v1_render");
const PPTX_RENDER_DIR = path.join(BASE, "팀탐험_보상카드_점수카드순서_v1_pptx_render");
const ASSET_DIR = path.join(BASE, "slide_assets_team_exploration_v1");
const SCORE_ASSET_DIR = path.join(BASE, "slide_assets_scorecard_order_v1");

const assets = {
  back: path.join(ASSET_DIR, "card_back.png"),
  flag: path.join(ASSET_DIR, "card_flag.png"),
  compass: path.join(ASSET_DIR, "card_compass.png"),
  map: path.join(ASSET_DIR, "card_map.png"),
  lantern: path.join(ASSET_DIR, "card_lantern.png"),
  rope: path.join(ASSET_DIR, "card_rope.png"),
  food: path.join(ASSET_DIR, "card_food.png"),
  backGrid: path.join(SCORE_ASSET_DIR, "back_grid_10x4.png"),
  coverHeadline: path.join(SCORE_ASSET_DIR, "cover_headline.png"),
  cardRowAll: path.join(SCORE_ASSET_DIR, "card_row_all_1to6.png"),
  drawWin: path.join(SCORE_ASSET_DIR, "draw_win_1_2_3_4.png"),
  drawLose: path.join(SCORE_ASSET_DIR, "draw_lose_5_6.png"),
};

const W = 1920;
const H = 1080;
const C = {
  night: "#071F2C",
  deep: "#0D3140",
  teal: "#1D5A5E",
  panel: "#123746",
  panel2: "#183F37",
  paper: "#F8F1DD",
  cream: "#FFF9E8",
  gold: "#F5B84B",
  gold2: "#D6922E",
  orange: "#E1673E",
  ink: "#122025",
  muted: "#64706C",
  white: "#FFFFFF",
  line: "#E6D6B3",
  green: "#315746",
};

const cards = [
  { name: "식량", score: "1점", pct: "28%", asset: assets.food, color: "#E2A747" },
  { name: "로프", score: "2점", pct: "24%", asset: assets.rope, color: "#B8753D" },
  { name: "랜턴", score: "3점", pct: "18%", asset: assets.lantern, color: "#E1B53A" },
  { name: "지도", score: "4점", pct: "12%", asset: assets.map, color: "#D65E48" },
  { name: "나침반", score: "5점", pct: "10%", asset: assets.compass, color: "#34898D" },
  { name: "깃발", score: "6점", pct: "8%", asset: assets.flag, color: "#D8A43F" },
];

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

function darkSlide(slide, title, subtitle, body) {
  slide.compose(
    layers({ name: "stage", width: fill, height: fill }, [
      shape({ name: "bg", width: fill, height: fill, fill: paint(C.night) }),
      shape({ name: "top-band", width: fill, height: fixed(18), fill: paint(C.gold) }),
      column(
        {
          name: "root",
          width: fill,
          height: fill,
          padding: { x: 76, y: 56 },
          gap: 28,
        },
        [
          column({ name: "header", width: fill, height: hug, gap: 10 }, [
            t(title, { name: "title", size: 54, bold: true, color: C.gold }),
            subtitle ? t(subtitle, { name: "subtitle", size: 24, color: "#D8E2DD" }) : null,
          ].filter(Boolean)),
          body,
        ],
      ),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

function lightSlide(slide, title, subtitle, body) {
  slide.compose(
    layers({ name: "stage", width: fill, height: fill }, [
      shape({ name: "bg", width: fill, height: fill, fill: paint(C.cream) }),
      shape({ name: "top-band", width: fill, height: fixed(18), fill: paint(C.deep) }),
      column(
        {
          name: "root",
          width: fill,
          height: fill,
          padding: { x: 76, y: 56 },
          gap: 28,
        },
        [
          column({ name: "header", width: fill, height: hug, gap: 10 }, [
            t(title, { name: "title", size: 54, bold: true, color: C.deep }),
            subtitle ? t(subtitle, { name: "subtitle", size: 24, color: C.muted }) : null,
          ].filter(Boolean)),
          body,
        ],
      ),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

function badge(label, value, fillColor = C.deep) {
  return panel(
    {
      name: `badge-${label}`,
      width: fill,
      height: hug,
      fill: paint(fillColor),
      padding: { x: 20, y: 16 },
      borderRadius: 18,
    },
    column({ width: fill, height: hug, gap: 4, align: "center" }, [
      t(value, { size: 42, bold: true, color: C.gold, width: fill, style: { textAlign: "center" } }),
      t(label, { size: 22, bold: true, color: C.white, width: fill, style: { textAlign: "center" } }),
    ]),
  );
}

function formulaBox(parts, result, dark = false) {
  const bg = dark ? C.panel : C.paper;
  const fg = dark ? C.white : C.deep;
  const plus = dark ? C.gold : C.gold2;
  const children = [];
  parts.forEach((part, idx) => {
    const isBonus = part.includes("보너스");
    children.push(t(part, {
      size: isBonus ? 32 : 36,
      bold: true,
      color: fg,
      width: fixed(isBonus ? 290 : 78),
      style: { textAlign: "center" },
    }));
    if (idx < parts.length - 1) {
      children.push(t("+", { size: 38, bold: true, color: plus, width: fixed(30), style: { textAlign: "center" } }));
    }
  });
  children.push(t("=", { size: 38, bold: true, color: plus, width: fixed(30), style: { textAlign: "center" } }));
  children.push(t(result, { size: 44, bold: true, color: C.orange, width: fixed(190), style: { textAlign: "center" } }));
  return panel(
    {
      name: "formula",
      width: fill,
      height: hug,
      fill: paint(bg),
      line: stroke(dark ? "#2A5A61" : C.line),
      padding: { x: 28, y: 24 },
      borderRadius: 18,
    },
    row({ width: fill, height: hug, gap: 10, align: "center", justify: "center" }, children),
  );
}

function teamRow(team, count, base, bonus, total, rankColor) {
  const bonusText = bonus ? `+ 완주 보너스(${bonus})` : "";
  return panel(
    {
      name: `team-${team}`,
      width: fill,
      height: hug,
      fill: paint("#FFFFFF"),
      line: stroke("#E0D0A9"),
      padding: { x: 26, y: 18 },
      borderRadius: 14,
    },
    row({ width: fill, height: hug, gap: 16, align: "center" }, [
      panel(
        {
          name: `team-chip-${team}`,
          width: fixed(96),
          height: fixed(58),
          fill: paint(rankColor),
          borderRadius: 14,
        },
        t(`${team}조`, { size: 28, bold: true, color: C.white, width: fill, style: { textAlign: "center" } }),
      ),
      t(`뽑은 카드 ${count}장`, { size: 28, bold: true, color: C.deep, width: fixed(270) }),
      t(`기본 ${base}점`, { size: 28, bold: true, color: C.ink, width: fixed(150) }),
      bonusText ? t(bonusText, { size: 24, color: C.green, width: fixed(320) }) : t("완주 보너스 없음", { size: 24, color: C.muted, width: fixed(320) }),
      t(`= ${total}점`, { size: 34, bold: true, color: C.orange, width: fill, style: { textAlign: "right" } }),
    ]),
  );
}

async function ensureScoreAssets() {
  await fs.access(assets.backGrid);
  await fs.access(assets.coverHeadline);
  await fs.access(assets.cardRowAll);
  await fs.access(assets.drawWin);
  await fs.access(assets.drawLose);
}

await ensureScoreAssets();

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

// 1. 특별한 점수 시스템 소개
{
  const slide = presentation.slides.add();
  slide.compose(
    layers({ name: "stage", width: fill, height: fill }, [
      shape({ name: "bg", width: fill, height: fill, fill: paint(C.night) }),
      shape({ name: "top-band", width: fill, height: fixed(18), fill: paint(C.gold) }),
      grid(
        {
          name: "cover",
          width: fill,
          height: fill,
          columns: [fr(0.95), fr(1.05)],
          columnGap: 52,
          padding: { x: 74, y: 58 },
        },
        [
          column({ width: fill, height: hug, gap: 22, justify: "center" }, [
            t("특별한 점수 시스템 소개", { size: 46, bold: true, color: C.gold }),
            image({ name: "cover-headline", path: assets.coverHeadline, width: fixed(820), height: fixed(306), fit: "contain", alt: "활동도 하고 카드도 모으고 마지막에 공개하고" }),
            rule({ name: "cover-rule", width: fixed(180), stroke: C.gold, weight: 5 }),
            t("매 라운드마다 카드 점수를 누적한 뒤 마지막에 비교하는 방식", {
              size: 28,
              color: "#D8E2DD",
              width: wrap(790),
            }),
          ]),
          panel(
            {
              name: "cover-card-panel",
              width: fill,
              height: grow(1),
              fill: paint("#0D2A38"),
              line: stroke("#245867"),
              padding: { x: 34, y: 30 },
              borderRadius: 22,
            },
            column({ width: fill, height: fill, gap: 18, justify: "center" }, [
              image({ name: "cover-card-row", path: assets.cardRowAll, width: fill, height: fixed(350), fit: "contain", alt: "탐험 카드 6종" }),
              t("점수판은 쓰지 않고 팀 봉투에 카드를 모읍니다.", {
                size: 28,
                color: C.white,
                width: fill,
                style: { textAlign: "center" },
              }),
              t("결과는 마지막 정산 때 한 번에 공개합니다.", {
                size: 28,
                bold: true,
                color: C.gold,
                width: fill,
                style: { textAlign: "center" },
              }),
            ]),
          ),
        ],
      ),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

// 2. 탐험 카드 점수 시스템
{
  const slide = presentation.slides.add();
  darkSlide(
    slide,
    "탐험 카드 점수 시스템",
    "높은 점수일수록 낮은 확률로 설계된 탐험 카드 점수 시스템",
    column({ name: "card-system", width: fill, height: grow(1), gap: 20 }, [
      grid(
        {
          name: "card-grid",
          width: fill,
          height: grow(1),
          columns: [fr(1), fr(1), fr(1), fr(1), fr(1), fr(1)],
          columnGap: 18,
        },
        cards.map((card) =>
          panel(
            {
              name: `card-${card.name}`,
              width: fill,
              height: fill,
              fill: paint("#0E2B38"),
              line: stroke("#245867"),
              padding: { x: 14, y: 18 },
              borderRadius: 18,
            },
            column({ width: fill, height: fill, gap: 12, align: "center" }, [
              image({ name: `${card.name}-image`, path: card.asset, width: fill, height: fixed(330), fit: "contain", alt: `${card.name} 카드` }),
              t(card.name, { size: 28, bold: true, color: C.white, width: fill, style: { textAlign: "center" } }),
              t(card.score, { size: 42, bold: true, color: C.gold, width: fill, style: { textAlign: "center" } }),
              t(card.pct, { size: 24, bold: true, color: card.color, width: fill, style: { textAlign: "center" } }),
            ]),
          ),
        ),
      ),
      row({ name: "probability-note", width: fill, height: hug, gap: 16, align: "center", justify: "center" }, [
        t("식량 28%", { size: 24, color: "#D8E2DD", width: hug }),
        t("→", { size: 24, color: C.gold, width: hug }),
        t("로프 24%", { size: 24, color: "#D8E2DD", width: hug }),
        t("→", { size: 24, color: C.gold, width: hug }),
        t("랜턴 18%", { size: 24, color: "#D8E2DD", width: hug }),
        t("→", { size: 24, color: C.gold, width: hug }),
        t("지도 12%", { size: 24, color: "#D8E2DD", width: hug }),
        t("→", { size: 24, color: C.gold, width: hug }),
        t("나침반 10%", { size: 24, color: "#D8E2DD", width: hug }),
        t("→", { size: 24, color: C.gold, width: hug }),
        t("깃발 8%", { size: 24, color: "#D8E2DD", width: hug }),
      ]),
    ]),
  );
}

// 3. 탐험 완주 보너스
{
  const slide = presentation.slides.add();
  lightSlide(
    slide,
    "탐험 완주 보너스",
    "서로 다른 탐험 카드 6종을 한 세트로 모으면 추가 점수를 줍니다.",
    column({ name: "set-bonus", width: fill, height: grow(1), gap: 26, justify: "center" }, [
      image({ name: "all-cards", path: assets.cardRowAll, width: fill, height: fixed(310), fit: "contain", alt: "탐험 카드 6종 세트" }),
      formulaBox(["1점", "2점", "3점", "4점", "5점", "6점", "완주 보너스 9점"], "총 30점"),
      row({ width: fill, height: hug, gap: 24, justify: "center" }, [
        badge("한 세트 구성", "6종", C.deep),
        badge("추가 점수", "+9점", C.green),
        badge("세트 총점", "30점", C.orange),
      ]),
    ]),
  );
}

// 4. 승패 결과에 따른 카드 랜덤 뽑기
{
  const slide = presentation.slides.add();
  darkSlide(
    slide,
    "승패 결과에 따른 카드 랜덤 뽑기",
    "승패가 곧 최종 점수가 되지 않습니다. 뽑기 횟수만 달라집니다.",
    grid(
      {
        name: "draw-rule",
        width: fill,
        height: grow(1),
        columns: [fr(1), fr(0.82)],
        columnGap: 56,
      },
      [
        panel(
          {
            name: "back-grid-panel",
            width: fill,
            height: fill,
            fill: paint("#0E2B38"),
            line: stroke("#245867"),
            padding: { x: 30, y: 30 },
            borderRadius: 22,
          },
          image({ name: "back-grid", path: assets.backGrid, width: fill, height: fill, fit: "contain", alt: "랜덤 뽑기 카드 더미" }),
        ),
        column({ width: fill, height: hug, gap: 30, justify: "center" }, [
          panel(
            {
              name: "win-draw",
              width: fill,
              height: hug,
              fill: paint(C.panel2),
              line: stroke("#3D7769"),
              padding: { x: 36, y: 34 },
              borderRadius: 22,
            },
            row({ width: fill, height: hug, gap: 26, align: "center" }, [
              t("승리", { size: 46, bold: true, color: C.white, width: fixed(170) }),
              t("뽑기 4회", { size: 64, bold: true, color: C.gold, width: fill }),
            ]),
          ),
          panel(
            {
              name: "lose-draw",
              width: fill,
              height: hug,
              fill: paint(C.panel),
              line: stroke("#245867"),
              padding: { x: 36, y: 34 },
              borderRadius: 22,
            },
            row({ width: fill, height: hug, gap: 26, align: "center" }, [
              t("패배", { size: 46, bold: true, color: C.white, width: fixed(170) }),
              t("뽑기 2회", { size: 64, bold: true, color: C.gold, width: fill }),
            ]),
          ),
          t("카드는 팀 봉투에 넣고, 계산은 마지막에 진행합니다.", {
            size: 26,
            color: "#D8E2DD",
            width: wrap(700),
          }),
        ]),
      ],
    ),
  );
}

// 5. 승리팀 랜덤뽑기 예시
{
  const slide = presentation.slides.add();
  lightSlide(
    slide,
    "탐험 카드 랜덤뽑기 예시",
    "승리한 경우 뽑기 4회",
    column({ name: "win-example", width: fill, height: grow(1), gap: 36, justify: "center" }, [
      image({ name: "win-draw-cards", path: assets.drawWin, width: fill, height: fixed(360), fit: "contain", alt: "승리팀 뽑기 카드 예시" }),
      formulaBox(["1점", "2점", "3점", "4점"], "총 10점"),
      t("승리팀이라고 항상 높은 점수를 얻는 것은 아닙니다. 뽑기 결과가 마지막까지 긴장감을 만듭니다.", {
        size: 26,
        color: C.muted,
        width: fill,
        style: { textAlign: "center" },
      }),
    ]),
  );
}

// 6. 패배팀 랜덤뽑기 예시
{
  const slide = presentation.slides.add();
  lightSlide(
    slide,
    "탐험 카드 랜덤뽑기 예시",
    "패배한 경우 뽑기 2회",
    column({ name: "lose-example", width: fill, height: grow(1), gap: 36, justify: "center" }, [
      image({ name: "lose-draw-cards", path: assets.drawLose, width: fill, height: fixed(360), fit: "contain", alt: "패배팀 뽑기 카드 예시" }),
      formulaBox(["5점", "6점"], "총 11점"),
      t("패배팀도 좋은 카드를 뽑을 수 있습니다. 그래서 참여를 중간에 포기하지 않게 됩니다.", {
        size: 26,
        color: C.muted,
        width: fill,
        style: { textAlign: "center" },
      }),
    ]),
  );
}

// 7. 조별 랜덤뽑기 최종 예시
{
  const slide = presentation.slides.add();
  lightSlide(
    slide,
    "승패 결과에 따른 조별 랜덤뽑기 최종 예시",
    "기본 점수와 완주 보너스를 더해 마지막에 한 번에 공개합니다.",
    grid(
      {
        name: "final-example",
        width: fill,
        height: grow(1),
        columns: [fr(1.25), fr(0.75)],
        columnGap: 36,
      },
      [
        column({ width: fill, height: hug, gap: 16, justify: "center" }, [
          teamRow("1", 14, 54, "2회 × 9점", 72, C.orange),
          teamRow("2", 18, 51, "2회 × 9점", 69, C.deep),
          teamRow("3", 12, 32, "", 32, C.green),
          teamRow("4", 21, 40, "", 40, C.teal),
        ]),
        panel(
          {
            name: "final-note",
            width: fill,
            height: fill,
            fill: paint(C.deep),
            padding: { x: 30, y: 34 },
            borderRadius: 22,
          },
          column({ width: fill, height: fill, gap: 22, justify: "center" }, [
            t("운영 포인트", { size: 34, bold: true, color: C.gold }),
            t("라운드 중에는 카드만 지급합니다.", { size: 28, color: C.white }),
            t("마지막에 팀별 봉투를 열고 직접 합산합니다.", { size: 28, color: C.white }),
            t("점수 공개 후에는 참여 행동과 팀 협업을 연결해 마무리합니다.", { size: 28, color: C.white }),
          ]),
        ),
      ],
    ),
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
await fs.mkdir(PPTX_RENDER_DIR, { recursive: true });

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(OUT);

for (let i = 0; i < presentation.slides.count; i += 1) {
  const slide = presentation.slides.getItem(i);
  const blob = await slide.export({ format: "png" });
  const bytes = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(path.join(RENDER_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`), bytes);
}

const savedBytes = await fs.readFile(OUT);
const imported = await PresentationFile.importPptx(savedBytes);
for (let i = 0; i < imported.slides.count; i += 1) {
  const slide = imported.slides.getItem(i);
  const blob = await slide.export({ format: "png" });
  const bytes = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(path.join(PPTX_RENDER_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`), bytes);
}

console.log(OUT);
console.log(RENDER_DIR);
console.log(PPTX_RENDER_DIR);
