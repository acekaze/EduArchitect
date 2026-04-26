"use strict";

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { FontLibrary } = require("skia-canvas");

const FONT_FAMILY = "Pretendard Variable";
const FONT_PATH = path.join(
  __dirname,
  "fonts",
  "pretendard",
  "public",
  "variable",
  "PretendardVariable.ttf"
);

FontLibrary.use(FONT_FAMILY, [FONT_PATH]);

const { autoFontSize } = require("./pptxgenjs_helpers/text");
const { safeOuterShadow } = require("./pptxgenjs_helpers/util");
const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require("./pptxgenjs_helpers/layout");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "OpenAI Codex";
pptx.company = "전종목";
pptx.subject = "생성형 AI 기초활용역량 3단계 트렌드 슬라이드";
pptx.title = "프롬프트-컨텍스트-하네스 엔지니어링";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: FONT_FAMILY,
  bodyFontFace: FONT_FAMILY,
  lang: "ko-KR",
};

const C = {
  bg: "F7F5F0",
  bgAlt: "FFFFFF",
  ink: "1F2B37",
  inkSoft: "637181",
  navy: "1E3B52",
  line: "D7D2C8",
  blueSoft: "EEF4FE",
  greenSoft: "EEF6EA",
  warmSoft: "F9EFE5",
  gold: "B88A3A",
  blue: "4472C4",
  green: "70AD47",
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function textOpts(text, x, y, w, h, extra = {}) {
  const fit = autoFontSize(text, FONT_FAMILY, {
    x,
    y,
    w,
    h,
    fontSize: extra.fontSize || 20,
    minFontSize: extra.minFontSize || 10,
    maxFontSize: extra.maxFontSize || extra.fontSize || 24,
    mode: "auto",
    margin: extra.margin !== undefined ? extra.margin : 0,
    breakLine: false,
    valign: extra.valign || "top",
    align: extra.align || "left",
    color: extra.color || C.ink,
    bold: extra.bold || false,
    italic: extra.italic || false,
    paraSpaceAfter: extra.paraSpaceAfter || 0,
  });
  return { ...fit, ...extra };
}

function addBase(slide) {
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.08,
    line: { color: C.navy, transparency: 100 },
    fill: { color: C.navy },
  });
  slide.addText("기술 / 트렌드 3단계", {
    x: 0.78,
    y: 0.26,
    w: 3.2,
    h: 0.16,
    fontFace: FONT_FAMILY,
    fontSize: 10,
    bold: true,
    color: C.blue,
    margin: 0,
  });
  slide.addText("01", {
    x: 12.0,
    y: 0.24,
    w: 0.5,
    h: 0.16,
    align: "right",
    fontFace: FONT_FAMILY,
    fontSize: 10,
    bold: true,
    color: C.inkSoft,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.76,
    y: 6.95,
    w: 11.86,
    h: 0,
    line: { color: C.line, width: 1 },
  });
}

function addCard(slide, cfg) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: cfg.h,
    rectRadius: 0.08,
    line: { color: C.line, width: 1 },
    fill: { color: cfg.fill || C.bgAlt },
    shadow: cfg.shadow === false ? undefined : safeOuterShadow("20303C", 0.05, 45, 1, 1),
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: 0.1,
    line: { color: cfg.color || C.navy, transparency: 100 },
    fill: { color: cfg.color || C.navy },
  });
  slide.addText(cfg.kicker, {
    x: cfg.x + 0.18,
    y: cfg.y + 0.16,
    w: cfg.w - 0.36,
    h: 0.14,
    fontFace: FONT_FAMILY,
    fontSize: 8.8,
    bold: true,
    color: cfg.color || C.blue,
    margin: 0,
  });
  slide.addText(
    cfg.title,
    textOpts(cfg.title, cfg.x + 0.18, cfg.y + 0.34, cfg.w - 0.36, 0.72, {
      fontSize: cfg.titleSize || 20,
      minFontSize: 15,
      maxFontSize: cfg.titleSize || 20,
      bold: true,
      color: C.ink,
    })
  );
  slide.addText(
    cfg.body,
    textOpts(cfg.body, cfg.x + 0.18, cfg.y + 1.18, cfg.w - 0.36, cfg.h - 1.32, {
      fontSize: cfg.bodySize || 12.2,
      minFontSize: 10,
      maxFontSize: cfg.bodySize || 12.2,
      color: C.ink,
    })
  );
}

function buildSlide() {
  const slide = pptx.addSlide();
  addBase(slide);

  slide.addText(
    "기술과 트렌드는\n프롬프트에서 컨텍스트를 거쳐 하네스로 간다",
    textOpts("기술과 트렌드는\n프롬프트에서 컨텍스트를 거쳐 하네스로 간다", 0.94, 0.92, 7.4, 0.98, {
      fontSize: 28,
      minFontSize: 22,
      maxFontSize: 30,
      bold: true,
      color: C.ink,
    })
  );
  slide.addText(
    "좋은 답을 뽑는 기술에서, 더 맞는 맥락을 설계하고, 결국 더 나은 실행 시스템을 묶는 방향으로 이동하고 있다.",
    textOpts("좋은 답을 뽑는 기술에서, 더 맞는 맥락을 설계하고, 결국 더 나은 실행 시스템을 묶는 방향으로 이동하고 있다.", 0.96, 2.02, 10.8, 0.34, {
      fontSize: 13.5,
      minFontSize: 11,
      maxFontSize: 14,
      color: C.inkSoft,
    })
  );

  const cards = [
    {
      x: 0.98, y: 2.58, w: 3.6, h: 3.36,
      kicker: "1단계",
      title: "프롬프트 엔지니어링",
      body: "좋은 질문 문장을 만드는 단계\n\n- 더 나은 답을 뽑기\n- 역할과 형식 정하기\n- 표현을 다듬기",
      fill: C.blueSoft,
      color: C.blue,
    },
    {
      x: 4.88, y: 2.58, w: 3.6, h: 3.36,
      kicker: "2단계",
      title: "컨텍스트 엔지니어링",
      body: "더 맞는 맥락을 설계하는 단계\n\n- 자료와 메모리 붙이기\n- 청자와 제약 반영하기\n- 일관된 기준 만들기",
      fill: C.warmSoft,
      color: C.gold,
    },
    {
      x: 8.78, y: 2.58, w: 3.6, h: 3.36,
      kicker: "3단계",
      title: "하네스 엔지니어링",
      body: "도구와 흐름을 묶어 실제 업무 시스템으로 만드는 단계\n\n- 여러 도구 연결하기\n- 검증과 승인 넣기\n- 실행 루프 설계하기",
      fill: C.greenSoft,
      color: C.green,
    },
  ];

  cards.forEach((card) => addCard(slide, card));

  slide.addShape(pptx.ShapeType.chevron, {
    x: 4.54, y: 4.02, w: 0.18, h: 0.3,
    line: { color: C.gold, transparency: 100 },
    fill: { color: C.gold },
  });
  slide.addShape(pptx.ShapeType.chevron, {
    x: 8.44, y: 4.02, w: 0.18, h: 0.3,
    line: { color: C.gold, transparency: 100 },
    fill: { color: C.gold },
  });

  slide.addText(
    "핵심은 ‘프롬프트를 잘 쓰는 것’에서 멈추지 않고,\n‘맥락을 설계하고, 실행 시스템까지 묶는 것’으로 가는 흐름을 이해하는 것이다.",
    textOpts("핵심은 ‘프롬프트를 잘 쓰는 것’에서 멈추지 않고,\n‘맥락을 설계하고, 실행 시스템까지 묶는 것’으로 가는 흐름을 이해하는 것이다.", 1.0, 6.12, 11.2, 0.42, {
      fontSize: 12.4,
      minFontSize: 10.8,
      maxFontSize: 13,
      italic: true,
      color: C.inkSoft,
      align: "center",
    })
  );

  warnIfSlideHasOverlaps(slide, pptx, {
    muteContainment: true,
    ignoreDecorativeShapes: true,
  });
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

async function main() {
  ensureDir(path.join(__dirname, "output"));
  buildSlide();
  const outputFile = path.join(
    __dirname,
    "output",
    "생성형AI_기초활용역량_기술트렌드3단계_보조슬라이드.pptx"
  );
  await pptx.writeFile({ fileName: outputFile });
  console.log(`Wrote deck to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
