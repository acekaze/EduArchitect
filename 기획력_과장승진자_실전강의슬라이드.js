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
pptx.subject = "FST 과장 승진자 기획력 실전 강의 슬라이드";
pptx.title = "FST 과장 승진자 기획력";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: FONT_FAMILY,
  bodyFontFace: FONT_FAMILY,
  lang: "ko-KR",
};

const C = {
  paper: "F4EFE5",
  paperAlt: "FBF8F2",
  ink: "1B2530",
  dark: "152330",
  navy: "17384E",
  blue: "2C6B88",
  blueSoft: "E3EEF4",
  green: "6E8C74",
  greenSoft: "E7EFE8",
  coral: "D97C60",
  coralSoft: "F4E6DF",
  gold: "B9934B",
  line: "D8D1C5",
  white: "FFFFFF",
  slate: "64707A",
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
    minFontSize: extra.minFontSize || 12,
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
  slide.background = { color: dark ? C.navy : C.paper };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.09,
    line: { color: dark ? C.coral : C.gold, transparency: 100 },
    fill: { color: dark ? C.coral : C.gold },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.72,
    y: 6.95,
    w: 11.9,
    h: 0,
    line: { color: dark ? "5B778A" : C.line, width: 1 },
  });
  slide.addText(section, {
    x: 0.72,
    y: 0.32,
    w: 5.2,
    h: 0.22,
    fontFace: FONT_FAMILY,
    fontSize: 10.5,
    bold: true,
    color: dark ? "D8E5EC" : C.blue,
    margin: 0,
  });
  slide.addText(String(index).padStart(2, "0"), {
    x: 12.0,
    y: 0.28,
    w: 0.6,
    h: 0.24,
    fontFace: FONT_FAMILY,
    fontSize: 11,
    bold: true,
    align: "right",
    color: dark ? "D8E5EC" : C.slate,
    margin: 0,
  });
  slide.addText("FST Planning Mindset", {
    x: 0.72,
    y: 7.0,
    w: 3.1,
    h: 0.18,
    fontFace: FONT_FAMILY,
    fontSize: 9,
    color: dark ? "D8E5EC" : C.slate,
    margin: 0,
  });
}

function addTitle(slide, title, subtitle, dark = false) {
  slide.addText(
    title,
    textOpts(title, 0.94, 0.86, 8.8, 0.84, {
      fontSize: 29,
      minFontSize: 23,
      maxFontSize: 31,
      bold: true,
      color: dark ? C.white : C.dark,
    })
  );
  if (subtitle) {
    slide.addText(
      subtitle,
      textOpts(subtitle, 0.96, 1.72, 8.2, 0.28, {
        fontSize: 14,
        minFontSize: 12,
        maxFontSize: 16,
        color: dark ? "D8E5EC" : C.slate,
      })
    );
  }
}

function addCard(slide, cfg) {
  const titleSize = cfg.titleSize || 18;
  const bodySize = cfg.bodySize || 13;
  const bodyY = cfg.bodyY !== undefined ? cfg.bodyY : 1.08;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: cfg.h,
    rectRadius: 0.08,
    line: { color: cfg.line || C.line, width: cfg.lineWidth || 1 },
    fill: { color: cfg.fill || C.paperAlt },
    shadow: cfg.shadow === false ? undefined : safeOuterShadow("21303A", 0.12, 45, 1, 1),
  });
  if (cfg.kicker) {
    slide.addText(cfg.kicker, {
      x: cfg.x + 0.24,
      y: cfg.y + 0.18,
      w: cfg.w - 0.48,
      h: 0.18,
      fontFace: FONT_FAMILY,
      fontSize: 9.5,
      bold: true,
      color: cfg.kickerColor || C.blue,
      margin: 0,
    });
  }
  if (cfg.title) {
    slide.addText(
      cfg.title,
      textOpts(cfg.title, cfg.x + 0.24, cfg.y + 0.4, cfg.w - 0.48, 0.54, {
        fontSize: titleSize,
        minFontSize: cfg.titleMinSize || Math.min(titleSize, 13),
        maxFontSize: titleSize,
        bold: true,
        color: cfg.titleColor || C.dark,
      })
    );
  }
  if (cfg.body) {
    slide.addText(
      cfg.body,
      textOpts(cfg.body, cfg.x + 0.24, cfg.y + bodyY, cfg.w - 0.48, cfg.h - bodyY - 0.24, {
        fontSize: bodySize,
        minFontSize: cfg.bodyMinSize || Math.min(bodySize, 10.5),
        maxFontSize: bodySize,
        color: cfg.bodyColor || C.ink,
        valign: "top",
      })
    );
  }
}

function bulletRuns(items, color = C.ink, size = 15, paraSpaceAfter = 8) {
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

function addPromptColumns(slide, prompts, y = 2.3, h = 2.65) {
  const gap = 0.28;
  const cardW = (11.45 - gap * (prompts.length - 1)) / prompts.length;
  prompts.forEach((prompt, i) => {
    addCard(slide, {
      x: 0.94 + i * (cardW + gap),
      y,
      w: cardW,
      h,
      kicker: prompt.kicker,
      title: prompt.title,
      body: prompt.body,
      fill: prompt.fill,
      line: prompt.line,
      kickerColor: prompt.kickerColor,
      titleColor: prompt.titleColor,
      bodyColor: prompt.bodyColor,
      bodySize: prompt.bodySize || 12.5,
      titleSize: prompt.titleSize || 18,
      bodyY: prompt.bodyY,
    });
  });
}

function addSectionBreak(slide, index, section, title, body, sideTitle, sideBody) {
  addBase(slide, index, section, true);
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.96,
    y: 1.18,
    w: 0.14,
    h: 4.75,
    line: { color: C.coral, transparency: 100 },
    fill: { color: C.coral },
  });
  slide.addText(
    title,
    textOpts(title, 1.36, 1.35, 6.3, 1.12, {
      fontSize: 31,
      minFontSize: 24,
      maxFontSize: 32,
      bold: true,
      color: C.white,
    })
  );
  slide.addText(
    body,
    textOpts(body, 1.4, 2.7, 5.8, 1.5, {
      fontSize: 15,
      minFontSize: 12,
      maxFontSize: 16,
      color: "D8E5EC",
    })
  );
  addCard(slide, {
    x: 8.22,
    y: 1.48,
    w: 4.15,
    h: 3.9,
    kicker: "오후의 중심 질문",
    title: sideTitle,
    body: sideBody,
    fill: "21495F",
    line: "557B8E",
    kickerColor: "BDD5E0",
    titleColor: C.white,
    bodyColor: "E4EEF4",
    bodySize: 13,
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
  addBase(slide, 1, "FST 과장 승진자 과정", true);
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.96,
    y: 1.04,
    w: 0.15,
    h: 5.3,
    line: { color: C.coral, transparency: 100 },
    fill: { color: C.coral },
  });
  slide.addText(
    "기획력",
    textOpts("기획력", 1.38, 1.22, 3.4, 0.8, {
      fontSize: 32,
      minFontSize: 26,
      maxFontSize: 34,
      bold: true,
      color: C.white,
    })
  );
  slide.addText(
    "신임 과장이 조직의 기대를 읽고\n사람과 일을 연결해 결과를 만드는 사고",
    textOpts("신임 과장이 조직의 기대를 읽고\n사람과 일을 연결해 결과를 만드는 사고", 1.4, 2.24, 4.9, 1.1, {
      fontSize: 17,
      minFontSize: 13,
      maxFontSize: 18,
      color: "DCE8EF",
    })
  );
  addCard(slide, {
    x: 7.1,
    y: 1.25,
    w: 5.12,
    h: 4.85,
    kicker: "오늘의 약속",
    title: "문서를 예쁘게 만드는 법보다\n과장의 역할 전환을 먼저 다룬다",
    body:
      "기획력은 포맷을 많이 아는 힘이 아니다.\n조직이 나에게 무엇을 기대하는지 이해하고,\n상사의 요구를 팀이 움직일 수 있는 언어로 바꾸며,\n제한된 자원 안에서 결과를 만드는 힘이다.\n\n오늘은 그 사고와 구조를 현업 장면까지 연결한다.",
    fill: "21495F",
    line: "557B8E",
    kickerColor: "C3D7E0",
    titleColor: C.white,
    bodyColor: "E4EEF4",
    titleSize: 20,
    bodySize: 13.1,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 2, "오프닝");
  addTitle(slide, "오늘의 질문", "지금부터 볼 기획력은 문서 스킬보다 역할 해석에 가깝다.");
  addPromptColumns(slide, [
    {
      kicker: "Question 1",
      title: "과장이 된다는 것은 무슨 의미인가",
      body: "일만 늘어난 자리가 아니라,\n상사와 팀원 사이를 번역하는 자리가 되었다는 뜻이다.",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "Question 2",
      title: "조직은 지금 과장에게 무엇을 기대하는가",
      body: "단순 실행이 아니라 판단, 정리, 협업, 방향 제시를 기대한다.",
      fill: C.blueSoft,
      line: "CBDCE5",
    },
    {
      kicker: "Question 3",
      title: "나는 팀에 어떤 경험을 남기고 있는가",
      body: "내 말과 지시는 팀을 선명하게 하는가, 더 막막하게 하는가.",
      fill: C.coralSoft,
      line: "E6C9BC",
      kickerColor: C.coral,
    },
  ]);
  slide.addText(
    "오늘의 핵심은 더 많이 일하는 법이 아니라, 더 정확히 해석하고 연결하는 법이다.",
    textOpts("오늘의 핵심은 더 많이 일하는 법이 아니라, 더 정확히 해석하고 연결하는 법이다.", 0.96, 5.62, 9.6, 0.36, {
      fontSize: 18,
      minFontSize: 15,
      maxFontSize: 19,
      bold: true,
      color: C.dark,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 3, "Visual Explorer");
  addTitle(slide, "Visual Explorer", "이미지 질문으로 현재 상태와 기대 역할을 먼저 열고, 디브리핑으로 역할 인식을 분명히 한다.");
  addPromptColumns(slide, [
    {
      kicker: "질문 1",
      title: "FST의 이상적인 과장을 가장 잘 나타내는 이미지는 무엇인가",
      body: "왜 그 이미지를 골랐는가\n그 이미지 안의 힘은 무엇인가",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "질문 2",
      title: "지금 우리 조직을 가장 잘 보여주는 이미지는 무엇인가",
      body: "그 안에서 나는 어떤 모습으로 보이고 있는가",
      fill: C.blueSoft,
      line: "CBDCE5",
    },
    {
      kicker: "질문 3",
      title: "내가 앞으로 팀에 제공하고 싶은 경험은 무엇인가",
      body: "신뢰, 선명함, 속도, 연결 중 무엇을 더 주고 싶은가",
      fill: C.greenSoft,
      line: "C7D7CB",
      kickerColor: C.green,
    },
  ], 2.25, 2.9);
  slide.addText(
    "디브리핑 질문: 왜 그 이미지를 골랐는가 / 그 안에서 지금 나는 어디에 있는가 / 앞으로 어떤 모습으로 이동해야 하는가",
    textOpts("디브리핑 질문: 왜 그 이미지를 골랐는가 / 그 안에서 지금 나는 어디에 있는가 / 앞으로 어떤 모습으로 이동해야 하는가", 0.96, 5.58, 10.6, 0.34, {
      fontSize: 13.5,
      minFontSize: 11,
      maxFontSize: 14,
      italic: true,
      color: C.slate,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 4, "하루 흐름");
  addTitle(slide, "09:00-17:00 운영 흐름", "질문, 자기 인식, 구조, 실습, 현업 적용의 순서로 간다.");
  const timeline = [
    ["09:00-09:40", "오프닝", "과장이 된다는 것의 의미", C.paperAlt],
    ["09:40-12:25", "오전", "왜 기획력인가\n현재 수준\n사람과 맥락", C.blueSoft],
    ["13:25-15:25", "오후 1", "기획의 구조\n듣기와 전달", C.greenSoft],
    ["15:40-17:00", "오후 2", "팀 미션 실습\nAI 연결\n마무리", C.coralSoft],
  ];
  timeline.forEach((item, i) => {
    addCard(slide, {
      x: 0.96 + i * 3.02,
      y: 2.18,
      w: 2.75,
      h: 3.75,
      kicker: item[0],
      title: item[1],
      body: item[2],
      fill: item[3],
      line: C.line,
      bodySize: 12.6,
    });
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 5, "역할 전환");
  addTitle(slide, "플레이어에서 번역자로", "과장이 되면 잘하는 사람이 아니라 연결하는 사람이 되어야 한다.");
  addCard(slide, {
    x: 0.96,
    y: 2.1,
    w: 3.35,
    h: 3.7,
    kicker: "Player",
    title: "플레이어",
    body: "내가 맡은 일을 잘 끝낸다\n내 성과와 속도에 집중한다\n내 전문성으로 인정받는다",
    fill: C.paperAlt,
    line: C.line,
  });
  addCard(slide, {
    x: 4.95,
    y: 2.1,
    w: 3.45,
    h: 3.7,
    kicker: "Manager",
    title: "과장",
    body: "상사의 기대를 이해한다\n팀원이 움직일 수 있게 풀어 준다\n협업의 언어를 정리한다",
    fill: C.blueSoft,
    line: "CBDCE5",
  });
  addCard(slide, {
    x: 9.02,
    y: 2.1,
    w: 3.32,
    h: 3.7,
    kicker: "Translator",
    title: "번역자",
    body: "위의 요구를 아래의 실행으로 바꾼다\n현장의 문제를 조직의 언어로 바꾼다\n의미를 구조로 바꾼다",
    fill: C.coralSoft,
    line: "E6C9BC",
    kickerColor: C.coral,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 6, "왜 기획력인가");
  addTitle(slide, "왜 지금 과장에게 기획력이 필요한가", "조직은 과장에게 단순 실행이 아니라 판단과 연결을 기대한다.");
  slide.addText(bulletRuns([
    "과장은 상사의 기대를 해석해야 한다",
    "과장은 팀원이 움직일 수 있는 구조를 만들어야 한다",
    "과장은 협업부서가 납득할 수 있는 언어를 준비해야 한다",
    "과장은 제한된 자원 안에서 우선순위를 정해야 한다",
  ], C.ink, 15), {
    x: 0.98,
    y: 2.15,
    w: 5.8,
    h: 3.8,
    fontFace: FONT_FAMILY,
    margin: 0,
    color: C.ink,
    valign: "top",
  });
  addCard(slide, {
    x: 7.02,
    y: 2.1,
    w: 5.24,
    h: 3.9,
    kicker: "Definition",
    title: "과장의 기획력은\n문서를 예쁘게 만드는 힘이 아니다",
    body: "조직이 나에게 무엇을 기대하는지 이해하고,\n이를 이루기 위한 전략적 사고를 거쳐,\n말과 글로 성과를 만들며 나의 가치를 높이는 힘이다.",
    fill: C.greenSoft,
    line: "C7D7CB",
    kickerColor: C.green,
    bodySize: 13.2,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 7, "Result Pyramid");
  addTitle(slide, "결과는 행동에서, 행동은 믿음에서, 믿음은 경험에서 나온다", "그래서 과장은 팀과 협업부서에 어떤 경험을 주고 있는지 먼저 봐야 한다.");
  const chain = [
    { x: 0.96, title: "경험", body: "회의\n지시\n피드백\n설명", fill: C.paperAlt },
    { x: 3.25, title: "믿음", body: "해볼 만하다\n중요하게 다뤄진다", fill: C.blueSoft },
    { x: 5.54, title: "행동", body: "움직인다\n협력한다", fill: C.greenSoft },
    { x: 7.83, title: "결과", body: "속도\n실행력\n성과", fill: C.coralSoft },
  ];
  chain.forEach((item, idx) => {
    addCard(slide, {
      x: item.x,
      y: 2.55,
      w: 1.98,
      h: 2.0,
      title: item.title,
      body: item.body,
      fill: item.fill,
      line: C.line,
      titleSize: 20,
      bodyY: 0.94,
      bodySize: 12.3,
    });
    if (idx < chain.length - 1) {
      slide.addShape(pptx.ShapeType.chevron, {
        x: item.x + 2.01,
        y: 3.16,
        w: 0.18,
        h: 0.54,
        line: { color: C.gold, transparency: 100 },
        fill: { color: C.gold },
      });
    }
  });
  slide.addText(
    "과장의 말은 정보 전달이 아니라 경험 제공이다.",
    textOpts("과장의 말은 정보 전달이 아니라 경험 제공이다.", 0.98, 5.35, 5.7, 0.34, {
      fontSize: 18,
      minFontSize: 15,
      maxFontSize: 18,
      bold: true,
      color: C.dark,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 8, "관점 전환");
  addTitle(slide, "Victim에서 Owner로", "억울함을 느끼는 것은 이해되지만, 거기서 멈추면 과장의 기획은 시작되지 않는다.");
  addCard(slide, {
    x: 0.96,
    y: 2.08,
    w: 5.38,
    h: 3.95,
    kicker: "Victim Mode",
    title: "왜 우리만 힘든가\n왜 위에서는 이것을 모르나",
    body: "일이 늘어난다\n애매한 책임이 많다\n바뀌는 것은 없고 고생만 한다는 느낌이 든다",
    fill: C.coralSoft,
    line: "E6C9BC",
    kickerColor: C.coral,
  });
  addCard(slide, {
    x: 6.72,
    y: 2.08,
    w: 5.54,
    h: 3.95,
    kicker: "Owner Question",
    title: "그럼 여기서 내가 바꿀 수 있는 것은 무엇인가",
    body: "무엇이 중요한지 정리할 수 있는가\n누구의 질문부터 풀어야 하는가\n팀이 움직일 수 있게 무엇을 번역해야 하는가",
    fill: C.blueSoft,
    line: "CBDCE5",
    bodySize: 13.2,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 9, "기획의 언어");
  addTitle(slide, "보고, 제안, 설득은 어떻게 다른가", "과장은 세 가지 언어를 모두 다룰 줄 알아야 한다.");
  addPromptColumns(slide, [
    {
      kicker: "보고",
      title: "이해시키는 언어",
      body: "상황을 정확하게 알린다\n객관성과 정확성이 중요하다",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "제안",
      title: "가능성을 여는 언어",
      body: "이렇게 해보면 어떨까요\n문제 해결과 방향 제시가 핵심이다",
      fill: C.blueSoft,
      line: "CBDCE5",
    },
    {
      kicker: "설득",
      title: "행동을 만드는 언어",
      body: "상대가 왜 움직여야 하는지 납득하게 만든다",
      fill: C.greenSoft,
      line: "C7D7CB",
      kickerColor: C.green,
    },
  ], 2.32, 2.95);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 10, "수준 자각");
  addTitle(slide, "나는 어느 정도의 수준을 가지고 있는가", "점수가 낮은 것이 문제가 아니라, 현재 위치를 모르는 것이 더 큰 문제다.");
  const levels = [
    "Step 1 이제 시작, 배울 준비가 되어 있다",
    "Step 2 시간이 걸리고 수정이 많다",
    "Step 3 초안을 빠르게 만들 수 있다",
    "Step 4 자료 축적과 상황별 대응이 가능하다",
    "Step 5 구조화가 가능하고 조직이 원하는 것을 안다",
    "Step 6 요약, 정리, 코칭까지 가능하다",
  ];
  slide.addText(bulletRuns(levels, C.ink, 14, 7), {
    x: 0.98,
    y: 2.02,
    w: 7.3,
    h: 4.4,
    fontFace: FONT_FAMILY,
    margin: 0,
    color: C.ink,
    valign: "top",
  });
  addCard(slide, {
    x: 8.62,
    y: 2.08,
    w: 3.66,
    h: 3.95,
    kicker: "과장에게 필요한 기준",
    title: "빠른 초안\n구조화\n상대 기대 이해\n실행 정리",
    body: "이제는 ‘열심히 했다’보다\n‘상대가 이해하고 움직였는가’가 더 중요해진다.",
    fill: C.coralSoft,
    line: "E6C9BC",
    kickerColor: C.coral,
    bodySize: 13,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 11, "사람과 맥락");
  addTitle(slide, "좋은 기획은 결국 사람 이해에서 시작된다", "WHO와 WHY를 놓치면 내 방식만 선명한 기획이 되기 쉽다.");
  addPromptColumns(slide, [
    {
      kicker: "WHO",
      title: "나는 누구와 일할 때 기획이 자주 꼬이는가",
      body: "상사, 협업부서, 팀원 중 누구와 일할 때 가장 많이 막히는가",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "WHY",
      title: "나는 그 사람의 어떤 질문을 자주 놓치는가",
      body: "왜, 무엇, 어떻게, 그리고 나면 무엇이 달라지는가",
      fill: C.blueSoft,
      line: "CBDCE5",
    },
    {
      kicker: "관계 해석",
      title: "함께 일하기 편한 사람과 불편한 사람은 누구인가",
      body: "왜 그렇게 느끼는가\n그 답답함 속에 내 기획 언어의 한계는 없는가",
      fill: C.greenSoft,
      line: "C7D7CB",
      kickerColor: C.green,
    },
  ], 2.3, 2.95);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 12, "4MAT");
  addTitle(slide, "나는 어떤 질문에 치우쳐 있는가", "정식 진단보다, 내가 먼저 보는 관점과 자주 놓치는 관점을 확인하는 데 쓴다.");
  addPromptColumns(slide, [
    {
      kicker: "WHY",
      title: "왜 이 일을 해야 하지",
      body: "의미, 맥락, 필요성에 민감하다",
      fill: C.blueSoft,
      line: "CBDCE5",
    },
    {
      kicker: "WHAT",
      title: "그래서 무엇을 해야 하지",
      body: "핵심 내용, 구조, 정리에 민감하다",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "HOW",
      title: "어떻게 실행하지",
      body: "일정, 자원, 역할, 운영에 민감하다",
      fill: C.greenSoft,
      line: "C7D7CB",
      kickerColor: C.green,
    },
    {
      kicker: "IF",
      title: "하고 나면 무엇이 달라지지",
      body: "효과, 개선, 다음 가능성에 민감하다",
      fill: C.coralSoft,
      line: "E6C9BC",
      kickerColor: C.coral,
    },
  ], 2.36, 2.9);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addSectionBreak(
    slide,
    13,
    "오후 시작",
    "기획의 구조를\n현업 언어로 번역한다",
    "왜 해야 하는지, 무엇을 해야 하는지,\n어떻게 실행하는지, 하고 나면 무엇이 달라지는지를\n과장의 언어로 다시 세운다.",
    "과장은 실행자가 아니라 해석자이자 구조 설계자다",
    "상사에게 받은 지시를 팀원이 움직일 수 있는 말과 계획으로 바꾸는 힘이 과장의 기획력이다."
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 14, "구조 전체");
  addTitle(slide, "기획의 구조", "생각이 없어서가 아니라 순서가 없어서 기획이 막힐 때가 많다.");
  const cycle = [
    { title: "Why", body: "왜 해야 하나", fill: C.blueSoft },
    { title: "What", body: "무엇을 해야 하나", fill: C.paperAlt },
    { title: "How", body: "어떻게 실행하나", fill: C.greenSoft },
    { title: "If", body: "하고 나면 무엇이 달라지나", fill: C.coralSoft },
  ];
  cycle.forEach((item, i) => {
    addCard(slide, {
      x: 0.96 + i * 3.02,
      y: 2.46,
      w: 2.76,
      h: 2.9,
      title: item.title,
      body: item.body,
      fill: item.fill,
      line: C.line,
      titleSize: 22,
      bodyY: 1.06,
      bodySize: 13.2,
    });
  });
  slide.addText(
    "특히 과장은 How부터 말하는 실수를 가장 자주 한다.",
    textOpts("특히 과장은 How부터 말하는 실수를 가장 자주 한다.", 0.98, 5.7, 7.8, 0.28, {
      fontSize: 15,
      minFontSize: 12,
      maxFontSize: 15,
      italic: true,
      color: C.slate,
    })
  );
  slide.addText(
    "대표 오류: Why 없이 지시한다 / What 없이 자료만 던진다 / If 없이 결론만 말하고 끝낸다",
    textOpts("대표 오류: Why 없이 지시한다 / What 없이 자료만 던진다 / If 없이 결론만 말하고 끝낸다", 0.98, 6.03, 9.8, 0.28, {
      fontSize: 13.5,
      minFontSize: 11,
      maxFontSize: 14,
      italic: true,
      color: C.slate,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 15, "Why");
  addTitle(slide, "Why | 왜 지금 이 일을 해야 하는가", "맥락과 의미가 없으면 시키는 일처럼 들린다.");
  addPromptColumns(slide, [
    {
      kicker: "Question",
      title: "이 일은 왜 필요한가",
      body: "무슨 문제를 해결하려는가\n왜 지금 해야 하는가",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "Target",
      title: "누구에게 어떤 의미가 있는가",
      body: "상사, 팀원, 협업부서, 고객 중 누구의 질문을 먼저 풀어야 하는가",
      fill: C.blueSoft,
      line: "CBDCE5",
    },
    {
      kicker: "Tip",
      title: "내 입장보다 상대 입장에서 연다",
      body: "청중 입장에서 ‘이건 들어볼 이유가 있다’가 먼저 생겨야 한다",
      fill: C.coralSoft,
      line: "E6C9BC",
      kickerColor: C.coral,
    },
  ], 2.28, 3.0);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 16, "What");
  addTitle(slide, "What | 그래서 무엇을 하려는가", "메시지가 흩어지지 않도록, 한 문장으로 먼저 잡는다.");
  addCard(slide, {
    x: 0.98,
    y: 2.08,
    w: 5.18,
    h: 3.9,
    kicker: "핵심 질문",
    title: "결국 내가 남기고 싶은 한 문장은 무엇인가",
    body: "핵심이 한 문장으로 안 잡히면,\n자료는 많아도 기획은 약해진다.\n\n내가 끝까지 지켜야 할 문장을 먼저 세워라.",
    fill: C.paperAlt,
    line: C.line,
    bodySize: 13.2,
  });
  addCard(slide, {
    x: 6.54,
    y: 2.08,
    w: 5.72,
    h: 3.9,
    kicker: "예시",
    title: "이번 변화의 목적은 통제를 늘리기보다\n판단의 기준을 하나로 맞추는 데 있다",
    body: "우리가 회복해야 하는 것은 속도가 아니라 협업의 신뢰다\n이번 프로젝트의 핵심은 일의 양이 아니라 우선순위의 선명함이다",
    fill: C.blueSoft,
    line: "CBDCE5",
    bodySize: 13,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 17, "How");
  addTitle(slide, "How | 실행은 설명이 아니라 설계다", "누가, 언제, 무엇으로, 어떻게를 말해야 팀이 움직일 수 있다.");
  addPromptColumns(slide, [
    {
      kicker: "사람",
      title: "누가",
      body: "역할과 책임이 분명한가",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "시간",
      title: "언제",
      body: "일정과 체크포인트가 보이는가",
      fill: C.greenSoft,
      line: "C7D7CB",
      kickerColor: C.green,
    },
    {
      kicker: "자원",
      title: "무엇으로",
      body: "필요 인력, 예산, 자료, 협조가 정리되었는가",
      fill: C.blueSoft,
      line: "CBDCE5",
    },
    {
      kicker: "방법",
      title: "어떻게",
      body: "실행 순서와 운영 방식이 보이는가",
      fill: C.coralSoft,
      line: "E6C9BC",
      kickerColor: C.coral,
    },
  ], 2.34, 2.95);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 18, "If");
  addTitle(slide, "If | 하고 나면 무엇이 달라지는가", "기대효과와 다음 가능성이 보이면 설득은 훨씬 쉬워진다.");
  addCard(slide, {
    x: 0.98,
    y: 2.14,
    w: 11.28,
    h: 3.82,
    kicker: "질문 예시",
    title: "성공하면 무엇이 달라지는가\n만약 잘 안 되면 무엇을 다시 봐야 하는가",
    body: "우리 팀에는 어떤 긍정적 변화가 생기는가\n이해관계자에게는 어떤 의미가 생기는가\n개선한다면 무엇을 더 보완할 것인가\n새롭게 연결될 가능성은 무엇인가",
    fill: C.greenSoft,
    line: "C7D7CB",
    kickerColor: C.green,
    titleSize: 22,
    bodySize: 14,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 19, "듣기");
  addTitle(slide, "상사의 지시를 기획적으로 듣는 법", "받아 적는 수준이 아니라, 맥락을 읽고 자기화해야 한다.");
  slide.addText(bulletRuns([
    "맥락 읽기: 왜 나에게 이런 지시가 왔는가",
    "문장 읽기: 그래서 지금 정확히 무엇을 말하는가",
    "핵심 정리: 핵심적으로 정리하면 무엇인가",
    "피드백: 제가 이해한 것이 맞는가",
    "자기화: 나는 이 과제를 어떻게 수행할 것인가",
  ], C.ink, 15), {
    x: 0.98,
    y: 2.08,
    w: 6.4,
    h: 3.95,
    fontFace: FONT_FAMILY,
    margin: 0,
    color: C.ink,
    valign: "top",
  });
  addCard(slide, {
    x: 7.7,
    y: 2.14,
    w: 4.56,
    h: 3.85,
    kicker: "실수 포인트",
    title: "말은 들었는데 맥락은 놓치는 경우",
    body: "일의 배경을 모르고 받는다\n기대 결과를 확인하지 않는다\n내가 이해한 내용을 되돌려 말하지 않는다",
    fill: C.coralSoft,
    line: "E6C9BC",
    kickerColor: C.coral,
    bodySize: 13,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 20, "전달");
  addTitle(slide, "팀원에게는 어떻게 번역해 전달할 것인가", "좋은 과장은 지시를 복사하지 않고, 실행 가능한 구조로 바꾼다.");
  slide.addText(bulletRuns([
    "맥락 설명: 왜 이런 프로젝트를 하는가",
    "기대 결과: 무엇이 나오면 되는가",
    "업무 스케줄: 언제까지 무엇을 맞추면 되는가",
    "특이사항: 무엇은 빼고 무엇에 집중해야 하는가",
    "노하우와 자료: 어디를 보면 되는가, 누구에게 물어보면 되는가",
  ], C.ink, 15), {
    x: 0.98,
    y: 2.08,
    w: 6.35,
    h: 3.95,
    fontFace: FONT_FAMILY,
    margin: 0,
    color: C.ink,
    valign: "top",
  });
  addCard(slide, {
    x: 7.72,
    y: 2.12,
    w: 4.54,
    h: 3.9,
    kicker: "핵심",
    title: "같은 지시도 과장을 거치면 더 선명해져야 한다",
    body: "상사의 말을 그대로 전달하는 것은 중계다.\n맥락과 기대를 정리해 팀이 움직일 수 있게 만드는 것이 과장의 전달이다.",
    fill: C.blueSoft,
    line: "CBDCE5",
    bodySize: 13.2,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 21, "팀 미션");
  addTitle(slide, "Team Mission", "상사-과장-팀원 역할로 브리핑과 기획 재구성을 실습한다.");
  addCard(slide, {
    x: 0.98,
    y: 2.06,
    w: 6.18,
    h: 3.95,
    kicker: "상사 브리프",
    title: "우리 조직 팀 빌딩 프로그램을 하자",
    body:
      "조직원들끼리 갈등이 있어 보인다\n각자 일은 잘 하지만 소통이 안 되고 분위기도 좋지 않다\n완전히 바뀌진 않아도 갈등이 풀리는 시작이 되길 바란다\n술자리 중심 회식은 제외하고 싶다\n외부 이미지로도 괜찮아 보이는 프로그램이면 좋겠다",
    fill: C.paperAlt,
    line: C.line,
    bodySize: 12.5,
  });
  addCard(slide, {
    x: 7.52,
    y: 2.06,
    w: 4.72,
    h: 3.95,
    kicker: "과장 역할",
    title: "해야 할 일",
    body: "맥락을 다시 묻는다\n기대 결과를 정리한다\n제외 조건을 확인한다\n팀원에게 실행 구조로 번역한다",
    fill: C.greenSoft,
    line: "C7D7CB",
    kickerColor: C.green,
    bodySize: 13.2,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 22, "산출물");
  addTitle(slide, "실습 산출물은 한 장으로 끝낸다", "많이 쓰는 것보다 구조가 선명한 초안이 더 중요하고, 피드백도 구조 중심으로 준다.");
  addPromptColumns(slide, [
    {
      kicker: "1",
      title: "안건",
      body: "이번에 우리가 다룰 주제는 무엇인가",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "2",
      title: "Why / What",
      body: "왜 필요한가\n무엇을 할 것인가",
      fill: C.blueSoft,
      line: "CBDCE5",
    },
    {
      kicker: "3",
      title: "How / If",
      body: "어떻게 실행할 것인가\n무엇이 달라질 것인가",
      fill: C.greenSoft,
      line: "C7D7CB",
      kickerColor: C.green,
    },
  ], 2.28, 2.9);
  slide.addText(
    "발표는 2분, 피드백은 구조 중심으로 3분.",
    textOpts("발표는 2분, 피드백은 구조 중심으로 3분.", 0.98, 5.63, 5.4, 0.28, {
      fontSize: 14,
      minFontSize: 12,
      maxFontSize: 14,
      italic: true,
      color: C.slate,
    })
  );
  slide.addText(
    "피드백 기준: Why가 상대 문제를 건드리는가 / What이 한 문장으로 남는가 / How가 실행 가능하게 들리는가 / If가 자기화를 만드는가",
    textOpts("피드백 기준: Why가 상대 문제를 건드리는가 / What이 한 문장으로 남는가 / How가 실행 가능하게 들리는가 / If가 자기화를 만드는가", 0.98, 5.95, 10.7, 0.3, {
      fontSize: 13,
      minFontSize: 10.5,
      maxFontSize: 13,
      italic: true,
      color: C.slate,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 23, "문서 기본");
  addTitle(slide, "좋은 보고서와 기획안의 기본", "길게 쓰는 것보다 읽는 사람이 빠르게 이해하게 하는 것이 더 중요하다.");
  addPromptColumns(slide, [
    {
      kicker: "보고서",
      title: "상황을 정확하게 알린다",
      body: "추측을 줄이고 사실과 의견을 구분한다\n긴 문장보다 구조화가 효과적이다",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "기획안",
      title: "당위성과 실행방안을 함께 보여준다",
      body: "왜 필요한가\n무엇을 할 것인가\n어떻게 할 것인가\n무엇이 달라질 것인가",
      fill: C.blueSoft,
      line: "CBDCE5",
    },
    {
      kicker: "공통",
      title: "결론부터, 쉬운 말로, 구조적으로",
      body: "읽는 사람을 생각하며\n불필요한 문장은 빼고\n출처와 근거를 남긴다",
      fill: C.coralSoft,
      line: "E6C9BC",
      kickerColor: C.coral,
    },
  ], 2.28, 2.98);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 24, "AI");
  addTitle(slide, "AI는 기획을 대신하는 도구가 아니다", "질문, 정리, 대안 비교, 허점 점검을 돕는 보조자 정도로 연결한다.");
  addPromptColumns(slide, [
    {
      kicker: "Before",
      title: "회의 전",
      body: "내가 놓친 질문이 없는지 점검한다",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "During",
      title: "초안 작성 중",
      body: "Why-What-How-If 구조가 비어 있지 않은지 본다",
      fill: C.blueSoft,
      line: "CBDCE5",
    },
    {
      kicker: "After",
      title: "작성 후",
      body: "대안 비교, 허점 점검, 표현 정리를 돕게 한다",
      fill: C.greenSoft,
      line: "C7D7CB",
      kickerColor: C.green,
    },
  ], 2.28, 2.9);
  slide.addText(
    "결국 중요한 것은 답을 빨리 뽑는 능력이 아니라 무슨 질문을 던질 줄 아는가이다.",
    textOpts("결국 중요한 것은 답을 빨리 뽑는 능력이 아니라 무슨 질문을 던질 줄 아는가이다.", 0.98, 5.6, 9.4, 0.32, {
      fontSize: 16,
      minFontSize: 13,
      maxFontSize: 16,
      bold: true,
      color: C.dark,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 25, "현업 적용");
  addTitle(slide, "내일 바로 바꿀 것", "학습은 다음 대화 장면을 구체적으로 떠올릴 때 실행으로 바뀐다.");
  addCard(slide, {
    x: 0.98,
    y: 2.1,
    w: 11.28,
    h: 3.88,
    kicker: "Action",
    title: "세 가지만 적는다",
    body:
      "내가 내일 바로 사용할 장면 1개\n그 장면에서 먼저 점검할 질문 1개\n내가 남길 한 문장 1개\n\n과장의 기획은 생각이 아니라 다음 대화에서 증명된다.",
    fill: C.paperAlt,
    line: C.line,
    titleSize: 22,
    bodySize: 14,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 26, "클로징", true);
  slide.addText(
    "과장의 기획력은\n문서를 예쁘게 만드는 힘이 아니다.",
    textOpts("과장의 기획력은\n문서를 예쁘게 만드는 힘이 아니다.", 1.12, 1.42, 5.7, 1.42, {
      fontSize: 27,
      minFontSize: 21,
      maxFontSize: 29,
      bold: true,
      color: C.white,
    })
  );
  slide.addText(
    "사람과 조직의 기대를 더 정확히 이해하고,\n그 기대를 일과 말로 연결해 결국 결과를 만드는 힘이다.",
    textOpts("사람과 조직의 기대를 더 정확히 이해하고,\n그 기대를 일과 말로 연결해 결국 결과를 만드는 힘이다.", 1.16, 3.22, 6.2, 0.96, {
      fontSize: 16,
      minFontSize: 13,
      maxFontSize: 17,
      color: "DCE8EF",
    })
  );
  addCard(slide, {
    x: 8.0,
    y: 1.48,
    w: 4.22,
    h: 3.92,
    kicker: "마지막 질문",
    title: "나는 내일부터\n무엇을 더 잘 해석할 것인가",
    body: "왜 이 일을 해야 하는가\n누구에게 어떤 의미가 있는가\n무엇을 선명하게 남겨야 하는가\n\n그 질문이 바뀌면 과장의 기획도 바뀐다.",
    fill: "21495F",
    line: "557B8E",
    kickerColor: "BDD5E0",
    titleColor: C.white,
    bodyColor: "E4EEF4",
    bodySize: 13.1,
  });
  finalizeSlide(slide);
}

async function main() {
  ensureDir(path.join(__dirname, "output"));
  buildSlides();
  const outputFile = path.join(
    __dirname,
    "output",
    "FST_기획력_과장승진자_실전강의슬라이드.pptx"
  );
  await pptx.writeFile({ fileName: outputFile });
  console.log(`Wrote deck to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
