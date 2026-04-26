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
pptx.subject = "생성형 AI 기초활용역량 템플릿 버전";
pptx.title = "생성형 AI 기초활용역량 템플릿 버전";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: FONT_FAMILY,
  bodyFontFace: FONT_FAMILY,
  lang: "ko-KR",
};

const C = {
  white: "FFFFFF",
  bg: "F7F5F0",
  ink: "1F2B37",
  inkSoft: "637181",
  navy: "1E3B52",
  blue: "4472C4",
  orange: "ED7D31",
  green: "70AD47",
  gold: "B88A3A",
  line: "D7D2C8",
  blueSoft: "EEF4FE",
  warmSoft: "F9EFE5",
  greenSoft: "EEF6EA",
  coralSoft: "F8EBE6",
  graySoft: "F3F3F3",
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

function addBase(slide, index, section) {
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.08,
    line: { color: C.navy, transparency: 100 },
    fill: { color: C.navy },
  });
  slide.addText(section, {
    x: 0.8,
    y: 0.26,
    w: 2.8,
    h: 0.16,
    fontFace: FONT_FAMILY,
    fontSize: 10,
    bold: true,
    color: C.blue,
    margin: 0,
  });
  slide.addText(String(index).padStart(2, "0"), {
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
    textOpts(title, 0.92, 0.82, 10.2, 0.7, {
      fontSize: 28,
      minFontSize: 22,
      maxFontSize: 30,
      bold: true,
      color: C.ink,
    })
  );
  if (subtitle) {
    slide.addText(
      subtitle,
      textOpts(subtitle, 0.94, 1.72, 9.4, 0.28, {
        fontSize: 13.2,
        minFontSize: 11,
        maxFontSize: 14,
        color: C.inkSoft,
      })
    );
  }
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
    shadow: cfg.shadow === false ? undefined : safeOuterShadow("1B2530", 0.08, 45, 1, 1),
  });
  if (cfg.kicker) {
    slide.addText(cfg.kicker, {
      x: cfg.x + 0.18,
      y: cfg.y + 0.14,
      w: cfg.w - 0.36,
      h: 0.14,
      fontFace: FONT_FAMILY,
      fontSize: 8.8,
      bold: true,
      color: cfg.kickerColor || C.blue,
      margin: 0,
    });
  }
  if (cfg.title) {
    slide.addText(
      cfg.title,
      textOpts(cfg.title, cfg.x + 0.18, cfg.y + 0.34, cfg.w - 0.36, cfg.titleH || 0.54, {
        fontSize: cfg.titleSize || 18,
        minFontSize: cfg.titleMinSize || 12,
        maxFontSize: cfg.titleSize || 18,
        bold: true,
        color: cfg.titleColor || C.ink,
      })
    );
  }
  if (cfg.body) {
    slide.addText(
      cfg.body,
      textOpts(cfg.body, cfg.x + 0.18, cfg.y + (cfg.bodyY || 0.95), cfg.w - 0.36, cfg.h - (cfg.bodyY || 0.95) - 0.18, {
        fontSize: cfg.bodySize || 12.4,
        minFontSize: cfg.bodyMinSize || 10.5,
        maxFontSize: cfg.bodySize || 12.4,
        color: cfg.bodyColor || C.ink,
      })
    );
  }
}

function bulletRuns(items, color = C.ink, size = 13.8, paraSpaceAfter = 6) {
  return items.map((item) => ({
    text: item,
    options: {
      bullet: { indent: 14 },
      hanging: 3,
      paraSpaceAfter,
      color,
      fontFace: FONT_FAMILY,
      fontSize: size,
    },
  }));
}

function addTag(slide, text, x, y, fill = C.navy, color = C.white, w = 1.6) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.34,
    rectRadius: 0.16,
    line: { color: fill, transparency: 100 },
    fill: { color: fill },
  });
  slide.addText(text, {
    x: x + 0.02,
    y: y + 0.08,
    w: w - 0.04,
    h: 0.14,
    fontFace: FONT_FAMILY,
    fontSize: 8.8,
    bold: true,
    color,
    align: "center",
    margin: 0,
  });
}

function finalize(slide) {
  warnIfSlideHasOverlaps(slide, pptx, {
    muteContainment: true,
    ignoreDecorativeShapes: true,
  });
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function buildSlides() {
  let slide;

  slide = pptx.addSlide();
  addBase(slide, 1, "생성형 AI 기초활용역량");
  addTag(slide, "AI COLLABORATION", 0.98, 1.26, C.gold, C.ink, 1.7);
  slide.addText(
    "생성형 AI\n기초활용역량",
    textOpts("생성형 AI\n기초활용역량", 0.98, 1.84, 4.4, 1.08, {
      fontSize: 29,
      minFontSize: 23,
      maxFontSize: 31,
      bold: true,
      color: C.ink,
    })
  );
  slide.addText(
    "목적을 분명히 하고\n질문하게 하고\n판단까지 가는 AI 협업",
    textOpts("목적을 분명히 하고\n질문하게 하고\n판단까지 가는 AI 협업", 1.0, 3.46, 3.8, 0.86, {
      fontSize: 16,
      minFontSize: 13,
      maxFontSize: 17,
      color: C.inkSoft,
    })
  );
  addCard(slide, {
    x: 7.34,
    y: 1.38,
    w: 4.8,
    h: 4.6,
    kicker: "이 템플릿의 기준",
    title: "질문, 판단, 구조가 먼저 보이는 화면",
    body:
      "AI 기능 자랑보다 목적 정의, 질문 설계, 판단, 실습, 구조화가 먼저 보이게 만든다.\n\n미니멀 세미나형 + 구조적 워크숍형 + 절제된 컨설팅 도식형을 한 데 섞는다.",
    fill: C.white,
    line: C.line,
    titleSize: 20,
    bodySize: 13,
  });
  slide.addText(
    "White / Warm Gray / Navy / Slate / Charcoal",
    textOpts("White / Warm Gray / Navy / Slate / Charcoal", 0.98, 5.72, 4.9, 0.2, {
      fontSize: 11,
      minFontSize: 10,
      maxFontSize: 11,
      italic: true,
      color: C.inkSoft,
    })
  );
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 2, "PHILOSOPHY");
  addTitle(slide, "좋은 AI 활용은 더 화려한 답을 받는 일이 아니다", "더 좋은 질문을 설계하고, 더 나은 판단에 도달하는 일이다.");
  addCard(slide, {
    x: 1.0,
    y: 2.26,
    w: 11.24,
    h: 2.9,
    title: "AI 활용의 출발점은 답이 아니라 목적이다",
    body:
      "좋은 결과는 사람마다 다르다. 그래서 먼저 의미를 맞춰야 하고,\nAI에게 바로 답을 요구하기보다 내가 진짜 원하는 결과를 함께 정의해야 한다.",
    fill: C.blueSoft,
    line: C.line,
    titleSize: 24,
    bodySize: 14,
    titleH: 0.7,
    bodyY: 1.08,
  });
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 3, "FLOW");
  addTitle(slide, "4MAT 과정 흐름", "왜, 무엇, 어떻게, 그래서 무엇을 적용할지의 순서로 간다.");
  const flow = [
    ["WHY", "왜 AI를 써도 아직 답답한가", C.blueSoft, C.blue],
    ["WHAT", "AI를 어떤 도구로 이해해야 하는가", C.warmSoft, C.orange],
    ["HOW", "어떻게 질문하고 구조화하고 점검하는가", C.greenSoft, C.green],
    ["IF", "그래서 내 업무에 무엇을 적용할 것인가", C.coralSoft, C.orange],
  ];
  flow.forEach((item, i) => {
    addCard(slide, {
      x: 0.96 + i * 3.03,
      y: 2.38,
      w: 2.78,
      h: 2.98,
      kicker: item[0],
      title: item[1],
      fill: item[2],
      line: C.line,
      kickerColor: item[3],
      titleSize: 18,
      titleH: 0.9,
      shadow: false,
    });
  });
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 4, "COMPARE");
  addTitle(slide, "예쁜 집이 사람마다 다르듯, 좋은 결과도 사람마다 다르다", "같은 말을 써도 떠올리는 기준은 모두 다를 수 있다.");
  addCard(slide, {
    x: 0.98,
    y: 2.18,
    w: 5.24,
    h: 3.9,
    kicker: "사례 A | 예쁜 집",
    title: "채광이 좋은 집\n동선이 편한 집\n가족이 편안한 집",
    body: "같은 ‘예쁜 집’이라도 각자 떠올리는 기준은 전혀 다르다.",
    fill: C.white,
    line: C.line,
  });
  addCard(slide, {
    x: 7.02,
    y: 2.18,
    w: 5.24,
    h: 3.9,
    kicker: "사례 B | 좋은 결과",
    title: "한 번에 이해되는 보고\n다시 설명하지 않아도 되는 정리\n빠르게 결정되는 회의",
    body: "그래서 AI에게 ‘좋게 써줘’라고만 하면 어긋나기 쉽다.",
    fill: C.blueSoft,
    line: C.line,
    kickerColor: C.blue,
  });
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 5, "JUDGMENT");
  addTitle(slide, "잘못된 접근 vs 올바른 접근", "의사 비유처럼 접근 방식의 차이를 선명하게 보여준다.");
  addCard(slide, {
    x: 0.98,
    y: 2.18,
    w: 5.24,
    h: 3.9,
    kicker: "잘못된 접근",
    title: "이 자료 쉽게 설명해줘",
    body: "바로 답을 요구한다.\n청자도 목적도 제약도 빠져 있다.\n결과는 그럴듯하지만 내 상황과 어긋날 수 있다.",
    fill: C.coralSoft,
    line: C.line,
    kickerColor: C.orange,
  });
  addCard(slide, {
    x: 7.02,
    y: 2.18,
    w: 5.24,
    h: 3.9,
    kicker: "올바른 접근",
    title: "지금 바로 답하지 말고,\n먼저 내가 무엇을 하려는지 질문해줘",
    body: "맥락을 묻는다.\n누가 읽는지, 무엇을 놓치면 안 되는지 확인한다.\n그다음에야 더 맞는 구조와 판단 재료가 나온다.",
    fill: C.greenSoft,
    line: C.line,
    kickerColor: C.green,
    titleSize: 18,
  });
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 6, "CANVAS");
  addTitle(slide, "CRAFTO 6칸 그리드", "실습과 정리에 자연스럽게 쓰는 워크숍형 슬라이드.");
  const crafto = [
    ["Context", "지금 어떤 상황인가", C.blueSoft, C.blue],
    ["Role", "AI는 어떤 역할을 해야 하는가", C.white, C.navy],
    ["Audience", "누가 이 결과를 보는가", C.greenSoft, C.green],
    ["Format", "어떤 형태로 받으면 바로 쓸 수 있는가", C.warmSoft, C.gold],
    ["Tone", "어느 수준과 말투가 필요한가", C.coralSoft, C.orange],
    ["Option", "제약, 금지선, 선택 기준은 무엇인가", C.white, C.navy],
  ];
  crafto.forEach((item, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    addCard(slide, {
      x: 0.98 + col * 3.96,
      y: 2.24 + row * 1.74,
      w: 3.56,
      h: 1.45,
      kicker: item[0],
      title: item[1],
      fill: item[2],
      line: C.line,
      kickerColor: item[3],
      titleSize: 15,
      titleH: 0.5,
      shadow: false,
    });
  });
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 7, "FRAME");
  addTitle(slide, "철학 / 프레임 / 노하우", "3층 구조로 메시지를 압축한다.");
  addCard(slide, {
    x: 1.48,
    y: 2.0,
    w: 10.4,
    h: 1.02,
    title: "철학 | 목적 · 인터뷰와 점검 · 판단과 실행",
    fill: C.navy,
    line: C.navy,
    titleColor: C.white,
    titleSize: 21,
  });
  addCard(slide, {
    x: 1.88,
    y: 3.28,
    w: 9.6,
    h: 0.98,
    title: "프레임 | CRAFTO · 출발지점-목표지점-이동수단 · 인터뷰형 협업",
    fill: C.blueSoft,
    line: C.line,
    titleSize: 17,
  });
  addCard(slide, {
    x: 2.28,
    y: 4.52,
    w: 8.8,
    h: 1.06,
    title: "노하우 | 10-80-10 · 1-3-1 · 피드백 루프 · NotebookLM · Project / Gem · 서비스 연결",
    fill: C.warmSoft,
    line: C.line,
    titleSize: 15,
  });
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 8, "LAYOUT");
  addTitle(slide, "10 - 80 - 10 가로 분할", "도입, 핵심 내용, 정리 메시지를 한 장에 넣는 구조.");
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: 2.55, w: 2.0, h: 1.14, rectRadius: 0.08,
    line: { color: C.navy, transparency: 100 }, fill: { color: C.navy }
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 3.08, y: 2.55, w: 7.14, h: 1.14, rectRadius: 0.08,
    line: { color: C.line, transparency: 100 }, fill: { color: C.blueSoft }
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 10.3, y: 2.55, w: 2.0, h: 1.14, rectRadius: 0.08,
    line: { color: C.navy, transparency: 100 }, fill: { color: C.navy }
  });
  slide.addText("처음 10", { x: 1.22, y: 2.89, w: 1.56, h: 0.16, fontFace: FONT_FAMILY, fontSize: 17, bold: true, color: C.white, align: "center", margin: 0 });
  slide.addText("중간 80", { x: 5.42, y: 2.89, w: 2.44, h: 0.16, fontFace: FONT_FAMILY, fontSize: 17, bold: true, color: C.ink, align: "center", margin: 0 });
  slide.addText("마지막 10", { x: 10.46, y: 2.89, w: 1.7, h: 0.16, fontFace: FONT_FAMILY, fontSize: 17, bold: true, color: C.white, align: "center", margin: 0 });
  slide.addText(
    "처음은 사람이 목적과 기준을 잡고, 중간은 AI가 질문·정리·비교를 돕고, 마지막은 사람이 선택과 책임을 잡는다.",
    textOpts("처음은 사람이 목적과 기준을 잡고, 중간은 AI가 질문·정리·비교를 돕고, 마지막은 사람이 선택과 책임을 잡는다.", 1.0, 4.38, 10.8, 0.34, {
      fontSize: 13,
      minFontSize: 11,
      maxFontSize: 14,
      align: "center",
      color: C.inkSoft,
    })
  );
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 9, "STRUCTURE");
  addTitle(slide, "1 - 3 - 1 퍼널 구조", "큰 질문 하나를 세 가지 기준으로 풀고 다시 하나의 판단으로 모은다.");
  addCard(slide, {
    x: 1.08, y: 2.34, w: 2.16, h: 2.3,
    kicker: "1", title: "핵심 질문 1개",
    body: "문제를 한 문장으로 잡는다",
    fill: C.white, line: C.line, titleSize: 19, bodyY: 1.02
  });
  slide.addShape(pptx.ShapeType.chevron, {
    x: 3.5, y: 2.97, w: 0.34, h: 0.52,
    line: { color: C.gold, transparency: 100 }, fill: { color: C.gold }
  });
  addCard(slide, {
    x: 4.06, y: 2.04, w: 5.2, h: 2.9,
    kicker: "3", title: "기준 3개",
    body: "목적이 분명한가\n질문이 구체적인가\n판단이 가능한가",
    fill: C.blueSoft, line: C.line, titleSize: 22, bodyY: 1.0, bodySize: 13.5
  });
  slide.addShape(pptx.ShapeType.chevron, {
    x: 9.52, y: 2.97, w: 0.34, h: 0.52,
    line: { color: C.gold, transparency: 100 }, fill: { color: C.gold }
  });
  addCard(slide, {
    x: 10.06, y: 2.34, w: 2.2, h: 2.3,
    kicker: "1", title: "최종 판단 1개",
    body: "이 질문은 현업에서 다시 쓸 수 있는 구조인가",
    fill: C.greenSoft, line: C.line, titleSize: 18, bodyY: 0.94, bodySize: 12.4
  });
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 10, "LOOP");
  addTitle(slide, "피드백 루프 4분면", "입력-생성-검토-수정의 반복을 워크숍형으로 보여준다.");
  const loop = [
    ["입력", "목적과 상황 정의", 1.12, 2.28, C.blueSoft, C.blue],
    ["생성", "초안과 옵션 만들기", 6.88, 2.28, C.warmSoft, C.orange],
    ["검토", "기준으로 평가하기", 1.12, 4.22, C.greenSoft, C.green],
    ["수정", "질문과 답을 다듬기", 6.88, 4.22, C.coralSoft, C.orange],
  ];
  loop.forEach((item) => {
    addCard(slide, {
      x: item[2], y: item[3], w: 4.9, h: 1.56,
      kicker: item[0], title: item[1], fill: item[4], line: C.line,
      kickerColor: item[5], titleSize: 18, titleH: 0.48, shadow: false
    });
  });
  slide.addText(
    "좋은 활용은 한 번에 정답을 뽑는 것이 아니라, 반복적으로 질문과 답을 조정하는 데서 나온다.",
    textOpts("좋은 활용은 한 번에 정답을 뽑는 것이 아니라, 반복적으로 질문과 답을 조정하는 데서 나온다.", 0.98, 6.02, 10.9, 0.26, {
      fontSize: 12.5, minFontSize: 11, maxFontSize: 13, italic: true, color: C.inkSoft
    })
  );
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 11, "ROADMAP");
  addTitle(slide, "출발지점 - 목표지점 - 이동수단", "길찾기 비유처럼 현재 상태와 이동 방식을 정리한다.");
  addCard(slide, {
    x: 1.02, y: 2.54, w: 2.7, h: 2.48,
    kicker: "출발지점", title: "지금은 질문이 막연한 상태",
    body: "좋게 써줘\n잘 정리해줘\n효율적으로 만들어줘",
    fill: C.white, line: C.line, titleSize: 18, bodyY: 1.06
  });
  slide.addShape(pptx.ShapeType.chevron, {
    x: 4.06, y: 3.28, w: 0.46, h: 0.58,
    line: { color: C.gold, transparency: 100 }, fill: { color: C.gold }
  });
  addCard(slide, {
    x: 4.78, y: 2.34, w: 3.78, h: 2.92,
    kicker: "이동수단", title: "프레임 · 예시 · 실습 · 피드백",
    body: "질문 사다리\nCRAFTO\n인터뷰형 협업\n10-80-10\n1-3-1",
    fill: C.blueSoft, line: C.line, titleSize: 20, bodyY: 1.04
  });
  slide.addShape(pptx.ShapeType.chevron, {
    x: 8.9, y: 3.28, w: 0.46, h: 0.58,
    line: { color: C.gold, transparency: 100 }, fill: { color: C.gold }
  });
  addCard(slide, {
    x: 9.62, y: 2.54, w: 2.7, h: 2.48,
    kicker: "목표지점", title: "판단 가능한 질문 구조를 갖춘 상태",
    body: "무엇을 위해\n누구에게\n어떤 기준으로\n무엇을 판단할지 보인다",
    fill: C.greenSoft, line: C.line, titleSize: 17, bodyY: 1.0
  });
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 12, "WORKSHOP");
  addTitle(slide, "실습 안내 슬라이드", "설명보다 참여를 유도하는 카드형 안내.");
  addCard(slide, {
    x: 0.98, y: 2.2, w: 3.5, h: 2.8,
    kicker: "이번 실습의 목표",
    title: "모호한 요청을\n현업에서 쓸 수 있는 질문 구조로 바꿔본다",
    fill: C.blueSoft, line: C.line, titleSize: 18, titleH: 0.86
  });
  addCard(slide, {
    x: 4.84, y: 2.2, w: 3.5, h: 2.8,
    kicker: "진행 순서",
    title: "상황 1개 고르기\n목적 1문장 쓰기\n질문 초안 만들기\n짝과 서로 피드백",
    fill: C.white, line: C.line, titleSize: 17, titleH: 1.15
  });
  addCard(slide, {
    x: 8.7, y: 2.2, w: 3.5, h: 2.8,
    kicker: "산출물 형태",
    title: "프롬프트 1개\n판단 기준 3개\n수정 포인트 1개",
    fill: C.greenSoft, line: C.line, titleSize: 18, titleH: 1.02, kickerColor: C.green
  });
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 13, "WORKSHOP");
  addTitle(slide, "직군별 장면에서 시작한다", "처음부터 자유롭게 쓰지 않고, 내 일과 가장 가까운 장면을 먼저 고른다.");
  const scenes = [
    ["영업 / 고객 대응", "고객 미팅 준비\n기술자료 설명\n제안 논리 정리", C.blueSoft, C.blue],
    ["R&D / 공정 / 설계", "논문·기술자료 비교\n원인 가설 정리\n다음 검토 방향 설정", C.white, C.navy],
    ["품질 / TEST / EHS", "이슈 원인 정리\n리스크 점검\n액션 우선순위", C.greenSoft, C.green],
    ["기획 / IT / 인사", "트렌드 해석\n보고 구조화\n내부 자료 연결", C.coralSoft, C.orange],
  ];
  scenes.forEach((item, i) => {
    addCard(slide, {
      x: 0.98 + (i % 2) * 5.78,
      y: 2.2 + Math.floor(i / 2) * 1.9,
      w: 5.34,
      h: 1.52,
      kicker: item[0],
      title: item[1],
      fill: item[2],
      line: C.line,
      kickerColor: item[3],
      titleSize: 17,
      titleH: 0.72,
      shadow: false,
    });
  });
  finalize(slide);

  slide = pptx.addSlide();
  addBase(slide, 14, "SYNTHESIS");
  addTitle(slide, "마지막 종합실습 캔버스", "강의 전체를 한 화면에서 다시 조합하는 마무리형 슬라이드.");
  addCard(slide, {
    x: 0.98, y: 2.14, w: 3.58, h: 3.96,
    kicker: "문제와 목적",
    title: "해결하고 싶은 실제 상황\n왜 이 질문이 필요한가\n누가 결과를 사용할 것인가",
    fill: C.white, line: C.line, titleSize: 17, titleH: 1.18
  });
  addCard(slide, {
    x: 4.86, y: 2.14, w: 3.14, h: 3.96,
    kicker: "질문 구조",
    title: "Context\nRole\nAsk\nFormat\nTone\nOutput",
    fill: C.blueSoft, line: C.line, titleSize: 17, titleH: 1.32
  });
  addCard(slide, {
    x: 8.3, y: 2.14, w: 4.0, h: 3.96,
    kicker: "판단과 수정",
    title: "좋은 답인지 어떻게 판단할 것인가\n무엇을 다시 물어보면 더 좋아지는가\n어떤 이동수단을 쓸 것인가",
    fill: C.greenSoft, line: C.line, titleSize: 16, titleH: 1.25, kickerColor: C.green
  });
  finalize(slide);
}

async function main() {
  ensureDir(path.join(__dirname, "output"));
  buildSlides();
  const outputFile = path.join(
    __dirname,
    "output",
    "생성형AI_기초활용역량_템플릿버전.pptx"
  );
  await pptx.writeFile({ fileName: outputFile });
  console.log(`Wrote deck to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
