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
pptx.subject = "생성형 AI 기초활용역량 실전 강의 슬라이드";
pptx.title = "생성형 AI 기초활용역량";
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
  navy2: "405A70",
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
  darkCard: "24303D",
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

function addBase(slide, index, section, dark = false) {
  slide.background = { color: dark ? C.bg : C.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.08,
    line: { color: C.navy, transparency: 100 },
    fill: { color: C.navy },
  });
  slide.addText(section, {
    x: 0.78,
    y: 0.28,
    w: 4.8,
    h: 0.18,
    fontFace: FONT_FAMILY,
    fontSize: 10,
    bold: true,
    color: C.blue,
    margin: 0,
  });
  slide.addText(String(index).padStart(2, "0"), {
    x: 12.0,
    y: 0.26,
    w: 0.55,
    h: 0.18,
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
    w: 11.85,
    h: 0,
    line: { color: C.line, width: 1 },
  });
}

function addTitle(slide, title, subtitle, dark = false) {
  slide.addText(
    title,
    textOpts(title, 0.92, 0.82, 9.1, 0.74, {
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
      textOpts(subtitle, 0.94, 1.8, 8.8, 0.26, {
        fontSize: 13.5,
        minFontSize: 11,
        maxFontSize: 15,
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
    line: { color: cfg.line || C.line, width: cfg.lineWidth || 1 },
    fill: { color: cfg.fill || C.bgAlt },
    shadow: cfg.shadow === false ? undefined : safeOuterShadow("20303C", 0.05, 45, 1, 1),
  });
  if (cfg.stripColor !== false) {
    slide.addShape(pptx.ShapeType.rect, {
      x: cfg.x,
      y: cfg.y,
      w: cfg.w,
      h: cfg.stripH || 0.1,
      line: { color: cfg.stripColor || cfg.kickerColor || C.navy, transparency: 100 },
      fill: { color: cfg.stripColor || cfg.kickerColor || C.navy },
    });
  }
  if (cfg.kicker) {
    slide.addText(cfg.kicker, {
      x: cfg.x + 0.22,
      y: cfg.y + 0.18,
      w: cfg.w - 0.44,
      h: 0.16,
      fontFace: FONT_FAMILY,
      fontSize: 9,
      bold: true,
      color: cfg.kickerColor || C.blue,
      margin: 0,
    });
  }
  if (cfg.title) {
    slide.addText(
      cfg.title,
      textOpts(cfg.title, cfg.x + 0.22, cfg.y + 0.38, cfg.w - 0.44, cfg.titleH || 0.6, {
        fontSize: cfg.titleSize || 18,
        minFontSize: cfg.titleMinSize || Math.min(cfg.titleSize || 18, 13),
        maxFontSize: Math.max(cfg.titleSize || 18, cfg.titleMinSize || Math.min(cfg.titleSize || 18, 13)),
        bold: true,
        color: cfg.titleColor || C.ink,
      })
    );
  }
  if (cfg.body) {
    slide.addText(
      cfg.body,
      textOpts(cfg.body, cfg.x + 0.22, cfg.y + (cfg.bodyY || 1.04), cfg.w - 0.44, cfg.h - (cfg.bodyY || 1.04) - 0.22, {
        fontSize: cfg.bodySize || 12.5,
        minFontSize: cfg.bodyMinSize || 10.5,
        maxFontSize: cfg.bodySize || 12.5,
        color: cfg.bodyColor || C.ink,
      })
    );
  }
}

function bulletRuns(items, color = C.ink, size = 14.5, paraSpaceAfter = 6) {
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

function addQuote(slide, text, author) {
  slide.addText(
    text,
    textOpts(text, 1.18, 2.08, 10.7, 1.55, {
      fontSize: 24,
      minFontSize: 18,
      maxFontSize: 26,
      bold: true,
      align: "center",
      color: C.ink,
    })
  );
  if (author) {
    slide.addText(
      author,
      textOpts(author, 4.2, 4.05, 4.8, 0.28, {
        fontSize: 12.5,
        minFontSize: 11,
        maxFontSize: 13,
        align: "center",
        color: C.inkSoft,
        italic: true,
      })
    );
  }
}

function addSectionBreak(slide, index, section, title, body) {
  addBase(slide, index, section, false);
  slide.addShape(pptx.ShapeType.line, {
    x: 0.78,
    y: 1.18,
    w: 0.48,
    h: 0,
    line: { color: C.navy, width: 1.5 },
  });
  slide.addText(
    title,
    textOpts(title, 0.92, 1.52, 6.2, 1.0, {
      fontSize: 28,
      minFontSize: 23,
      maxFontSize: 29,
      bold: true,
      color: C.ink,
    })
  );
  slide.addText(
    body,
    textOpts(body, 0.94, 2.74, 6.0, 1.2, {
      fontSize: 14,
      minFontSize: 12,
      maxFontSize: 15,
      color: C.inkSoft,
    })
  );
}

function addPill(slide, text, x, y, w, fill = C.navy, color = C.white) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.34,
    rectRadius: 0.16,
    line: { color: fill, transparency: 100 },
    fill: { color: fill },
  });
  slide.addText(text, {
    x: x + 0.04,
    y: y + 0.08,
    w: w - 0.08,
    h: 0.14,
    fontFace: FONT_FAMILY,
    fontSize: 9,
    bold: true,
    align: "center",
    color,
    margin: 0,
  });
}

function finalizeSlide(slide) {
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
  slide.addShape(pptx.ShapeType.line, {
    x: 0.78,
    y: 1.18,
    w: 0.48,
    h: 0,
    line: { color: C.navy, width: 1.5 },
  });
  addPill(slide, "AI COLLABORATION", 1.02, 1.52, 1.7, C.gold, C.ink);
  slide.addText(
    "생성형 AI\n기초활용역량",
    textOpts("생성형 AI\n기초활용역량", 0.98, 2.1, 4.9, 1.08, {
      fontSize: 29,
      minFontSize: 23,
      maxFontSize: 30,
      bold: true,
      color: C.ink,
    })
  );
  slide.addText(
    "목적을 분명히 하고\n질문하게 하고\n판단까지 가는 AI 협업",
    textOpts("목적을 분명히 하고\n질문하게 하고\n판단까지 가는 AI 협업", 1.0, 3.76, 4.1, 0.88, {
      fontSize: 16,
      minFontSize: 13,
      maxFontSize: 17,
      color: C.inkSoft,
    })
  );
  addCard(slide, {
    x: 7.28,
    y: 1.28,
    w: 4.86,
    h: 1.42,
    kicker: "이 과정의 기준",
    title: "질문, 판단, 구조가 먼저 보이는 화면",
    fill: C.white,
    line: C.line,
    titleSize: 18,
    titleH: 0.46,
    shadow: false,
  });
  addCard(slide, {
    x: 7.28,
    y: 3.0,
    w: 4.86,
    h: 1.54,
    kicker: "오늘 다룰 축",
    title: "철학 3개\n4MAT 흐름\n예쁜 집 / 의사 비유",
    fill: C.white,
    line: C.line,
    titleSize: 17,
    titleH: 0.7,
    shadow: false,
  });
  addCard(slide, {
    x: 7.28,
    y: 4.84,
    w: 4.86,
    h: 1.22,
    kicker: "핵심 프레임",
    title: "CRAFTO · 10-80-10 · 1-3-1 · 피드백 루프 · 로드맵",
    fill: C.blueSoft,
    line: C.line,
    titleSize: 14.5,
    titleH: 0.5,
    shadow: false,
  });
  slide.addText(
    "4 Hours / Workshop Deck",
    textOpts("4 Hours / Workshop Deck", 1.0, 6.02, 2.2, 0.18, {
      fontSize: 10.5,
      minFontSize: 10,
      maxFontSize: 11,
      italic: true,
      color: C.inkSoft,
    })
  );
  slide.addText(
    "White / Warm Gray / Navy / Slate / Charcoal",
    textOpts("White / Warm Gray / Navy / Slate / Charcoal", 1.0, 5.62, 4.9, 0.2, {
      fontSize: 11,
      minFontSize: 10,
      maxFontSize: 11,
      italic: true,
      color: C.inkSoft,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 2, "4MAT 구조");
  addTitle(slide, "오늘은 이렇게 갑니다", "설명보다 작은 실습을 자주 넣고, 마지막에는 자기 업무 장면 하나로 종합한다.");
  const stages = [
    ["WHY", "왜 AI를 써도 아직 답답한가", C.blueSoft, C.blue],
    ["WHAT", "AI를 어떤 도구로 이해해야 하는가", C.sandSoft, C.gold],
    ["HOW", "어떻게 질문하고 구조화하고 점검하는가", C.greenSoft, C.green],
    ["IF", "그래서 내 업무에 무엇을 적용할 것인가", C.coralSoft, C.coral],
  ];
  stages.forEach((item, i) => {
    addCard(slide, {
      x: 0.96 + i * 3.03,
      y: 2.34,
      w: 2.78,
      h: 2.95,
      kicker: item[0],
      title: item[1],
      fill: item[2],
      line: C.line,
      kickerColor: item[3],
      titleSize: 20,
      titleH: 0.9,
      bodyY: 1.5,
      shadow: false,
    });
  });
  slide.addText(
    "Why에서 문제를 열고, What에서 개념을 잡고, How에서 반복 실습을 돌리고, If에서 내 업무 적용으로 닫는다.",
    textOpts("Why에서 문제를 열고, What에서 개념을 잡고, How에서 반복 실습을 돌리고, If에서 내 업무 적용으로 닫는다.", 0.98, 5.66, 10.9, 0.34, {
      fontSize: 14,
      minFontSize: 12,
      maxFontSize: 15,
      italic: true,
      color: C.inkSoft,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 3, "현재 위치");
  addTitle(slide, "나는 지금 AI를 어떻게 쓰고 있는가", "평가가 아니라 자기 위치 확인이다.");
  slide.addShape(pptx.ShapeType.line, {
    x: 1.2,
    y: 3.74,
    w: 10.35,
    h: 0,
    line: { color: C.line, width: 2 },
  });
  const points = [
    ["검색", "찾는다"],
    ["초안", "만든다"],
    ["비교", "검토한다"],
    ["인터뷰", "질문하게 한다"],
    ["판단", "피드백과 선택"],
  ];
  points.forEach((item, i) => {
    const x = 1.2 + i * 2.58;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x - 0.12,
      y: 3.56,
      w: 0.24,
      h: 0.24,
      line: { color: i < 2 ? C.navy : C.gold, transparency: 100 },
      fill: { color: i < 2 ? C.navy : C.gold },
    });
    slide.addText(
      item[0],
      textOpts(item[0], x - 0.46, 3.05, 0.9, 0.25, {
        fontSize: 14,
        minFontSize: 12,
        maxFontSize: 15,
        bold: true,
        align: "center",
        color: C.ink,
      })
    );
    slide.addText(
      item[1],
      textOpts(item[1], x - 0.6, 4.0, 1.2, 0.22, {
        fontSize: 10.5,
        minFontSize: 9,
        maxFontSize: 11,
        align: "center",
        color: C.inkSoft,
      })
    );
  });
  addCard(slide, {
    x: 0.98,
    y: 5.15,
    w: 11.3,
    h: 0.76,
    kicker: "핵심",
    title: "대부분은 아직 검색+초안 단계에 머문다. 오늘은 비교, 질문, 판단의 단계로 한 걸음 더 들어가보려 한다.",
    fill: C.blueSoft,
    line: "CBDCE5",
    titleSize: 15,
    titleH: 0.28,
    titleColor: C.ink,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 4, "의미 정렬");
  addTitle(slide, "예쁜 집은 사람마다 다르다", "같은 단어를 써도, 각자 떠올리는 기준은 전혀 다를 수 있다.");
  const houses = [
    ["채광", "빛이 잘 들어오는 집"],
    ["동선", "생활이 편한 집"],
    ["감도", "미감이 살아 있는 집"],
    ["안정", "가족이 편안한 집"],
  ];
  houses.forEach((item, i) => {
    addCard(slide, {
      x: 0.96 + i * 3.03,
      y: 2.38,
      w: 2.78,
      h: 2.95,
      kicker: item[0],
      title: item[1],
      fill: i % 2 === 0 ? C.bgAlt : C.blueSoft,
      line: C.line,
      titleSize: 18,
      titleH: 0.86,
      shadow: false,
    });
  });
  slide.addText(
    "좋은 결과도 마찬가지다. ‘잘 된 보고’, ‘좋은 설명’, ‘실용적 정리’도 사람마다 뜻이 다를 수 있다.",
    textOpts("좋은 결과도 마찬가지다. ‘잘 된 보고’, ‘좋은 설명’, ‘실용적 정리’도 사람마다 뜻이 다를 수 있다.", 0.98, 5.62, 10.7, 0.34, {
      fontSize: 14,
      minFontSize: 12,
      maxFontSize: 15,
      italic: true,
      color: C.inkSoft,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 5, "질문 사다리");
  addTitle(slide, "원하는 결과는 바로 나오지 않는다", "질문을 쪼개야 비로소 내가 진짜 원하는 결과가 보인다.");
  slide.addText(bulletRuns([
    "조금 더 수월해졌으면 하는 장면은?",
    "그 장면이 왜 번거로운가?",
    "그 일이 잘 되면 무엇이 달라지는가?",
    "그게 왜 중요한가?",
    "당신에게 성과란 무엇인가?",
    "누가 무엇을 인정해주면 잘 된 것인가?",
    "결국 진짜 원하는 결과는 무엇인가?",
  ], C.ink, 14.2, 6), {
    x: 1.02,
    y: 2.25,
    w: 5.95,
    h: 3.95,
    fontFace: FONT_FAMILY,
    margin: 0,
    color: C.ink,
    valign: "top",
  });
  addCard(slide, {
    x: 8.22,
    y: 2.32,
    w: 4.08,
    h: 2.6,
    kicker: "예시",
    title: "보고서를 쓰는 것\n→\n상사가 방향을 한 번에 이해하는 것",
    body: "겉으로 원하는 것과 진짜 원하는 결과는 다를 수 있다.",
    fill: C.blueSoft,
    line: "CBDCE5",
    titleSize: 20,
    titleH: 1.0,
    bodyY: 1.44,
    bodySize: 12.5,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 6, "직군별 장면");
  addTitle(slide, "실습용 장면은 여기서 고른다", "처음부터 자유롭게 쓰지 않고, 내 직군과 가장 가까운 장면 하나를 먼저 고른다.");
  const scenes = [
    ["영업 / 고객 대응", "고객 미팅 준비\n기술자료 쉽게 설명\n제안 논리 정리", C.blueSoft, C.blue],
    ["R&D / 공정 / 설계", "논문·기술자료 비교\n원인 가설 정리\n다음 검토 방향 설정", C.bgAlt, C.navy],
    ["품질 / TEST / EHS", "이슈 원인 정리\n리스크 점검\n액션 우선순위 정리", C.greenSoft, C.green],
    ["기획 / IT / 인사", "트렌드 해석\n보고 구조화\n내부 자료 연결", C.coralSoft, C.coral],
  ];
  scenes.forEach((item, i) => {
    addCard(slide, {
      x: 0.98 + (i % 2) * 5.72,
      y: 2.24 + Math.floor(i / 2) * 1.92,
      w: 5.28,
      h: 1.54,
      kicker: item[0],
      title: item[1],
      fill: item[2],
      line: C.line,
      kickerColor: item[3],
      titleSize: 17,
      titleH: 0.7,
      shadow: false,
    });
  });
  slide.addText(
    "이 장면을 고른 뒤에야 ‘왜 번거로운가’, ‘잘 되면 무엇이 달라지는가’, ‘진짜 원하는 결과는 무엇인가’로 내려간다.",
    textOpts("이 장면을 고른 뒤에야 ‘왜 번거로운가’, ‘잘 되면 무엇이 달라지는가’, ‘진짜 원하는 결과는 무엇인가’로 내려간다.", 0.98, 6.0, 10.8, 0.26, {
      fontSize: 12.5,
      minFontSize: 11,
      maxFontSize: 13,
      italic: true,
      color: C.inkSoft,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 7, "의사 비유");
  addTitle(slide, "진단 없이 처방부터 요구하진 않는다", "중요한 문제일수록 먼저 맥락을 설명하고, 전문가가 다시 질문하게 한다.");
  addCard(slide, {
    x: 0.98,
    y: 2.18,
    w: 5.25,
    h: 3.95,
    kicker: "잘못된 접근",
    title: "이 자료 쉽게 설명해줘",
    body: "바로 답을 요구한다\n청자도 목적도 빠져 있다\n결과는 그럴듯하지만 내 상황과 어긋날 가능성이 크다",
    fill: C.coralSoft,
    line: "E4C6BA",
    kickerColor: C.coral,
  });
  addCard(slide, {
    x: 7.02,
    y: 2.18,
    w: 5.25,
    h: 3.95,
    kicker: "더 나은 접근",
    title: "지금 바로 답하지 말고,\n먼저 내가 무엇을 하려는지 질문해줘",
    body: "맥락을 묻는다\n청자와 제약을 확인한다\n그다음에야 더 맞는 구조와 설명이 나온다",
    fill: C.greenSoft,
    line: "C7D7CB",
    kickerColor: C.green,
    titleSize: 18,
    bodySize: 13.2,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 8, "추론 도구");
  addTitle(slide, "AI는 정답 자판기인가, 추론 도구인가", "AI를 생성 도구로만 쓰면 얕아지고, 추론 도구로 쓸 때 깊어진다.");
  addCard(slide, {
    x: 0.98,
    y: 2.32,
    w: 3.48,
    h: 3.02,
    kicker: "Search",
    title: "찾는다",
    body: "정보를 모은다\n사실을 확인한다",
    fill: C.bgAlt,
    line: C.line,
    titleSize: 22,
    bodyY: 1.18,
  });
  addCard(slide, {
    x: 4.93,
    y: 2.32,
    w: 3.48,
    h: 3.02,
    kicker: "Generate",
    title: "만든다",
    body: "초안을 만든다\n문장을 정리한다",
    fill: C.blueSoft,
    line: "CBDCE5",
    titleSize: 22,
    bodyY: 1.18,
  });
  addCard(slide, {
    x: 8.88,
    y: 2.32,
    w: 3.48,
    h: 3.02,
    kicker: "Reason",
    title: "비교하고 질문하고 점검한다",
    body: "쟁점을 드러낸다\n구조를 세운다\n판단을 돕는다",
    fill: C.sandSoft,
    line: C.line,
    titleSize: 18,
    bodyY: 1.35,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 9, "철학");
  addTitle(slide, "이 과정의 철학", "기능보다 방향을 먼저 세워야 노하우가 얕아지지 않는다.");
  addCard(slide, {
    x: 0.98,
    y: 2.28,
    w: 3.52,
    h: 3.26,
    kicker: "1",
    title: "목적이 먼저다",
    body: "AI 활용의 출발점은 답이 아니라 목적이다.",
    fill: C.blueSoft,
    line: "CBDCE5",
  });
  addCard(slide, {
    x: 4.9,
    y: 2.28,
    w: 3.52,
    h: 3.26,
    kicker: "2",
    title: "AI는 인터뷰와 점검의 파트너다",
    body: "좋은 활용은 AI가 먼저 질문하고, 다시 피드백하는 흐름에서 나온다.",
    fill: C.bgAlt,
    line: C.line,
  });
  addCard(slide, {
    x: 8.82,
    y: 2.28,
    w: 3.52,
    h: 3.26,
    kicker: "3",
    title: "핵심은 더 나은 판단과 실행이다",
    body: "문서 한 개를 빨리 만드는 것보다, 더 정확히 판단하고 움직이는 것이 중요하다.",
    fill: C.greenSoft,
    line: "C7D7CB",
    kickerColor: C.green,
  });
  slide.addText(
    "철학은 방향이고, 프레임은 지도이며, 노하우는 운전법이다.",
    textOpts("철학은 방향이고, 프레임은 지도이며, 노하우는 운전법이다.", 0.98, 5.78, 8.1, 0.24, {
      fontSize: 12.5,
      minFontSize: 11,
      maxFontSize: 13,
      italic: true,
      color: C.inkSoft,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 10, "프레임");
  addTitle(slide, "CRAFTO는 생각 정리 틀이다", "프롬프트 공식이 아니라, 내 생각을 빠뜨리지 않고 전달하는 구조다.");
  const grid = [
    ["Context", "지금 어떤 상황인가", C.blueSoft, C.blue],
    ["Role", "AI는 어떤 역할을 해야 하는가", C.bgAlt, C.navy],
    ["Audience", "누가 이 결과를 보는가", C.greenSoft, C.green],
    ["Format", "어떤 형태로 받으면 바로 쓸 수 있는가", C.sandSoft, C.gold],
    ["Tone", "어느 수준과 말투가 필요한가", C.coralSoft, C.coral],
    ["Option", "제약, 금지선, 선택 기준은 무엇인가", C.bgAlt, C.navy],
  ];
  grid.forEach((item, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    addCard(slide, {
      x: 0.98 + col * 3.95,
      y: 2.18 + row * 1.78,
      w: 3.55,
      h: 1.48,
      kicker: item[0],
      title: item[1],
      fill: item[2],
      line: C.line,
      kickerColor: item[3],
      titleSize: 15,
      titleH: 0.52,
      shadow: false,
    });
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 11, "실습");
  addTitle(slide, "실습 1 | 바로 답 요청 vs 인터뷰형 협업", "같은 장면을 두 방식으로 시도하고, 무엇이 더 맞는지 비교한다.");
  addCard(slide, {
    x: 0.98,
    y: 2.16,
    w: 5.22,
    h: 3.94,
    kicker: "Before",
    title: "이 자료 쉽게 설명해줘",
    body: "답은 바로 나온다.\n하지만 내 목적, 청자, 제약은 빠져 있다.\n결과는 그럴듯하지만 어긋나기 쉽다.",
    fill: C.coralSoft,
    line: "E4C6BA",
    kickerColor: C.coral,
  });
  addCard(slide, {
    x: 7.04,
    y: 2.16,
    w: 5.24,
    h: 3.94,
    kicker: "After",
    title: "지금 바로 답하지 말고,\n먼저 내가 무엇을 하려는지 질문해줘",
    body: "내 목적을 확인한다.\n누가 듣는지, 무엇을 놓치면 안 되는지 확인한다.\n그다음에야 더 맞는 설명과 정리가 나온다.",
    fill: C.greenSoft,
    line: "C7D7CB",
    kickerColor: C.green,
    titleSize: 18,
    bodySize: 13.1,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 12, "노하우");
  addTitle(slide, "처음과 끝은 사람이 잡는다", "AI에게 맡길 수 있는 것과 맡기면 안 되는 것을 구분해야 한다.");
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 2.56,
    w: 2.05,
    h: 1.2,
    rectRadius: 0.08,
    line: { color: C.navy, transparency: 100 },
    fill: { color: C.navy },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 3.12,
    y: 2.56,
    w: 7.08,
    h: 1.2,
    rectRadius: 0.08,
    line: { color: C.blue, transparency: 100 },
    fill: { color: C.blueSoft },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 10.28,
    y: 2.56,
    w: 2.05,
    h: 1.2,
    rectRadius: 0.08,
    line: { color: C.navy, transparency: 100 },
    fill: { color: C.navy },
  });
  slide.addText("처음 10", { x: 1.28, y: 2.9, w: 1.5, h: 0.2, fontFace: FONT_FAMILY, fontSize: 18, bold: true, align: "center", color: C.white, margin: 0 });
  slide.addText("중간 80", { x: 5.57, y: 2.9, w: 2.0, h: 0.2, fontFace: FONT_FAMILY, fontSize: 18, bold: true, align: "center", color: C.ink, margin: 0 });
  slide.addText("마지막 10", { x: 10.46, y: 2.9, w: 1.7, h: 0.2, fontFace: FONT_FAMILY, fontSize: 18, bold: true, align: "center", color: C.white, margin: 0 });
  slide.addText(
    "목적, 기준, 맥락",
    textOpts("목적, 기준, 맥락", 1.1, 4.2, 1.9, 0.22, { fontSize: 12.5, align: "center", color: C.inkSoft })
  );
  slide.addText(
    "질문, 정리, 초안, 비교",
    textOpts("질문, 정리, 초안, 비교", 4.3, 4.2, 4.8, 0.22, { fontSize: 12.5, align: "center", color: C.inkSoft })
  );
  slide.addText(
    "선택, 검증, 책임",
    textOpts("선택, 검증, 책임", 10.36, 4.2, 1.9, 0.22, { fontSize: 12.5, align: "center", color: C.inkSoft })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 13, "노하우");
  addTitle(slide, "많이 만드는 것보다, 줄이고 끝내는 것이 중요하다", "AI는 선택지를 늘리는 데 강하고, 사람은 끝내는 데 책임이 있다.");
  addCard(slide, {
    x: 1.08,
    y: 2.42,
    w: 2.25,
    h: 2.26,
    kicker: "1",
    title: "Problem",
    body: "문제를 한 문장으로 잡는다",
    fill: C.bgAlt,
    line: C.line,
    titleSize: 22,
    bodyY: 1.1,
  });
  slide.addShape(pptx.ShapeType.chevron, {
    x: 3.58,
    y: 3.0,
    w: 0.32,
    h: 0.52,
    line: { color: C.gold, transparency: 100 },
    fill: { color: C.gold },
  });
  addCard(slide, {
    x: 4.08,
    y: 2.1,
    w: 5.16,
    h: 2.88,
    kicker: "3",
    title: "Solutions",
    body: "실행 가능한 대안 3개를 본다\n장단점을 비교한다",
    fill: C.blueSoft,
    line: "CBDCE5",
    titleSize: 22,
    bodySize: 13.5,
  });
  slide.addShape(pptx.ShapeType.chevron, {
    x: 9.52,
    y: 3.0,
    w: 0.32,
    h: 0.52,
    line: { color: C.gold, transparency: 100 },
    fill: { color: C.gold },
  });
  addCard(slide, {
    x: 10.02,
    y: 2.42,
    w: 2.25,
    h: 2.26,
    kicker: "1",
    title: "Recommendation",
    body: "권고안 1개를 선택한다",
    fill: C.greenSoft,
    line: "C7D7CB",
    kickerColor: C.green,
    titleSize: 18,
    bodyY: 1.06,
    bodySize: 12.8,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 14, "노하우");
  addTitle(slide, "초안 다음에는 점검이 들어가야 한다", "AI를 초안 생성기에서 비평가로 확장할 때 활용이 깊어진다.");
  const quadrants = [
    ["메타인지", "본질과 목적에 맞는가", 1.16, 2.34, C.blueSoft, C.blue],
    ["레드팀", "치명적 리스크는 무엇인가", 6.86, 2.34, C.coralSoft, C.coral],
    ["심사위원", "논리 비약은 없는가", 1.16, 4.28, C.sandSoft, C.gold],
    ["전문가", "더 나은 대안은 없는가", 6.86, 4.28, C.greenSoft, C.green],
  ];
  quadrants.forEach((q) => {
    addCard(slide, {
      x: q[2],
      y: q[3],
      w: 4.9,
      h: 1.55,
      kicker: q[0],
      title: q[1],
      fill: q[4],
      line: C.line,
      kickerColor: q[5],
      titleSize: 17,
      titleH: 0.46,
      shadow: false,
    });
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addSectionBreak(
    slide,
    15,
    "길찾아가기",
    "좋은 툴보다 먼저\n좋은 길 설계가 필요하다",
    "출발지점이 어디인지, 목표지점이 무엇인지,\n그리고 어떤 이동수단이 맞는지를 구분해야 한다."
  );
  addCard(slide, {
    x: 8.18,
    y: 1.46,
    w: 4.12,
    h: 4.18,
    kicker: "핵심 질문",
    title: "지금 나는 어디에 있고\n어디로 가려는가",
    body: "출발지점\n목표지점\n이동수단\n운용 기준\n\n이 네 가지가 정리되면 도구는 훨씬 덜 헷갈린다.",
    fill: C.darkCard,
    line: "567487",
    kickerColor: "D4E0E6",
    titleColor: C.white,
    bodyColor: "E3EDF3",
    bodySize: 13.1,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 16, "이동수단 지도");
  addTitle(slide, "어떤 장면에 어떤 이동수단이 맞는가", "브랜드보다 목적을 먼저 보고, 그 목적에 맞는 도구를 배치한다.");
  const modes = [
    ["일반 LLM", "생각 열기\n초안\n구조화", C.bgAlt],
    ["소스 기반 AI", "자료 기반 이해\n비교\n검토", C.blueSoft],
    ["딥리서치", "외부 흐름 조사\n최신 정보 탐색", C.sandSoft],
    ["에이전트형 AI", "여러 단계 연결\n흐름 설계", C.greenSoft],
    ["생성 서비스", "화면\n덱\n이미지\n영상 초안", C.coralSoft],
  ];
  modes.forEach((item, i) => {
    addCard(slide, {
      x: 0.9 + i * 2.46,
      y: 2.3,
      w: 2.12,
      h: 3.35,
      title: item[0],
      body: item[1],
      fill: item[2],
      line: C.line,
      titleSize: 16,
      bodyY: 1.06,
      bodySize: 12.3,
    });
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 17, "종합실습");
  addTitle(slide, "내 업무 장면 하나를 끝까지 설계해보기", "앞에서 만든 조각들을 하나로 묶어 자기 업무 적용안으로 완성한다.");
  addCard(slide, {
    x: 0.98,
    y: 2.1,
    w: 3.45,
    h: 3.92,
    kicker: "1",
    title: "장면과 진짜 결과",
    body: "조금 더 수월해지고 싶은 장면\n내가 진짜 원하는 결과",
    fill: C.bgAlt,
    line: C.line,
  });
  addCard(slide, {
    x: 4.72,
    y: 2.1,
    w: 3.0,
    h: 3.92,
    kicker: "2",
    title: "CRAFTO",
    body: "Context\nRole\nAudience\nFormat\nTone\nOption",
    fill: C.blueSoft,
    line: "CBDCE5",
  });
  addCard(slide, {
    x: 8.0,
    y: 2.1,
    w: 4.28,
    h: 3.92,
    kicker: "3",
    title: "운용",
    body: "AI 인터뷰 요청문\n10-80-10\n1-3-1\n피드백 포인트\n이동수단 조합",
    fill: C.greenSoft,
    line: "C7D7CB",
    kickerColor: C.green,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 18, "종합실습");
  addTitle(slide, "종합실습은 이 순서로 쓴다", "막히지 않게 하기 위해, 아래 순서대로 짧게 채운다.");
  slide.addText(bulletRuns([
    "1. 내 업무 장면을 한 문장으로 쓴다",
    "2. 진짜 원하는 결과를 다시 확인한다",
    "3. CRAFTO를 짧게 채운다",
    "4. AI에게 먼저 시킬 인터뷰 요청문을 쓴다",
    "5. 10-80-10과 1-3-1로 역할과 선택을 정리한다",
    "6. 피드백 포인트와 이동수단 조합을 적는다",
  ], C.ink, 14.2, 6), {
    x: 1.02,
    y: 2.2,
    w: 6.45,
    h: 3.85,
    fontFace: FONT_FAMILY,
    margin: 0,
    color: C.ink,
    valign: "top",
  });
  addCard(slide, {
    x: 8.0,
    y: 2.22,
    w: 4.28,
    h: 3.78,
    kicker: "마지막 체크",
    title: "내가 직접 판단할 것은 무엇인가",
    body: "이 항목이 비어 있으면,\nAI가 너무 많은 것을 대신하게 된 것이다.\n\n종합실습의 마지막은 항상\n‘사람이 직접 잡아야 할 판단’으로 닫는다.",
    fill: C.sandSoft,
    line: C.line,
    titleSize: 18,
    bodySize: 13,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 19, "정리");
  addQuote(
    slide,
    "AI를 잘 쓴다는 것은 답을 빨리 받는 것이 아니라,\n목적을 분명히 하고, AI와 함께 더 나은 판단에 도달하는 것이다.",
    "오늘 가져갈 한 문장"
  );
  addCard(slide, {
    x: 2.08,
    y: 4.7,
    w: 9.18,
    h: 1.02,
    kicker: "적용 선언",
    title: "내일부터 AI에게 바로 답 대신 먼저 요청할 것은 무엇인가",
    fill: C.white,
    line: C.line,
    kickerColor: C.blue,
    titleColor: C.ink,
    titleSize: 16,
    titleH: 0.34,
    shadow: false,
  });
  finalizeSlide(slide);
}

async function main() {
  ensureDir(path.join(__dirname, "output"));
  buildSlides();
  const outputFile = path.join(
    __dirname,
    "output",
    "생성형AI_기초활용역량_실전강의슬라이드.pptx"
  );
  await pptx.writeFile({ fileName: outputFile });
  console.log(`Wrote deck to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
