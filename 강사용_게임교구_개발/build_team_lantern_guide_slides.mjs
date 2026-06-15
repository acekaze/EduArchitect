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
const OUT = path.join(BASE, "팀등불_감사인정카드_안내슬라이드_v1.pptx");
const RENDER_DIR = path.join(BASE, "팀등불_감사인정카드_안내슬라이드_v1_render");
const CARD_DIR = path.join(BASE, "팀등불_AI카드디자인시안_v1");
const LANTERN_DIR = path.join(CARD_DIR, "등불카드");
const LIGHT_DIR = path.join(CARD_DIR, "빛조각카드");

const assets = {
  montage: path.join(BASE, "팀등불_AI등불카드_전체미리보기_v1.png"),
  lightMontage: path.join(BASE, "팀등불_AI빛조각카드_전체미리보기_v1.png"),
  back: path.join(BASE, "팀등불_AI카드뒷면_시안_v1.png"),
  listen01: path.join(LANTERN_DIR, "LISTEN01_경청.png"),
  listen02: path.join(LANTERN_DIR, "LISTEN02_반응.png"),
  listen05: path.join(LANTERN_DIR, "LISTEN05_배려.png"),
  team02: path.join(LANTERN_DIR, "TEAM02_도움.png"),
  team06: path.join(LANTERN_DIR, "TEAM06_분위기.png"),
  exec02: path.join(LANTERN_DIR, "EXEC02_책임.png"),
  think01: path.join(LANTERN_DIR, "THINK01_질문.png"),
  mood02: path.join(LANTERN_DIR, "MOOD02_웃음.png"),
  light01: path.join(LIGHT_DIR, "LIGHT01_작은 불빛.png"),
  light02: path.join(LIGHT_DIR, "LIGHT02_따뜻한 불빛.png"),
  light03: path.join(LIGHT_DIR, "LIGHT03_환한 불빛.png"),
};

const W = 1920;
const H = 1080;
const C = {
  ink: "#1F2527",
  muted: "#66706C",
  soft: "#F5EFE6",
  cream: "#FFF9EF",
  paper: "#F8F2E9",
  navy: "#1C3444",
  teal: "#2D6760",
  amber: "#C88521",
  gold: "#E2B75F",
  rose: "#C96E68",
  green: "#58714D",
  line: "#D9CBB7",
  paleAmber: "#F3D99B",
  paleGreen: "#E8F0E2",
  paleRose: "#F4DEDA",
  white: "#FFFFFF",
};
const F = {
  title: "Pretendard Black",
  body: "Pretendard",
};

function t(value, opts = {}) {
  const isTitle = opts.fontRole === "title" || opts.bold === true;
  const typeface = opts.typeface ?? opts.fontFace ?? (isTitle ? F.title : F.body);
  return text(value, {
    name: opts.name,
    width: opts.width ?? fill,
    height: opts.height ?? hug,
    style: {
      typeface,
      fontFace: typeface,
      fontSize: opts.size ?? 30,
      bold: opts.bold ?? false,
      color: opts.color ?? C.ink,
      lineHeight: opts.lineHeight ?? 1.18,
      ...(opts.style ?? {}),
    },
  });
}

function stage(slide, body, bg = C.cream) {
  slide.compose(
    layers({ name: "stage", width: fill, height: fill }, [
      shape({ name: "background", width: fill, height: fill, fill: paint(bg) }),
      shape({ name: "top-band", width: fill, height: fixed(16), fill: paint(C.navy) }),
      body,
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

function header(kicker, title, subtitle) {
  return column({ name: "header", width: fill, height: fixed(210), gap: 8 }, [
    t(kicker, { size: 20, bold: true, color: C.amber, height: fixed(28) }),
    t(title, { size: 52, bold: true, color: C.navy, width: wrap(1500), height: fixed(118), lineHeight: 1.05 }),
    subtitle ? t(subtitle, { size: 24, color: C.muted, width: wrap(1420), height: fixed(40) }) : null,
  ].filter(Boolean));
}

function normalSlide(slide, kicker, title, subtitle, content, opts = {}) {
  stage(
    slide,
    column(
      {
        name: "root",
        width: fill,
        height: fill,
        padding: { x: opts.px ?? 84, y: opts.py ?? 58 },
        gap: opts.gap ?? 34,
      },
      [header(kicker, title, subtitle), content],
    ),
    opts.bg ?? C.cream,
  );
}

function dotItem(value, color = C.amber, size = 30) {
  return row({ name: `dot-${value.slice(0, 8)}`, width: fill, height: hug, gap: 18, align: "start" }, [
    shape({ name: "dot", width: fixed(14), height: fixed(14), fill: paint(color), borderRadius: "rounded-full" }),
    t(value, { size, color: C.ink, width: fill }),
  ]);
}

function stepBox(num, title, body, color = C.amber) {
  return panel(
    {
      name: `step-${num}`,
      width: fill,
      height: hug,
      fill: paint(C.white),
      line: stroke(C.line),
      borderRadius: 18,
      padding: { x: 26, y: 22 },
    },
    row({ width: fill, height: hug, gap: 18, align: "center" }, [
      panel(
        {
          name: "num-bg",
          width: fixed(54),
          height: fixed(54),
          fill: paint(color),
          borderRadius: "rounded-full",
          padding: 0,
        },
        column(
          { width: fill, height: fill, justify: "center", align: "center" },
          [t(num, { size: 27, bold: true, color: C.white, width: hug, height: hug })],
        ),
      ),
      column({ width: fill, height: hug, gap: 6 }, [
        t(title, { size: 28, bold: true, color: C.navy }),
        t(body, { size: 21, color: C.muted, width: wrap(520) }),
      ]),
    ]),
  );
}

function card(pathValue, name, height = 480) {
  return image({ name, path: pathValue, width: fill, height: fixed(height), fit: "contain", alt: name });
}

function quoteBox(value, color = C.navy) {
  return panel(
    {
      name: "quote",
      width: fill,
      height: hug,
      fill: paint("#FFFDF8"),
      line: stroke(C.line),
      borderRadius: 18,
      padding: { x: 34, y: 28 },
    },
    t(value, { size: 34, bold: true, color, width: wrap(1180), lineHeight: 1.28 }),
  );
}

function miniMetric(value, label, color = C.amber) {
  return panel(
    {
      name: `metric-${label}`,
      width: fill,
      height: hug,
      fill: paint(C.white),
      line: stroke(C.line),
      borderRadius: 18,
      padding: { x: 22, y: 18 },
    },
    column({ width: fill, height: hug, gap: 8, align: "center" }, [
      t(value, { size: 60, bold: true, color }),
      t(label, { size: 22, bold: true, color: C.navy }),
    ]),
  );
}

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

// 1. Cover
{
  const slide = presentation.slides.add();
  stage(
    slide,
    grid(
      {
        name: "cover-grid",
        width: fill,
        height: fill,
        columns: [fr(0.96), fr(1.04)],
        columnGap: 62,
        padding: { x: 88, y: 72 },
      },
      [
        column({ width: fill, height: fill, gap: 30, justify: "center" }, [
          t("팀 활동 후 감사와 인정을 주고받는 게임", { size: 24, bold: true, color: C.amber }),
          t("팀 등불", { size: 106, bold: true, color: C.navy, width: wrap(780), lineHeight: 1 }),
          rule({ name: "cover-rule", width: fixed(180), stroke: C.amber, weight: 6 }),
          t("위트 있는 칭찬 문구로 고마웠던 행동을 말하고, 팀이 다음 활동에서도 사용할 행동을 고릅니다.", {
            size: 31,
            color: C.muted,
            width: wrap(760),
            lineHeight: 1.34,
          }),
          row({ width: fill, height: hug, gap: 14 }, [
            miniMetric("36", "등불카드", C.teal),
            miniMetric("36", "불빛카드", C.amber),
            miniMetric("15분", "권장 진행", C.rose),
          ]),
        ]),
        grid(
          {
            name: "cover-cards",
            width: fill,
            height: fill,
            columns: [fr(1), fr(1), fr(1)],
            rows: [fr(1), fr(1)],
            columnGap: 18,
            rowGap: 18,
          },
          [
            card(assets.listen01, "경청 카드", 430),
            card(assets.team02, "도움 카드", 430),
            card(assets.exec02, "책임 카드", 430),
            card(assets.team06, "분위기 카드", 430),
            card(assets.think01, "질문 카드", 430),
            card(assets.mood02, "웃음 카드", 430),
          ],
        ),
      ],
    ),
    C.paper,
  );
}

// 2. Components
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "팀 등불의 구성",
    "칭찬카드와 불빛카드만 있으면 됩니다",
    "불빛카드는 앞면을 보지 않고 개인이 마지막까지 가지고 갑니다.",
    grid(
      { name: "components", width: fill, height: grow(1), columns: [fr(1.1), fr(0.9), fr(0.75)], columnGap: 36 },
      [
        panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 18, padding: 24 },
          column({ width: fill, height: fill, gap: 16, align: "center" }, [
            card(assets.montage, "등불카드 전체", 520),
            t("등불카드 36장", { size: 29, bold: true, color: C.navy }),
            t("앞면은 호들갑 칭찬, 아래 문장은 행동 의미", { size: 21, color: C.muted }),
          ])),
        panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 18, padding: 24 },
          column({ width: fill, height: fill, gap: 16, align: "center" }, [
            card(assets.lightMontage, "불빛카드 전체", 520),
            t("불빛카드 36장", { size: 29, bold: true, color: C.navy }),
            t("등불 1개, 2개, 3개로 운영", { size: 21, color: C.muted }),
          ])),
        panel({ fill: paint(C.navy), borderRadius: 18, padding: { x: 28, y: 30 } },
          column({ width: fill, height: fill, gap: 18, justify: "center", align: "center" }, [
            row({ width: fill, height: hug, gap: 10, align: "center", justify: "center" }, [
              image({ name: "personal-back-1", path: assets.back, width: fixed(92), height: fixed(132), fit: "contain", alt: "보관 카드 1" }),
              image({ name: "personal-back-2", path: assets.back, width: fixed(92), height: fixed(132), fit: "contain", alt: "보관 카드 2" }),
            ]),
            t("개인 보관", { size: 32, bold: true, color: C.white }),
            t("앞면은 보지 않고\n마지막에 펼치기", { size: 24, color: "#E9D9B8", width: wrap(280), lineHeight: 1.25, style: { textAlign: "center" } }),
          ])),
      ],
    ),
  );
}

// 3. Video placeholder
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "진행 장면",
    "현장 시연 영상 또는 사진 삽입",
    "처음 설명할 때는 실제 장면 30초가 가장 빠릅니다.",
    grid({ name: "video-grid", width: fill, height: grow(1), columns: [fr(1.15), fr(0.85)], columnGap: 54 }, [
      panel(
        { fill: paint("#182C39"), borderRadius: 20, padding: 34 },
        column({ width: fill, height: fill, justify: "center", align: "center", gap: 24 }, [
          shape({ name: "play-circle", width: fixed(142), height: fixed(142), fill: paint(C.amber), borderRadius: "rounded-full" }),
          t("시연 영상 자리", { size: 52, bold: true, color: C.white, style: { textAlign: "center" } }),
          t("카드 건네기, 이유 말하기, 불빛카드 뽑기를 짧게 보여줍니다.", {
            size: 26,
            color: "#E9D9B8",
            width: wrap(820),
            style: { textAlign: "center" },
          }),
        ]),
      ),
      column({ width: fill, height: hug, gap: 20, justify: "center" }, [
        stepBox("1", "카드를 건넨다", "받는 사람의 부담을 낮추기 위해 뒤집어 건넵니다.", C.teal),
        stepBox("2", "이유를 말한다", "장면 하나만 말하면 충분합니다.", C.amber),
        stepBox("3", "불빛카드를 뽑는다", "앞면을 보지 않고 개인이 가지고 있습니다.", C.rose),
      ]),
    ]),
  );
}

// 4. Overview
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "팀 등불 진행 방식",
    "전체 흐름은 짧고 단순해야 합니다",
    "설명은 2분, 활동은 10분에서 15분이면 충분합니다.",
    grid({ name: "flow-grid", width: fill, height: grow(1), columns: [fr(1), fr(1), fr(1)], rows: [fr(1), fr(1)], columnGap: 22, rowGap: 22 }, [
      stepBox("1", "카드 5장 받기", "각자 고를 수 있는 문구를 손에 듭니다.", C.teal),
      stepBox("2", "오른쪽 사람에게 1장", "모두가 최소 1장을 받게 합니다.", C.amber),
      stepBox("3", "도움 받은 사람에게 1장", "방금 활동 장면을 떠올립니다.", C.green),
      stepBox("4", "받은 카드 중 1장 선택", "팀에 도움이 된 행동을 고릅니다.", C.rose),
      stepBox("5", "준 이유 15초", "길게 설명하지 않습니다.", C.teal),
      stepBox("6", "불빛카드 뽑고 보관", "앞면은 마지막에 펼칩니다.", C.amber),
    ]),
  );
}

// 5. Deal cards
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "각자 등불카드 5장씩 받기",
    "카드를 많이 쓰기보다 고를 수 있는 폭을 줍니다.",
    "강사는 카드가 부족하면 팀별로 섞어서 다시 나눠도 됩니다.",
    grid({ name: "deal", width: fill, height: grow(1), columns: [fr(1.1), fr(0.9)], columnGap: 58 }, [
      grid({ name: "five-cards", width: fill, height: fill, columns: [fr(1), fr(1), fr(1)], rows: [fr(1), fr(1)], columnGap: 16, rowGap: 16 }, [
        card(assets.back, "뒷면 1", 400),
        card(assets.back, "뒷면 2", 400),
        card(assets.back, "뒷면 3", 400),
        card(assets.back, "뒷면 4", 400),
        card(assets.back, "뒷면 5", 400),
        panel({ fill: paint(C.paleAmber), borderRadius: 18, padding: 24 },
          column({ width: fill, height: fill, justify: "center", align: "center", gap: 10 }, [
            t("5장", { size: 70, bold: true, color: C.navy }),
            t("각자 받기", { size: 27, bold: true, color: C.navy }),
          ])),
      ]),
      column({ width: fill, height: hug, gap: 24, justify: "center" }, [
        quoteBox("“마음에 드는 카드를 찾기보다,\n방금 활동에서 고마웠던 행동을 떠올려 주세요.”", C.navy),
        dotItem("문구가 과장돼도 괜찮습니다. 이유는 실제 장면으로 짧게 말합니다.", C.amber, 28),
        dotItem("카드를 고르는 시간은 1분을 넘기지 않습니다.", C.teal, 28),
      ]),
    ]),
  );
}

// 6. First card
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "첫 번째 카드는 오른쪽 사람에게",
    "모두가 최소 1장을 받도록 만드는 안전한 출발입니다.",
    "좋은 말이 특정 사람에게만 몰리지 않게 합니다.",
    grid({ name: "right-person", width: fill, height: grow(1), columns: [fr(1), fr(1)], columnGap: 54 }, [
      panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 20, padding: 40 },
        row({ width: fill, height: fill, gap: 34, align: "center", justify: "center" }, [
          column({ width: fixed(250), height: hug, align: "center", gap: 12 }, [
            shape({ width: fixed(140), height: fixed(140), fill: paint(C.paleGreen), borderRadius: "rounded-full" }),
            t("나", { size: 44, bold: true, color: C.navy, style: { textAlign: "center" } }),
          ]),
          t("→", { size: 80, bold: true, color: C.amber, width: fixed(80), style: { textAlign: "center" } }),
          column({ width: fixed(290), height: hug, align: "center", gap: 12 }, [
            shape({ width: fixed(140), height: fixed(140), fill: paint(C.paleAmber), borderRadius: "rounded-full" }),
            t("오른쪽 사람", { size: 38, bold: true, color: C.navy, style: { textAlign: "center" } }),
          ]),
        ])),
      column({ width: fill, height: hug, gap: 22, justify: "center" }, [
        card(assets.listen05, "첫 카드 예시", 520),
        t("첫 장은 고민하지 않고 오른쪽 사람에게 줍니다.", { size: 29, bold: true, color: C.navy }),
      ]),
    ]),
  );
}

// 7. Second card
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "두 번째 카드는 도움 받은 사람에게",
    "호감 평가보다 실제 장면을 떠올리게 합니다.",
    "말할 때는 ‘누가 어떤 행동을 해줘서 도움이 됐는가’만 잡으면 됩니다.",
    grid({ name: "second-card", width: fill, height: grow(1), columns: [fr(0.95), fr(1.05)], columnGap: 54 }, [
      card(assets.team02, "도움 카드 예시", 620),
      column({ width: fill, height: hug, gap: 22, justify: "center" }, [
        dotItem("의견을 연결해 준 사람", C.teal, 31),
        dotItem("말할 기회를 챙겨 준 사람", C.amber, 31),
        dotItem("먼저 움직여 팀을 시작하게 한 사람", C.green, 31),
        dotItem("분위기를 편하게 만든 사람", C.rose, 31),
        quoteBox("“누가 제일 잘했나”가 아니라\n“누가 내 참여를 쉽게 만들었나”를 고릅니다.", C.teal),
      ]),
    ]),
  );
}

// 8. Face down
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "카드는 뒤집어 건네기",
    "바로 공개하지 않으면 민망함이 줄고, 읽는 시간이 생깁니다.",
    "받은 사람은 카드를 모아 둔 뒤 한 번에 읽습니다.",
    grid({ name: "facedown", width: fill, height: grow(1), columns: [fr(1), fr(1)], columnGap: 54 }, [
      row({ width: fill, height: fill, gap: 22, align: "center", justify: "center" }, [
        card(assets.back, "뒷면 큰 카드", 620),
        card(assets.listen01, "경청 카드 작은 예시", 500),
      ]),
      column({ width: fill, height: hug, gap: 22, justify: "center" }, [
        stepBox("1", "뒤집어 건넨다", "앞면이 바로 보이지 않게 둡니다.", C.teal),
        stepBox("2", "받은 사람 앞에 둔다", "누가 줬는지 기억할 수 있게 둡니다.", C.amber),
        stepBox("3", "강사의 신호 후 읽는다", "팀 전체가 함께 읽기 시작합니다.", C.rose),
      ]),
    ]),
  );
}

// 9. Choose one
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "받은 카드 중 한 장 고르기",
    "선택은 인기투표가 아니라 다음 활동에 사용할 행동을 고르는 과정입니다.",
    "선택하지 않은 카드는 실패가 아니라 개인에게 전해진 감사입니다.",
    grid({ name: "choose", width: fill, height: grow(1), columns: [fr(1.15), fr(0.85)], columnGap: 50 }, [
      row({ width: fill, height: fill, gap: 16, align: "center" }, [
        card(assets.listen02, "리액션 카드", 580),
        card(assets.team06, "분위기 카드", 620),
        card(assets.exec02, "책임 카드", 580),
      ]),
      column({ width: fill, height: hug, gap: 24, justify: "center" }, [
        quoteBox("“다음 활동에서도 이 행동이 있으면 좋겠다”\n싶은 카드를 한 장 고릅니다.", C.navy),
        dotItem("고른 카드는 앞면이 보이게 둡니다.", C.amber, 28),
        dotItem("다른 카드는 개인이 가져가도 됩니다.", C.teal, 28),
      ]),
    ]),
  );
}

// 10. Reason
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "준 사람은 이유를 15초 안에 말하기",
    "긴 칭찬보다 한 장면이 더 잘 전달됩니다.",
    "강사는 이유 말하기가 길어지지 않게 리듬을 잡아 줍니다.",
    grid({ name: "reason", width: fill, height: grow(1), columns: [fr(0.88), fr(1.12)], columnGap: 52 }, [
      card(assets.think01, "질문 카드", 620),
      column({ width: fill, height: hug, gap: 24, justify: "center" }, [
        quoteBox("“제가 이 문구를 드린 이유는...”", C.amber),
        panel({ fill: paint(C.paleGreen), borderRadius: 18, padding: 26 },
          column({ width: fill, height: hug, gap: 16 }, [
            t("좋은 이유 말하기", { size: 31, bold: true, color: C.navy }),
            dotItem("어떤 행동이 있었는지 말합니다.", C.teal, 27),
            dotItem("그 행동이 나나 팀에 준 도움을 말합니다.", C.teal, 27),
            dotItem("15초 안에 마칩니다.", C.teal, 27),
          ])),
      ]),
    ]),
  );
}

// 11. Receive
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "받는 사람은 짧게 받기",
    "좋은 말을 받는 연습도 이 게임의 일부입니다.",
    "멋진 답을 준비하지 않아도 되게 안내합니다.",
    grid({ name: "receive", width: fill, height: grow(1), columns: [fr(1), fr(1)], columnGap: 48 }, [
      column({ width: fill, height: hug, gap: 26, justify: "center" }, [
        quoteBox("“고맙습니다. 받겠습니다.”", C.navy),
        quoteBox("“다음 활동에서 이 행동을 이어가겠습니다.”", C.teal),
      ]),
      panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 20, padding: 34 },
        column({ width: fill, height: fill, gap: 22, justify: "center" }, [
          t("강사 운영 포인트", { size: 37, bold: true, color: C.navy }),
          dotItem("받은 사람에게 긴 소감을 요구하지 않습니다.", C.amber, 29),
          dotItem("웃어넘기는 반응도 자연스럽게 받아 줍니다.", C.teal, 29),
          dotItem("말이 길어지면 다음 사람으로 부드럽게 넘깁니다.", C.rose, 29),
        ])),
    ]),
  );
}

// 12. Draw light card
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "선택된 카드를 준 사람이 불빛카드 뽑기",
    "보상은 받은 사람이 아니라 좋은 행동을 말로 전한 사람에게 갑니다.",
    "앞면을 보지 않고 개인이 가지고 있다가 마지막에 공개합니다.",
    grid({ name: "draw-light", width: fill, height: grow(1), columns: [fr(1.1), fr(0.9)], columnGap: 50 }, [
      row({ width: fill, height: fill, gap: 18, align: "center", justify: "center" }, [
        card(assets.light01, "작은 불빛", 560),
        card(assets.light02, "따뜻한 불빛", 620),
        card(assets.light03, "환한 불빛", 560),
      ]),
      column({ width: fill, height: hug, gap: 22, justify: "center" }, [
        stepBox("1", "선택된 카드 확인", "누가 준 카드인지 확인합니다.", C.teal),
        stepBox("2", "준 사람이 1장 뽑기", "불빛카드는 뒷면으로 섞어 둡니다.", C.amber),
        stepBox("3", "개인이 뒤집어 보관", "진행 중에는 앞면을 보지 않습니다.", C.rose),
      ]),
    ]),
  );
}

// 13. Personal reveal
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "불빛카드는 개인이 끝까지 뒤집어 보관하기",
    "점수판 없이 마지막 공개 순간을 살립니다.",
    "진행 중에는 활동과 대화에 집중하고 결과는 나중에 만납니다.",
    grid({ name: "personal-reveal", width: fill, height: grow(1), columns: [fr(0.95), fr(1.05)], columnGap: 54 }, [
      panel({ fill: paint(C.navy), borderRadius: 24, padding: { x: 42, y: 42 } },
        column({ width: fill, height: fill, gap: 22, justify: "center", align: "center" }, [
          t("MY LIGHT\nCARDS", { size: 76, bold: true, color: C.gold, width: wrap(540), lineHeight: 0.98, style: { textAlign: "center" } }),
          rule({ width: fixed(190), stroke: C.gold, weight: 5 }),
          row({ width: fill, height: hug, gap: 14, align: "center", justify: "center" }, [
            image({ name: "hidden-light-1", path: assets.back, width: fixed(140), height: fixed(200), fit: "contain", alt: "비공개 카드 1" }),
            image({ name: "hidden-light-2", path: assets.back, width: fixed(140), height: fixed(200), fit: "contain", alt: "비공개 카드 2" }),
            image({ name: "hidden-light-3", path: assets.back, width: fixed(140), height: fixed(200), fit: "contain", alt: "비공개 카드 3" }),
          ]),
          t("앞면은 마지막까지 보지 않습니다", { size: 28, bold: true, color: C.white, style: { textAlign: "center" } }),
        ])),
      column({ width: fill, height: hug, gap: 24, justify: "center" }, [
        dotItem("불빛카드를 뽑은 사람은 자기 앞에 뒤집어 둡니다.", C.amber, 31),
        dotItem("진행 중에는 카드 수만 보이고, 등불 개수는 보이지 않습니다.", C.teal, 31),
        dotItem("마지막에 모두가 동시에 앞면을 펼칩니다.", C.rose, 31),
        quoteBox("“지금은 보지 않습니다.\n마지막에 한 번에 펼쳐야 재미가 납니다.”", C.navy),
      ]),
    ]),
  );
}

// 14. Scoring
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "불빛카드 등불 개수 안내",
    "숫자보다 등불 개수로 바로 알 수 있게 만듭니다.",
    "마지막에 펼치면 누가 더 환한지 눈으로 바로 비교됩니다.",
    grid({ name: "score", width: fill, height: grow(1), columns: [fr(1), fr(1), fr(1)], columnGap: 26 }, [
      panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 20, padding: 24 },
        column({ width: fill, height: fill, gap: 14, align: "center" }, [
          card(assets.light01, "등불 1개 카드", 500),
          t("작은 불빛", { size: 32, bold: true, color: C.navy }),
          t("등불 1개 · 18장", { size: 28, bold: true, color: C.amber }),
        ])),
      panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 20, padding: 24 },
        column({ width: fill, height: fill, gap: 14, align: "center" }, [
          card(assets.light02, "등불 2개 카드", 500),
          t("따뜻한 불빛", { size: 32, bold: true, color: C.navy }),
          t("등불 2개 · 12장", { size: 28, bold: true, color: C.amber }),
        ])),
      panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 20, padding: 24 },
        column({ width: fill, height: fill, gap: 14, align: "center" }, [
          card(assets.light03, "등불 3개 카드", 500),
          t("환한 불빛", { size: 32, bold: true, color: C.navy }),
          t("등불 3개 · 6장", { size: 28, bold: true, color: C.amber }),
        ])),
    ]),
  );
}

// 15. Reason examples
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "좋은 이유 말하기와 약한 이유 말하기",
    "문구는 웃겨도 이유는 실제 행동으로 말합니다.",
    "강사는 참여자가 장면을 말하도록 짧게 도와줍니다.",
    grid({ name: "good-reason", width: fill, height: grow(1), columns: [fr(1), fr(1)], columnGap: 40 }, [
      panel({ fill: paint(C.paleRose), borderRadius: 20, padding: 34 },
        column({ width: fill, height: hug, gap: 22 }, [
          t("약한 이유", { size: 42, bold: true, color: C.rose }),
          dotItem("그냥 좋은 분 같아서요.", C.rose, 31),
          dotItem("성격이 좋아 보여서요.", C.rose, 31),
          dotItem("잘하셔서 드렸습니다.", C.rose, 31),
        ])),
      panel({ fill: paint(C.paleGreen), borderRadius: 20, padding: 34 },
        column({ width: fill, height: hug, gap: 22 }, [
          t("현장에서 쓰기 좋은 이유", { size: 42, bold: true, color: C.teal }),
          dotItem("제가 말할 때 고개를 끄덕여 주셔서 계속 말할 수 있었습니다.", C.teal, 28),
          dotItem("흩어진 의견을 한 문장으로 정리해 주셔서 팀이 바로 움직였습니다.", C.teal, 28),
          dotItem("역할이 애매할 때 먼저 맡아 주셔서 시간이 줄었습니다.", C.teal, 28),
        ])),
    ]),
  );
}

// 16. Card tone
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "카드 문구의 톤",
    "앞면은 호들갑, 아래 설명은 행동 중심입니다.",
    "이 조합이 있어야 게임은 가볍고 학습은 분명해집니다.",
    grid({ name: "tone", width: fill, height: grow(1), columns: [fr(1.05), fr(0.95)], columnGap: 48 }, [
      row({ width: fill, height: fill, gap: 18, align: "center" }, [
        card(assets.listen01, "경청 카드 최신", 620),
        card(assets.team02, "도움 카드 최신", 620),
      ]),
      column({ width: fill, height: hug, gap: 24, justify: "center" }, [
        panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 18, padding: 28 },
          column({ width: fill, height: hug, gap: 12 }, [
            t("앞면 문구", { size: 34, bold: true, color: C.amber }),
            t("받는 사람이 웃으면서 받을 수 있게 과감하게 씁니다.", { size: 28, color: C.ink }),
          ])),
        panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 18, padding: 28 },
          column({ width: fill, height: hug, gap: 12 }, [
            t("아래 설명", { size: 34, bold: true, color: C.teal }),
            t("그 말이 어떤 행동, 태도, 참여 방식인지 짧게 잡아 줍니다.", { size: 28, color: C.ink }),
          ])),
        quoteBox("웃겨야 건네기 쉽고,\n행동이 있어야 교육이 됩니다.", C.navy),
      ]),
    ]),
  );
}

// 17. Closing reflection
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "마지막 성찰",
    "우리 팀이 다음 활동에서도 사용할 행동 한 가지",
    "불빛을 공개한 뒤 행동 한 가지로 마무리합니다.",
    grid({ name: "reflection", width: fill, height: grow(1), columns: [fr(1), fr(1)], columnGap: 48 }, [
      column({ width: fill, height: hug, gap: 24, justify: "center" }, [
        quoteBox("“오늘 우리 팀을 움직이게 한 행동 하나를 고른다면 무엇입니까?”", C.navy),
        quoteBox("“그 행동을 다음 활동에서 어떻게 다시 사용하겠습니까?”", C.teal),
      ]),
      panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 22, padding: 36 },
        column({ width: fill, height: fill, gap: 22, justify: "center" }, [
          t("팀 행동 문장 예시", { size: 40, bold: true, color: C.navy }),
          dotItem("회의가 길어질 때 한 사람이 중간 정리를 한다.", C.amber, 29),
          dotItem("말이 적은 사람에게 먼저 선택권을 준다.", C.teal, 29),
          dotItem("역할이 비면 먼저 작은 일을 맡는다.", C.green, 29),
        ])),
    ]),
  );
}

// 18. Effects
{
  const slide = presentation.slides.add();
  normalSlide(
    slide,
    "팀 등불의 교육 효과",
    "좋은 말을 주고받는 활동에서 끝나지 않게 합니다.",
    "감사와 인정은 팀이 반복할 행동을 찾는 언어입니다.",
    grid({ name: "effects", width: fill, height: grow(1), columns: [fr(1), fr(1), fr(1)], columnGap: 28 }, [
      panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 22, padding: 34 },
        column({ width: fill, height: fill, gap: 20, justify: "center", align: "center" }, [
          shape({ width: fixed(94), height: fixed(94), fill: paint(C.paleAmber), borderRadius: "rounded-full" }),
          t("도움 행동을\n말로 만든다", { size: 38, bold: true, color: C.navy, width: wrap(420), style: { textAlign: "center" } }),
          t("고마웠던 장면을 구체적인 언어로 바꿉니다.", { size: 24, color: C.muted, width: wrap(420), style: { textAlign: "center" } }),
        ])),
      panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 22, padding: 34 },
        column({ width: fill, height: fill, gap: 20, justify: "center", align: "center" }, [
          shape({ width: fixed(94), height: fixed(94), fill: paint(C.paleGreen), borderRadius: "rounded-full" }),
          t("말하기 부담을\n낮춘다", { size: 38, bold: true, color: C.navy, width: wrap(420), style: { textAlign: "center" } }),
          t("좋은 말은 짧게, 이유는 한 장면만 말하게 합니다.", { size: 24, color: C.muted, width: wrap(420), style: { textAlign: "center" } }),
        ])),
      panel({ fill: paint(C.white), line: stroke(C.line), borderRadius: 22, padding: 34 },
        column({ width: fill, height: fill, gap: 20, justify: "center", align: "center" }, [
          shape({ width: fixed(94), height: fixed(94), fill: paint(C.paleRose), borderRadius: "rounded-full" }),
          t("다음 행동으로\n이어간다", { size: 38, bold: true, color: C.navy, width: wrap(420), style: { textAlign: "center" } }),
          t("팀이 계속 사용할 행동을 마지막에 한 문장으로 정리합니다.", { size: 24, color: C.muted, width: wrap(420), style: { textAlign: "center" } }),
        ])),
    ]),
  );
}

// 19. Closing script
{
  const slide = presentation.slides.add();
  stage(
    slide,
    grid(
      {
        name: "closing-grid",
        width: fill,
        height: fill,
        columns: [fr(1), fr(1)],
        columnGap: 58,
        padding: { x: 90, y: 70 },
      },
      [
        column({ width: fill, height: fill, gap: 28, justify: "center" }, [
          t("강사용 마무리 멘트", { size: 25, bold: true, color: C.amber }),
          t("감사와 인정은\n행동을 반복하게 하는 언어입니다", {
            size: 72,
            bold: true,
            color: C.navy,
            width: wrap(820),
            lineHeight: 1.08,
          }),
          rule({ width: fixed(180), stroke: C.amber, weight: 6 }),
          t("좋은 말은 사람을 기분 좋게 만들고, 좋은 이유는 팀이 다시 사용할 행동을 알려줍니다.", {
            size: 31,
            color: C.muted,
            width: wrap(780),
            lineHeight: 1.32,
          }),
        ]),
        column({ width: fill, height: fill, gap: 24, justify: "center" }, [
          quoteBox("“오늘 받은 카드 중 하나를 골라,\n다음 현장에서 사용할 행동으로 바꿔 보겠습니다.”", C.navy),
          quoteBox("“우리 팀은 다음 활동에서 이 행동을 다시 사용하겠습니다.”", C.teal),
          row({ width: fill, height: hug, gap: 18 }, [
            card(assets.light02, "마무리 불빛카드", 300),
            card(assets.back, "마무리 뒷면", 300),
          ]),
        ]),
      ],
    ),
    C.paper,
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

await fs.rm(RENDER_DIR, { recursive: true, force: true });
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
