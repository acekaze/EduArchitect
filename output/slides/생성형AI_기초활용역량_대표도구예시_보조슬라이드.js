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
pptx.subject = "생성형 AI 기초활용역량 대표 도구 소개 슬라이드";
pptx.title = "생성형 AI 기초활용역량 대표 도구 소개";
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
  white: "FFFFFF",
  blueSoft: "EEF4FE",
  greenSoft: "EEF6EA",
  sandSoft: "F9EFE5",
  coralSoft: "F8EBE6",
  gold: "B88A3A",
  blue: "4472C4",
  green: "70AD47",
  coral: "ED7D31",
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
  slide.addText("대표 도구 예시", {
    x: 0.78,
    y: 0.26,
    w: 2.8,
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
    fontFace: FONT_FAMILY,
    fontSize: 10,
    bold: true,
    align: "right",
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

function addTitle(slide, title, subtitle) {
  slide.addText(
    title,
    textOpts(title, 0.92, 0.82, 10.4, 0.74, {
      fontSize: 27,
      minFontSize: 22,
      maxFontSize: 29,
      bold: true,
      color: C.ink,
    })
  );
  slide.addText(
    subtitle,
    textOpts(subtitle, 0.94, 1.72, 10.4, 0.32, {
      fontSize: 13.2,
      minFontSize: 11,
      maxFontSize: 14,
      color: C.inkSoft,
    })
  );
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
    x: cfg.x + 0.16,
    y: cfg.y + 0.14,
    w: cfg.w - 0.32,
    h: 0.14,
    fontFace: FONT_FAMILY,
    fontSize: 8.8,
    bold: true,
    color: cfg.color || C.blue,
    margin: 0,
  });
  slide.addText(
    cfg.title,
    textOpts(cfg.title, cfg.x + 0.16, cfg.y + 0.34, cfg.w - 0.32, 0.44, {
      fontSize: 15,
      minFontSize: 12,
      maxFontSize: 16,
      bold: true,
      color: C.ink,
    })
  );
  slide.addText(
    cfg.body,
    textOpts(cfg.body, cfg.x + 0.16, cfg.y + 0.88, cfg.w - 0.32, cfg.h - 1.0, {
      fontSize: 11.2,
      minFontSize: 9.2,
      maxFontSize: 11.5,
      color: C.ink,
    })
  );
}

function buildSlide() {
  const slide = pptx.addSlide();
  addBase(slide);
  addTitle(
    slide,
    "대표 도구는 이 정도만 알고 있으면 충분하다",
    "툴을 외우기보다, 어떤 목적에 어떤 도구가 대표적인지 감을 잡는 슬라이드"
  );

  const tools = [
    ["범용 LLM", "ChatGPT / Claude / Gemini", "생각 열기\n초안\n질문 설계", C.blueSoft, C.blue],
    ["소스 기반", "NotebookLM / LilysAI", "자료 이해\n비교\n요약보다 검토", C.bgAlt, C.navy],
    ["딥리서치", "ChatGPT Deep Research / Gemini Deep Research", "외부 흐름 조사\n보고서형 리서치", C.sandSoft, C.gold],
    ["워크스페이스", "Microsoft 365 Copilot / Notion AI / Canva AI", "일하는 공간 안에서\n검색·정리·협업", C.greenSoft, C.green],
    ["발표 / UI 생성", "Gamma / Genspark / Stitch", "덱 초안\n슬라이드 구조\n화면 시안", C.coralSoft, C.coral],
    ["이미지 / 영상", "Midjourney / Seedance", "비주얼 무드\n영상 데모\n표현 수단", C.bgAlt, C.navy],
  ];

  tools.forEach((item, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    addCard(slide, {
      x: 0.98 + col * 3.95,
      y: 2.18 + row * 1.88,
      w: 3.55,
      h: 1.58,
      kicker: item[0],
      title: item[1],
      body: item[2],
      fill: item[3],
      color: item[4],
      shadow: false,
    });
  });

  slide.addText(
    "핵심은 ‘어떤 툴이 최고인가’보다, ‘지금 내 목적에 어떤 이동수단이 가장 맞는가’를 판단하는 것이다.",
    textOpts("핵심은 ‘어떤 툴이 최고인가’보다, ‘지금 내 목적에 어떤 이동수단이 가장 맞는가’를 판단하는 것이다.", 0.98, 6.02, 11.0, 0.24, {
      fontSize: 12.5,
      minFontSize: 11,
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
    "생성형AI_기초활용역량_대표도구예시_보조슬라이드.pptx"
  );
  await pptx.writeFile({ fileName: outputFile });
  console.log(`Wrote deck to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
