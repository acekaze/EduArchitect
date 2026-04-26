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
pptx.subject = "생성형 AI 기초활용역량 프롬프트 치트시트";
pptx.title = "생성형 AI 기초활용역량 프롬프트 치트시트";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: FONT_FAMILY,
  bodyFontFace: FONT_FAMILY,
  lang: "ko-KR",
};

const C = {
  bg: "F7F5F0",
  white: "FFFFFF",
  ink: "1F2B37",
  inkSoft: "637181",
  navy: "1E3B52",
  blue: "4472C4",
  gold: "B88A3A",
  green: "70AD47",
  orange: "ED7D31",
  line: "D7D2C8",
  blueSoft: "EEF4FE",
  greenSoft: "EEF6EA",
  warmSoft: "F9EFE5",
  coralSoft: "F8EBE6",
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
    fontSize: extra.fontSize || 16,
    minFontSize: extra.minFontSize || 9,
    maxFontSize: extra.maxFontSize || extra.fontSize || 20,
    mode: "auto",
    margin: extra.margin !== undefined ? extra.margin : 0,
    breakLine: false,
    valign: extra.valign || "top",
    align: extra.align || "left",
    color: extra.color || C.ink,
    bold: extra.bold || false,
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
  slide.addText("생성형 AI 기초활용역량", {
    x: 0.78,
    y: 0.24,
    w: 3.2,
    h: 0.16,
    fontFace: FONT_FAMILY,
    fontSize: 10,
    bold: true,
    color: C.blue,
    margin: 0,
  });
  slide.addText("Prompt Cheatsheet", {
    x: 10.5,
    y: 0.24,
    w: 2.0,
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
    line: { color: cfg.line || C.line, width: 1 },
    fill: { color: cfg.fill || C.white },
    shadow: cfg.shadow === false ? undefined : safeOuterShadow("20303C", 0.05, 45, 1, 1),
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: 0.1,
    line: { color: cfg.stripColor || C.navy, transparency: 100 },
    fill: { color: cfg.stripColor || C.navy },
  });
  slide.addText(cfg.kicker, {
    x: cfg.x + 0.16,
    y: cfg.y + 0.14,
    w: cfg.w - 0.32,
    h: 0.14,
    fontFace: FONT_FAMILY,
    fontSize: 8.6,
    bold: true,
    color: cfg.kickerColor || cfg.stripColor || C.blue,
    margin: 0,
  });
  slide.addText(
    cfg.title,
    textOpts(cfg.title, cfg.x + 0.16, cfg.y + 0.34, cfg.w - 0.32, cfg.titleH || 0.36, {
      fontSize: cfg.titleSize || 15.5,
      minFontSize: 11,
      maxFontSize: cfg.titleSize || 15.5,
      bold: true,
      color: C.ink,
    })
  );
  if (cfg.body) {
    slide.addText(
      cfg.body,
      textOpts(cfg.body, cfg.x + 0.16, cfg.y + (cfg.bodyY || 0.78), cfg.w - 0.32, cfg.h - (cfg.bodyY || 0.78) - 0.14, {
        fontSize: cfg.bodySize || 10.4,
        minFontSize: 8.6,
        maxFontSize: cfg.bodySize || 10.4,
        color: cfg.bodyColor || C.ink,
      })
    );
  }
}

function addPromptBlock(slide, cfg) {
  addCard(slide, cfg);
}

function addBulletList(slide, items, x, y, w, h, color = C.ink, size = 10.1) {
  const runs = items.map((item) => ({
    text: item,
    options: {
      bullet: { indent: 12 },
      hanging: 3,
      paraSpaceAfter: 5,
      color,
      fontFace: FONT_FAMILY,
      fontSize: size,
    },
  }));
  slide.addText(runs, {
    x,
    y,
    w,
    h,
    margin: 0,
    valign: "top",
    fontFace: FONT_FAMILY,
  });
}

function buildSlide() {
  const slide = pptx.addSlide();
  addBase(slide);

  slide.addText(
    "프롬프트 치트시트",
    textOpts("프롬프트 치트시트", 0.96, 0.9, 3.5, 0.38, {
      fontSize: 24,
      minFontSize: 20,
      maxFontSize: 25,
      bold: true,
      color: C.ink,
    })
  );
  slide.addText(
    "AI에게 바로 답을 달라고 하지 말고, 먼저 질문하게 하라.",
    textOpts("AI에게 바로 답을 달라고 하지 말고, 먼저 질문하게 하라.", 4.95, 1.0, 6.8, 0.24, {
      fontSize: 13.2,
      minFontSize: 11,
      maxFontSize: 14,
      italic: true,
      color: C.inkSoft,
      align: "right",
    })
  );

  // Row 1
  addPromptBlock(slide, {
    x: 0.96, y: 1.45, w: 4.0, h: 1.75,
    kicker: "1. 인터뷰형 시작",
    stripColor: C.blue,
    fill: C.blueSoft,
    title: "바로 답하지 말고,\n먼저 질문해줘",
    titleSize: 16,
    titleH: 0.56,
    body:
      "지금 바로 답하지 말고, 내가 진짜 무엇을 하려는지 더 정확히 파악할 수 있도록 먼저 5개의 질문을 해줘.\n특히 목적, 청자, 제약조건, 절대 놓치면 안 되는 기준을 확인해줘.",
    bodySize: 10.0,
    bodyY: 0.9,
  });

  addPromptBlock(slide, {
    x: 5.16, y: 1.45, w: 4.0, h: 1.75,
    kicker: "2. 목적 찾기",
    stripColor: C.gold,
    fill: C.warmSoft,
    title: "원하는 결과는\n질문을 쪼개야 보인다",
    titleSize: 15.2,
    titleH: 0.56,
    body:
      "지금 하려는 일을 더 정확히 정의하고 싶다. 바로 해결책을 주지 말고,\n장면 -> 번거로움 -> 변화 -> 중요성 -> 성과 -> 인정 -> 진짜 결과 순서로 질문해줘.",
    bodySize: 9.8,
    bodyY: 0.9,
  });

  addPromptBlock(slide, {
    x: 9.36, y: 1.45, w: 3.0, h: 1.75,
    kicker: "3. CRAFTO 점검",
    stripColor: C.green,
    fill: C.greenSoft,
    title: "빠진 맥락이 있으면\n먼저 질문해줘",
    titleSize: 14.2,
    titleH: 0.56,
    body:
      "Context · Role · Audience · Format · Tone · Option 기준으로 내 질문을 점검해줘.",
    bodySize: 9.8,
    bodyY: 0.92,
  });

  // Row 2
  addPromptBlock(slide, {
    x: 0.96, y: 3.42, w: 4.0, h: 1.75,
    kicker: "4. 1-3-1로 끝내기",
    stripColor: C.orange,
    fill: C.coralSoft,
    title: "많이 만드는 것보다,\n줄이고 끝내기",
    titleSize: 15.4,
    titleH: 0.56,
    body:
      "문제 1개 -> 대안 3개 -> 권고안 1개로 정리해줘.\n마지막에는 내가 직접 다시 판단해야 할 쟁점도 말해줘.",
    bodySize: 9.8,
    bodyY: 0.9,
  });

  addPromptBlock(slide, {
    x: 5.16, y: 3.42, w: 4.0, h: 1.75,
    kicker: "5. 피드백 루프",
    stripColor: C.navy,
    fill: C.white,
    title: "초안 다음에는\n점검이 들어가야 한다",
    titleSize: 15.2,
    titleH: 0.56,
    body:
      "메타인지, 레드팀, 심사위원, 전문가 관점에서 먼저 점검해줘.\n마지막에는 내가 직접 다시 판단해야 할 쟁점을 한 줄로 정리해줘.",
    bodySize: 9.7,
    bodyY: 0.9,
  });

  addPromptBlock(slide, {
    x: 9.36, y: 3.42, w: 3.0, h: 1.75,
    kicker: "도구 선택 기준",
    stripColor: C.gold,
    fill: C.warmSoft,
    title: "좋은 툴보다\n좋은 길 설계",
    titleSize: 14.2,
    titleH: 0.56,
    body:
      "LLM: 생각 열기\n소스 기반 AI: 자료 검토\n딥리서치: 외부 조사\n에이전트형: 여러 단계 연결",
    bodySize: 9.4,
    bodyY: 0.9,
  });

  // Bottom area
  addCard(slide, {
    x: 0.96, y: 5.36, w: 6.1, h: 1.18,
    kicker: "직군 예시",
    stripColor: C.blue,
    fill: C.white,
    title: "영업: 미팅 준비 / R&D: 자료 비교 / 품질: 이슈 정리 / 기획: 트렌드 해석",
    titleSize: 13.3,
    titleH: 0.52,
    shadow: false,
  });
  addCard(slide, {
    x: 7.28, y: 5.36, w: 5.08, h: 1.18,
    kicker: "마지막 체크",
    stripColor: C.green,
    fill: C.greenSoft,
    title: "내가 진짜 원하는 결과는 무엇인가 · 누가 이 결과를 보는가 · 내가 직접 판단할 것은 무엇인가",
    titleSize: 12.3,
    titleH: 0.62,
    shadow: false,
  });

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
    "생성형AI_기초활용역량_프롬프트_치트시트_1장.pptx"
  );
  await pptx.writeFile({ fileName: outputFile });
  console.log(`Wrote deck to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
