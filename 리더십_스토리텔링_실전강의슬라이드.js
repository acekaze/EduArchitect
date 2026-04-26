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
pptx.subject = "리더십 스토리텔링 실전 강의 슬라이드";
pptx.title = "리더십 스토리텔링";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: FONT_FAMILY,
  bodyFontFace: FONT_FAMILY,
  lang: "ko-KR",
};

const W = 13.333;
const H = 7.5;

const C = {
  paper: "F6F1E7",
  paperAlt: "FBF8F2",
  ink: "1A2731",
  navy: "17384E",
  blue: "2D6C89",
  coral: "D97C60",
  coralSoft: "F3E5DE",
  mint: "789A8E",
  mintSoft: "E6EFEA",
  gold: "B9934B",
  line: "D7D0C1",
  slate: "64707A",
  white: "FFFFFF",
  dark: "10212C",
  paleBlue: "E4EEF4",
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
    x: 0.7,
    y: 6.95,
    w: 11.9,
    h: 0,
    line: { color: dark ? "5A7688" : C.line, width: 1 },
  });
  slide.addText(section, {
    x: 0.7,
    y: 0.32,
    w: 4.2,
    h: 0.22,
    fontFace: FONT_FAMILY,
    fontSize: 10.5,
    bold: true,
    color: dark ? "D8E5EC" : C.blue,
    margin: 0,
  });
  slide.addText(String(index).padStart(2, "0"), {
    x: 12.05,
    y: 0.28,
    w: 0.55,
    h: 0.24,
    fontFace: FONT_FAMILY,
    fontSize: 11,
    bold: true,
    align: "right",
    color: dark ? "D8E5EC" : C.slate,
    margin: 0,
  });
  slide.addText("Leadership Storytelling", {
    x: 0.7,
    y: 7.0,
    w: 2.9,
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
    textOpts(title, 0.92, 0.88, 8.7, 0.82, {
      fontSize: 29,
      minFontSize: 24,
      maxFontSize: 32,
      bold: true,
      color: dark ? C.white : C.dark,
    })
  );
  if (subtitle) {
    slide.addText(
      subtitle,
      textOpts(subtitle, 0.94, 1.74, 7.6, 0.22, {
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
      textOpts(cfg.title, cfg.x + 0.24, cfg.y + 0.4, cfg.w - 0.48, 0.5, {
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
      textOpts(cfg.body, cfg.x + 0.24, cfg.y + bodyY, cfg.w - 0.48, cfg.h - bodyY - 0.2, {
        fontSize: bodySize,
        minFontSize: cfg.bodyMinSize || Math.min(bodySize, 10.5),
        maxFontSize: bodySize,
        color: cfg.bodyColor || C.ink,
        valign: "top",
      })
    );
  }
}

function bulletRuns(items, color = C.ink, size = 15) {
  return items.map((item) => ({
    text: item,
    options: {
      bullet: { indent: 14 },
      hanging: 3,
      paraSpaceAfter: 8,
      color,
      fontFace: FONT_FAMILY,
      fontSize: size,
    },
  }));
}

function addPromptColumns(slide, prompts, y = 2.3) {
  const gap = 0.28;
  const cardW = (11.45 - gap * (prompts.length - 1)) / prompts.length;
  prompts.forEach((prompt, i) => {
    addCard(slide, {
      x: 0.92 + i * (cardW + gap),
      y,
      w: cardW,
      h: 2.55,
      kicker: prompt.kicker,
      title: prompt.title,
      body: prompt.body,
      fill: prompt.fill,
      line: prompt.line,
      kickerColor: prompt.kickerColor,
      titleColor: prompt.titleColor,
      bodyColor: prompt.bodyColor,
      bodySize: prompt.bodySize || 12.5,
    });
  });
}

function finalizeSlide(slide) {
  warnIfSlideHasOverlaps(slide, pptx, {
    muteContainment: true,
    ignoreDecorativeShapes: true,
  });
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function addSectionBreak(slide, index, label, title, body) {
  addBase(slide, index, label, true);
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.92,
    y: 1.2,
    w: 0.14,
    h: 4.7,
    line: { color: C.coral, transparency: 100 },
    fill: { color: C.coral },
  });
  slide.addText(
    title,
    textOpts(title, 1.35, 1.35, 6.5, 1.05, {
      fontSize: 30,
      minFontSize: 24,
      maxFontSize: 32,
      bold: true,
      color: C.white,
    })
  );
  slide.addText(
    body,
    textOpts(body, 1.38, 2.6, 5.6, 1.4, {
      fontSize: 15,
      minFontSize: 12,
      maxFontSize: 16,
      color: "D8E5EC",
    })
  );
  addCard(slide, {
    x: 8.35,
    y: 1.52,
    w: 4.05,
    h: 3.7,
    kicker: "오후의 중심 질문",
    title: "나는 무엇을 말할 수 있는 사람인가",
    body: "가치와 경험을 통해 리더 메시지의 뿌리를 찾고, 조직 변화 장면에 맞는 한 문장과 구조를 만든다.",
    fill: "20485F",
    line: "547B8F",
    kickerColor: "B9D2DE",
    titleColor: C.white,
    bodyColor: "E3EEF4",
    bodySize: 13,
  });
}

function buildSlides() {
  let slide;

  slide = pptx.addSlide();
  addBase(slide, 1, "리더십 스토리텔링", true);
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.92,
    y: 1.04,
    w: 0.14,
    h: 5.25,
    line: { color: C.coral, transparency: 100 },
    fill: { color: C.coral },
  });
  slide.addText(
    "리더십\n스토리텔링",
    textOpts("리더십\n스토리텔링", 1.34, 1.2, 4.0, 1.6, {
      fontSize: 30,
      minFontSize: 24,
      maxFontSize: 32,
      bold: true,
      color: C.white,
    })
  );
  slide.addText(
    "사람의 마음을 움직여\n변화와 실행을 이끄는 말하기",
    textOpts("사람의 마음을 움직여\n변화와 실행을 이끄는 말하기", 1.38, 3.05, 4.6, 0.95, {
      fontSize: 17,
      minFontSize: 13,
      maxFontSize: 18,
      color: "DDEAF0",
    })
  );
  addCard(slide, {
    x: 7.25,
    y: 1.28,
    w: 5.05,
    h: 4.8,
    kicker: "오늘의 약속",
    title: "말 잘하는 법이 아니라\n경험을 설계하는 법을 다룬다",
    body:
      "리더의 말은 정보 전달로 끝나지 않는다.\n회의, 설명, 피드백, 변화 제안은 모두 조직에 하나의 경험을 남긴다.\n\n오늘 우리는 그 경험이 어떻게 믿음과 행동, 결과로 이어지는지 보고,\n각자의 조직 변화 장면에 쓸 리더 스토리 1개를 완성한다.",
    fill: "20485F",
    line: "567A8D",
    kickerColor: "C3D7E0",
    titleColor: C.white,
    bodyColor: "E4EEF4",
    titleSize: 20,
    bodySize: 13.2,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 2, "오프닝");
  addTitle(slide, "오늘의 질문", "강의의 관점을 화술 훈련에서 리더십 영향력으로 전환한다.");
  addPromptColumns(slide, [
    {
      kicker: "Question 1",
      title: "왜 전달력이 있어야 할까요",
      body: "리더는 결국 원하는 결과를 만들기 위해 말한다. 전달력은 말의 기술이 아니라 결과를 여는 시작점이다.",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "Question 2",
      title: "왜 스토리텔링이 필요할까요",
      body: "설명만으로는 움직이지 않는 순간이 있다. 스토리텔링은 상대가 스스로 의미를 잡게 만드는 구조다.",
      fill: C.paleBlue,
      line: "CADAE3",
      kickerColor: C.blue,
    },
    {
      kicker: "Question 3",
      title: "여러분은 무엇을 얻기 위해 이 자리에 오셨나요",
      body: "설득, 변화, 실행, 신뢰 회복. 오늘의 답은 각자의 현업 장면과 연결될 때 비로소 힘을 가진다.",
      fill: C.coralSoft,
      line: "E4C6B8",
      kickerColor: C.coral,
    },
  ]);
  slide.addText(
    "리더의 말은 정보 전달이 아니라 경험 설계다.",
    textOpts("리더의 말은 정보 전달이 아니라 경험 설계다.", 0.94, 5.5, 8.8, 0.48, {
      fontSize: 20,
      minFontSize: 16,
      maxFontSize: 21,
      bold: true,
      color: C.dark,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 3, "과정 관점");
  addTitle(slide, "이 과정의 운영 원칙", "위로 뒤에는 구조가, 구조 뒤에는 적용이 남아야 한다.");
  addCard(slide, {
    x: 0.94,
    y: 2.0,
    w: 6.0,
    h: 3.85,
    kicker: "Do Not",
    title: "이 과정은 말 잘하는 법을 가르치는 시간이 아니다",
    body:
      "리더의 말은 조직에 경험을 제공하는 행위다.\n자기 이야기를 꺼낼 때도 감정 소비가 아니라 해석과 메시지로 연결해야 한다.",
    fill: C.paperAlt,
    line: C.line,
    kickerColor: C.coral,
    bodySize: 13.2,
  });
  slide.addText(bulletRuns([
    "공감 뒤에는 구조를 준다",
    "질문 설계가 전달 스킬보다 먼저다",
    "참여자가 내일 바로 쓸 장면으로 연결한다",
    "발표 수준보다 메시지 구조 이해를 우선한다",
  ], C.dark, 15), {
    x: 7.35,
    y: 2.05,
    w: 4.95,
    h: 3.65,
    fontFace: FONT_FAMILY,
    margin: 0,
    color: C.ink,
    valign: "top",
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 4, "하루 흐름");
  addTitle(slide, "09:00-18:00 과정 흐름", "질문, 해석, 구조, 적용의 리듬으로 하루를 설계한다.");
  const timeline = [
    ["09:00-12:30", "오전", "리더는 어떤 경험을 제공하는가", "RESULT PYRAMID\nETHOS\n자기인지"],
    ["13:30-15:00", "오후 1", "나는 무엇을 말할 수 있는 사람인가", "가치 도출\nAs-Is → To-Be"],
    ["15:10-16:40", "오후 2", "어떻게 구조화해야 마음이 움직이는가", "Why\nWhat\nHow\nIf"],
    ["16:40-18:00", "마무리", "내 리더 스토리를 완성할 수 있는가", "작성\n발표\n피드백\n현업 적용"],
  ];
  timeline.forEach((item, i) => {
    addCard(slide, {
      x: 0.95 + i * 3.02,
      y: 2.15,
      w: 2.78,
      h: 3.7,
      kicker: item[0],
      title: item[1],
      body: `${item[2]}\n\n${item[3]}`,
      fill: i === 0 ? C.paperAlt : i === 1 ? C.paleBlue : i === 2 ? C.mintSoft : C.coralSoft,
      line: i === 0 ? C.line : i === 1 ? "C8DCE6" : i === 2 ? "C8D7D0" : "E5C9BE",
      kickerColor: i === 3 ? C.coral : C.blue,
      bodySize: 12.2,
    });
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 5, "RESULT PYRAMID");
  addTitle(slide, "리더는 결국 어떤 경험을 제공하는 사람인가", "결과는 행동에서, 행동은 믿음에서, 믿음은 경험에서 나온다.");
  const chain = [
    { x: 0.94, title: "경험", body: "회의\n피드백\n설명\n스토리텔링", fill: C.paperAlt },
    { x: 3.22, title: "믿음", body: "이 변화는 해볼 만하다\n이 리더는 나를 존중한다", fill: C.paleBlue },
    { x: 5.5, title: "행동", body: "시도한다\n협력한다\n따라온다", fill: C.mintSoft },
    { x: 7.78, title: "결과", body: "실행력\n변화 정착\n성과", fill: C.coralSoft },
  ];
  chain.forEach((item, idx) => {
    addCard(slide, {
      x: item.x,
      y: 2.5,
      w: 2.0,
      h: 2.0,
      kicker: idx === 0 ? "RESULT PYRAMID" : "",
      title: item.title,
      body: item.body,
      fill: item.fill,
      line: C.line,
      bodySize: 12.5,
    });
    if (idx < chain.length - 1) {
      slide.addShape(pptx.ShapeType.chevron, {
        x: item.x + 2.02,
        y: 3.16,
        w: 0.18,
        h: 0.56,
        line: { color: C.gold, transparency: 100 },
        fill: { color: C.gold },
      });
    }
  });
  slide.addText(
    "말하기는 정보 전달이 아니라 경험 제공이다.",
    textOpts("말하기는 정보 전달이 아니라 경험 제공이다.", 0.95, 5.3, 4.6, 0.38, {
      fontSize: 18,
      minFontSize: 15,
      maxFontSize: 18,
      bold: true,
      color: C.dark,
    })
  );
  slide.addText(
    "좋은 리더의 말은 상대에게 ‘나는 중요한 사람으로 다뤄지고 있구나’를 느끼게 한다.",
    textOpts("좋은 리더의 말은 상대에게 ‘나는 중요한 사람으로 다뤄지고 있구나’를 느끼게 한다.", 6.1, 5.3, 6.1, 0.55, {
      fontSize: 15,
      minFontSize: 12,
      maxFontSize: 16,
      color: C.slate,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 6, "질문 전환");
  addTitle(slide, "내가 최근 팀원에게 제공한 경험은 무엇이었는가", "설명했는가, 연결했는가. 좁게 만들었는가, 열리게 만들었는가.");
  addPromptColumns(slide, [
    {
      kicker: "적어보기",
      title: "경험",
      body: "내가 최근 팀원에게 제공한 경험은 무엇이었는가",
      fill: C.paperAlt,
      line: C.line,
      bodySize: 13,
    },
    {
      kicker: "이어지는 믿음",
      title: "믿음",
      body: "그 경험은 어떤 믿음을 만들었는가",
      fill: C.paleBlue,
      line: "CADAE3",
      bodySize: 13,
    },
    {
      kicker: "행동과 결과",
      title: "행동 → 결과",
      body: "그 믿음은 어떤 행동으로 이어졌고, 어떤 결과를 만들었는가",
      fill: C.mintSoft,
      line: "C8D7D0",
      bodySize: 13,
    },
  ]);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 7, "존중");
  addTitle(slide, "좋은 말하기의 기준", "상대에게 자신이 중요한 사람이라는 것을 느끼게 하는 경험");
  addCard(slide, {
    x: 0.95,
    y: 2.1,
    w: 4.15,
    h: 3.35,
    kicker: "Definition",
    title: "존중 = 상대 내면의 질문을 해결하려는 구조",
    body: "예의만 갖춘 말이 아니라,\n상대가 지금 무엇을 두려워하고 무엇을 확인하고 싶은지를 읽고 답하는 설계다.",
    fill: C.coralSoft,
    line: "E5C9BE",
    kickerColor: C.coral,
  });
  slide.addText(bulletRuns([
    "내 말은 상대를 좁게 만들었는가, 열리게 만들었는가",
    "나는 정보를 던졌는가, 의미를 연결했는가",
    "상대의 질문보다 내 설명 욕구가 앞서지 않았는가",
  ], C.ink, 15), {
    x: 5.6,
    y: 2.22,
    w: 6.1,
    h: 2.8,
    fontFace: FONT_FAMILY,
    margin: 0,
    color: C.ink,
    valign: "top",
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 8, "ETHOS");
  addTitle(slide, "왜 에토스가 먼저인가", "자기를 모르면 자기다운 말이 없고, 자기다운 말이 없으면 신뢰도 약해진다.");
  addCard(slide, {
    x: 0.95,
    y: 2.08,
    w: 3.6,
    h: 3.95,
    kicker: "세 축",
    title: "Logos\nPathos\nEthos",
    body: "논리\n감정 연결\n이 사람이 누구인가에 대한 신뢰",
    fill: C.paleBlue,
    line: "CBDCE6",
    bodySize: 14,
  });
  addCard(slide, {
    x: 4.85,
    y: 2.08,
    w: 3.4,
    h: 3.95,
    kicker: "핵심",
    title: "리더십 스토리텔링의 출발점은 에토스다",
    body: "스토리텔링은 과장된 고백이 아니라,\n무엇을 왜 어디까지 꺼낼지 아는 성숙함이다.",
    fill: C.paperAlt,
    line: C.line,
    bodySize: 13.2,
  });
  addCard(slide, {
    x: 8.55,
    y: 2.08,
    w: 3.78,
    h: 3.95,
    kicker: "자기인지 질문",
    title: "나는 어떤 상황에서 말이 길어지거나 설명형이 되는가",
    body: "나는 어떤 리더로 기억되고 싶은가\n내가 자주 놓치는 부분은 무엇인가\n내가 반복해서 드러내는 강점은 무엇인가",
    fill: C.mintSoft,
    line: "C8D7D0",
    bodySize: 12.2,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 9, "조하리의 창");
  addTitle(slide, "나는 어떤 사람으로 말하고 있으며, 무엇을 말할 수 있는 사람인가", "조하리의 창으로 자기 인식과 자기 개방의 기준을 점검한다.");
  const quadrants = [
    { x: 1.15, y: 2.0, title: "열린 창", body: "나도 알고\n타인도 아는 영역", fill: C.paperAlt },
    { x: 6.8, y: 2.0, title: "숨긴 창", body: "나는 알지만\n잘 드러내지 않는 영역", fill: C.paleBlue },
    { x: 1.15, y: 4.1, title: "보이지 않는 창", body: "타인은 보지만\n나는 잘 모르는 영역", fill: C.mintSoft },
    { x: 6.8, y: 4.1, title: "미지의 창", body: "나도 모르고\n타인도 모르는 영역", fill: C.coralSoft },
  ];
  quadrants.forEach((q) => {
    addCard(slide, {
      x: q.x,
      y: q.y,
      w: 4.7,
      h: 1.6,
      title: q.title,
      body: q.body,
      fill: q.fill,
      line: C.line,
      bodyY: 0.98,
      bodySize: 12.2,
    });
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 6.3,
    y: 1.95,
    w: 0,
    h: 3.82,
    line: { color: C.line, width: 1.25 },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 1.1,
    y: 3.82,
    w: 10.4,
    h: 0,
    line: { color: C.line, width: 1.25 },
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 10, "액티비티 1");
  addTitle(slide, "심리테스트 기반 자기 해석", "유형을 맞히는 것이 아니라, 자기 인식을 여는 것이 목적이다.");
  addPromptColumns(slide, [
    {
      kicker: "Check 1",
      title: "나는 사람을 볼 때 무엇을 먼저 보는 편인가",
      body: "성향, 감정, 역량, 관계. 내가 먼저 보는 기준은 곧 내가 말할 때 놓치기 쉬운 지점과도 연결된다.",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "Check 2",
      title: "갈등 상황에서 내가 가장 먼저 택하는 방식은 무엇인가",
      body: "설명, 회피, 설득, 정리. 반복 습관은 전달력의 강점이 되기도 하고 병목이 되기도 한다.",
      fill: C.paleBlue,
      line: "CADAE3",
    },
    {
      kicker: "Check 3",
      title: "내가 말할 때 상대를 놓치게 만드는 습관은 무엇인가",
      body: "정보를 너무 빨리 말하는가\n질문을 확인하지 않는가\n나의 기준만 강하게 밀어붙이는가",
      fill: C.coralSoft,
      line: "E5C9BE",
      bodySize: 12.2,
    },
  ]);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 11, "현재 수준 진단");
  addTitle(slide, "지금 내 말하기는 어디에 치우쳐 있는가", "현재 상태를 봐야 다음 질문과 구조가 보인다.");
  addCard(slide, {
    x: 0.96,
    y: 2.05,
    w: 5.15,
    h: 3.8,
    kicker: "체크리스트",
    title: "1점부터 5점까지 스스로 체크해 보세요",
    body: "상대의 질문부터 떠올린다\n남겨야 할 한 문장을 정리하고 말한다\n사례를 설명이 아니라 설득의 재료로 쓴다\n듣는 사람이 자기화할 질문을 남긴다",
    fill: C.paperAlt,
    line: C.line,
    bodySize: 12.5,
  });
  addCard(slide, {
    x: 6.45,
    y: 2.05,
    w: 5.9,
    h: 3.8,
    kicker: "정리 질문",
    title: "체크 후 바로 적는다",
    body: "가장 높은 항목은 무엇인가\n가장 낮은 항목은 무엇인가\n지금 내 말하기가 WHAT-HOW에 치우쳐 있는 장면은 무엇인가\n오늘 반드시 바꾸고 싶은 한 가지는 무엇인가",
    fill: C.mintSoft,
    line: "C8D7D0",
    bodySize: 12.5,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addSectionBreak(
    slide,
    12,
    "오후 시작",
    "가치와 경험으로\n메시지의 뿌리를 찾는다",
    "B2B 리더십 맥락에서 스토리텔링은 감동 서사가 아니라,\n조직 현실을 움직일 수 있는 가치 기반 메시지를 세우는 일이다."
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 13, "가치 기반 메시지");
  addTitle(slide, "나는 무엇을 말할 수 있는 사람인가", "가치가 추상명사에서 멈추지 않게, 반드시 실제 장면과 연결한다.");
  addPromptColumns(slide, [
    {
      kicker: "Value",
      title: "내가 리더로서 그냥 넘기지 못하는 것은 무엇인가",
      body: "반복해서 지키려는 기준과 중요하게 여기는 방식은 무엇인가",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "Reality",
      title: "내가 바꾸고 싶은 조직의 As-Is는 무엇인가",
      body: "지금 조직은 어떤 장면에서 막히고 있는가. 사람들은 무엇 때문에 주저하고 있는가.",
      fill: C.paleBlue,
      line: "CADAE3",
    },
    {
      kicker: "Direction",
      title: "내가 제안하고 싶은 To-Be는 무엇인가",
      body: "오늘 다룰 조직 변화 장면 1개를 정하고, 그 장면에 필요한 리더 메시지를 좁힌다.",
      fill: C.mintSoft,
      line: "C8D7D0",
    },
  ]);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 14, "말하기는 원래 어렵다");
  addTitle(slide, "좋은 의도만으로는 전달되지 않는다", "같은 메시지도 구조가 바뀌면 듣는 경험이 달라진다.");
  addCard(slide, {
    x: 0.96,
    y: 2.1,
    w: 5.45,
    h: 3.7,
    kicker: "Version A | 화자 중심 설명형",
    title: "“다음 달부터 CRM 입력 기준이 바뀝니다.”",
    body: "항목이 늘어나고 기준이 세분화됩니다.\n빠짐없이 입력해 주세요.\n보고 체계가 달라져서 반드시 지켜야 합니다.",
    fill: C.paperAlt,
    line: C.line,
    bodySize: 13.2,
  });
  addCard(slide, {
    x: 6.88,
    y: 2.1,
    w: 5.45,
    h: 3.7,
    kicker: "Version B | 청중 질문 해결형",
    title: "“우리가 바꾸려는 건 입력 방식이 아니라 팀의 판단 속도입니다.”",
    body: "지금 기준으로는 중요한 징후가 늦게 보입니다.\n그래서 현장을 더 빨리 읽을 수 있는 방식으로 바꾸려 합니다.\n이번 변화는 일이 늘어나기보다, 판단이 더 분명해지게 하려는 조정입니다.",
    fill: C.paleBlue,
    line: "CADAE3",
    kickerColor: C.blue,
    bodySize: 13,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 15, "청중 질문");
  addTitle(slide, "왜 말하기가 어려운가", "상대의 질문을 상상해야 하기 때문이다.");
  addCard(slide, {
    x: 0.96,
    y: 2.05,
    w: 11.3,
    h: 3.95,
    kicker: "Transition",
    title: "상대는 무엇을 질문하고 있었을까",
    body: "나는 무엇을 너무 빨리 설명했을까\n상대는 지금 무엇이 두렵고 무엇을 확인하고 싶었을까\n다음에는 무엇부터 확인해야 할까\n\n좋은 의도는 중요하지만, 구조가 없으면 전달은 쉽게 무너진다.",
    fill: C.coralSoft,
    line: "E5C9BE",
    kickerColor: C.coral,
    titleSize: 22,
    bodySize: 14,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 16, "Why-What-How-If");
  addTitle(slide, "마음을 움직이는 구조", "Why는 초청장, What은 한 문장, How는 입증, If는 자기화다.");
  const frameCards = [
    { title: "Why", body: "왜 지금 이 이야기를 들어야 하는가\nAs-Is → To-Be를 여는 초청장", fill: C.paleBlue },
    { title: "What", body: "결국 남겨야 할 한 문장\n리더가 끝까지 지켜야 할 메시지", fill: C.paperAlt },
    { title: "How", body: "사례, 수치, 증거, 경험\n설명이 아니라 입증의 재료", fill: C.mintSoft },
    { title: "If", body: "청중이 자기 일에 대입하게 하는 질문\n성찰과 다음 행동", fill: C.coralSoft },
  ];
  frameCards.forEach((card, i) => {
    addCard(slide, {
      x: 0.95 + i * 3.02,
      y: 2.42,
      w: 2.78,
      h: 3.0,
      title: card.title,
      body: card.body,
      fill: card.fill,
      line: C.line,
      titleSize: 21,
      bodyY: 1.0,
      bodySize: 12.2,
    });
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 17, "Why");
  addTitle(slide, "Why | 청중에게 보내는 초청장", "왜 이 이야기를 들어야 하는지, 왜 지금 필요한지, 무엇이 달라질 수 있는지를 연다.");
  addPromptColumns(slide, [
    {
      kicker: "청중",
      title: "내 청중은 누구인가",
      body: "직책이 아니라 지금 어떤 부담과 기대를 안고 있는 사람들인지까지 본다.",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "As-Is",
      title: "그들이 현재 느끼는 상태는 무엇인가",
      body: "무엇이 불편하고, 무엇 때문에 저항하고, 무엇을 아직 믿지 못하는가.",
      fill: C.paleBlue,
      line: "CADAE3",
    },
    {
      kicker: "To-Be",
      title: "내가 제안하고 싶은 변화는 무엇인가",
      body: "청중 입장에서 ‘들어볼 이유’가 생기게 열어 준다.",
      fill: C.mintSoft,
      line: "C8D7D0",
    },
  ]);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 18, "What");
  addTitle(slide, "What | 결국 남겨야 할 한 문장", "메시지가 길게 흩어지지 않도록, 끝까지 지켜야 할 문장을 먼저 세운다.");
  addCard(slide, {
    x: 0.95,
    y: 2.12,
    w: 5.15,
    h: 3.6,
    kicker: "Formula",
    title: "한 문장으로 남지 않으면,\n메시지는 쉽게 흩어진다",
    body: "내가 끝까지 남기고 싶은 한 문장은 무엇인가\n지금 이 변화의 핵심은 무엇인가\n청중이 발표 뒤에 정확히 기억해야 할 문장은 무엇인가",
    fill: C.paperAlt,
    line: C.line,
    bodySize: 13,
  });
  addCard(slide, {
    x: 6.45,
    y: 2.12,
    w: 5.9,
    h: 3.6,
    kicker: "Example",
    title: "예시",
    body: "“이번 변화의 목적은 통제를 늘리기보다 판단의 기준을 하나로 맞추는 데 있습니다.”\n\n“우리가 지금 회복해야 하는 것은 속도가 아니라 협업의 신뢰입니다.”",
    fill: C.coralSoft,
    line: "E5C9BE",
    kickerColor: C.coral,
    bodySize: 13.2,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 19, "How");
  addTitle(slide, "How | 설명이 아니라 입증", "Why와 What을 설득 가능하게 만드는 사례, 수치, 경험을 고른다.");
  addCard(slide, {
    x: 0.95,
    y: 2.12,
    w: 3.65,
    h: 3.75,
    kicker: "Case",
    title: "경험",
    body: "내가 직접 겪은 장면\n팀이 실제로 막혔던 순간\n변화가 필요해졌던 계기",
    fill: C.paperAlt,
    line: C.line,
  });
  addCard(slide, {
    x: 4.85,
    y: 2.12,
    w: 3.65,
    h: 3.75,
    kicker: "Evidence",
    title: "사실과 수치",
    body: "지연, 품질, 이탈, 반복 오류\n객관적 근거는 막연한 훈계를 줄이고 이해를 높인다.",
    fill: C.paleBlue,
    line: "CADAE3",
  });
  addCard(slide, {
    x: 8.75,
    y: 2.12,
    w: 3.55,
    h: 3.75,
    kicker: "Meaning",
    title: "해석",
    body: "그 장면이 왜 중요한지\n우리가 여기서 무엇을 배워야 하는지\n이 변화가 무엇을 지키기 위한 것인지",
    fill: C.mintSoft,
    line: "C8D7D0",
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 20, "If");
  addTitle(slide, "If | 듣는 사람이 자기 일에 대입하게 만드는 질문", "결론을 던지고 끝내지 말고, 청중이 자기화할 문을 열어 준다.");
  addCard(slide, {
    x: 0.95,
    y: 2.15,
    w: 11.35,
    h: 3.8,
    kicker: "If Question",
    title: "내가 청중에게 던질 질문은 무엇인가",
    body: "여러분은 이 메시지를 어디에 적용할 수 있는가\n지금 팀 안에서 가장 먼저 바꿔봐야 할 장면은 무엇인가\n우리가 놓치고 있던 질문은 무엇인가\n내일 바로 어떤 행동으로 연결할 것인가",
    fill: C.paleBlue,
    line: "CADAE3",
    bodySize: 14,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 21, "대표 오류");
  addTitle(slide, "리더의 흔한 구조 오류", "상대가 듣는 이유보다 내가 말하고 싶은 욕구가 앞서는 순간 구조가 무너진다.");
  addPromptColumns(slide, [
    {
      kicker: "Error 1",
      title: "Why 없이 How만 말한다",
      body: "맥락 없는 정보는 청중의 방어를 높인다.",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "Error 2",
      title: "What 없이 정보만 나열한다",
      body: "핵심 한 문장이 없으면 메시지는 흩어진다.",
      fill: C.coralSoft,
      line: "E5C9BE",
    },
    {
      kicker: "Error 3",
      title: "If 없이 결론만 던지고 끝낸다",
      body: "자기화가 없으면 발표는 듣는 순간으로만 남는다.",
      fill: C.mintSoft,
      line: "C8D7D0",
    },
  ]);
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 22, "조직 적용");
  addTitle(slide, "이 프레임을 어디에 쓸 수 있는가", "현업 장면에 바로 연결될수록 스토리텔링은 기술이 아니라 도구가 된다.");
  addPromptColumns(slide, [
    {
      kicker: "Scene 1",
      title: "변화 설명",
      body: "새 기준, 새 제도, 새 방향을 설득해야 할 때",
      fill: C.paperAlt,
      line: C.line,
    },
    {
      kicker: "Scene 2",
      title: "협업 요청",
      body: "다른 팀의 참여와 지원이 필요할 때",
      fill: C.paleBlue,
      line: "CADAE3",
    },
    {
      kicker: "Scene 3",
      title: "저항 대응",
      body: "불만, 피로감, 방어가 먼저 올라오는 순간",
      fill: C.coralSoft,
      line: "E5C9BE",
    },
  ]);
  addCard(slide, {
    x: 9.14,
    y: 5.2,
    w: 3.2,
    h: 0.9,
    title: "팀 동기 회복에도 그대로 적용된다",
    fill: C.mintSoft,
    line: "C8D7D0",
    titleSize: 12.5,
    body: "",
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 23, "작성 워크시트");
  addTitle(slide, "리더 스토리 초안 작성", "워크북의 실행 필드를 그대로 따라가며 3분 분량의 구조를 만든다.");
  const worksheet = [
    { x: 0.96, y: 2.0, kicker: "Step 1", title: "청중", body: "청중은 누구인가\n그들이 지금 가장 크게 품고 있는 질문은 무엇인가" },
    { x: 6.55, y: 2.0, kicker: "Step 2", title: "변화", body: "내가 제안할 변화는 무엇인가\n이 변화가 필요한 이유는 무엇인가" },
    { x: 0.96, y: 4.0, kicker: "Step 3-4", title: "가치 + What", body: "이 메시지 뒤에 있는 핵심가치는 무엇인가\n내가 끝까지 남기고 싶은 한 문장은 무엇인가" },
    { x: 6.55, y: 4.0, kicker: "Step 5-6", title: "How + If", body: "어떤 경험과 증거로 입증할 것인가\n내가 청중에게 던질 질문은 무엇인가" },
  ];
  worksheet.forEach((item, i) => {
    addCard(slide, {
      x: item.x,
      y: item.y,
      w: 5.5,
      h: 1.6,
      kicker: item.kicker,
      title: item.title,
      body: item.body,
      fill: i % 2 === 0 ? C.paperAlt : C.paleBlue,
      line: C.line,
      bodyY: 0.98,
      bodySize: 12.2,
    });
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 24, "피드백");
  addTitle(slide, "발표자를 평가하지 말고 메시지 구조를 다룬다", "가장 큰 병목 1개와 유지해야 할 강점 1개를 반드시 함께 말한다.");
  addPromptColumns(slide, [
    {
      kicker: "Why",
      title: "청중의 문제나 질문이 선명하게 느껴졌는가",
      body: "왜 지금 이 이야기를 들어야 하는지 열어주었는가",
      fill: C.paperAlt,
      line: C.line,
      bodySize: 12.2,
    },
    {
      kicker: "What",
      title: "결국 남는 한 문장이 있었는가",
      body: "메시지가 길게 흩어지지 않았는가",
      fill: C.paleBlue,
      line: "CADAE3",
      bodySize: 12.2,
    },
    {
      kicker: "How / If",
      title: "사례는 입증이 되었는가, 청중은 자기화했는가",
      body: "사례와 경험이 메시지를 입증했는가\n듣는 사람이 자기 일에 대입할 수 있게 만들었는가",
      fill: C.mintSoft,
      line: "C8D7D0",
      bodySize: 12,
    },
  ]);
  slide.addText(
    "피드백 문장 예시: “이 부분은 이렇게 바꾸면 더 청중 중심이 되겠습니다.”",
    textOpts("피드백 문장 예시: “이 부분은 이렇게 바꾸면 더 청중 중심이 되겠습니다.”", 0.96, 5.6, 8.4, 0.3, {
      fontSize: 13,
      minFontSize: 11,
      maxFontSize: 13,
      italic: true,
      color: C.slate,
    })
  );
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 25, "현업 적용");
  addTitle(slide, "내일 바로 어디에 쓸 것인가", "배움은 다음 대화 장면을 구체적으로 떠올릴 때 비로소 실행이 된다.");
  addCard(slide, {
    x: 0.96,
    y: 2.05,
    w: 11.35,
    h: 3.95,
    kicker: "Action",
    title: "마무리 질문",
    body: "내가 내일 바로 사용할 장면은 무엇인가\n그 장면에서 먼저 점검할 청중의 질문은 무엇인가\n내가 준비할 What 한 문장은 무엇인가\n내가 남길 If 질문은 무엇인가",
    fill: C.paperAlt,
    line: C.line,
    titleSize: 22,
    bodySize: 14,
  });
  finalizeSlide(slide);

  slide = pptx.addSlide();
  addBase(slide, 26, "클로징", true);
  slide.addText(
    "마음을 움직이는 스토리텔링은\n말을 잘하는 사람의 특권이 아니다.",
    textOpts("마음을 움직이는 스토리텔링은\n말을 잘하는 사람의 특권이 아니다.", 1.1, 1.45, 6.4, 1.5, {
      fontSize: 25,
      minFontSize: 20,
      maxFontSize: 28,
      bold: true,
      color: C.white,
    })
  );
  slide.addText(
    "자신을 더 잘 이해하고, 타인을 더 잘 이해하려고 애쓰는 사람이\n조금 더 깊고, 조금 더 정확하게 할 수 있는 일이다.",
    textOpts("자신을 더 잘 이해하고, 타인을 더 잘 이해하려고 애쓰는 사람이\n조금 더 깊고, 조금 더 정확하게 할 수 있는 일이다.", 1.12, 3.45, 6.8, 0.95, {
      fontSize: 16,
      minFontSize: 13,
      maxFontSize: 17,
      color: "D9E6ED",
    })
  );
  addCard(slide, {
    x: 8.0,
    y: 1.48,
    w: 4.22,
    h: 3.85,
    kicker: "마지막으로 가져갈 것",
    title: "나는 얼마나 나를 이해하려고 했는가\n나는 얼마나 상대를 이해하려고 했는가",
    body: "그 질문이 여러분의 말하기를 바꾼다.\n그리고 그 말하기가 팀의 경험을 바꾼다.",
    fill: "224A61",
    line: "5B7D90",
    kickerColor: "BDD3DE",
    titleColor: C.white,
    bodyColor: "E4EEF4",
    bodySize: 13.2,
  });
  finalizeSlide(slide);
}

async function main() {
  ensureDir(path.join(__dirname, "output"));
  buildSlides();
  const outputFile = path.join(
    __dirname,
    "output",
    "리더십_스토리텔링_실전강의슬라이드.pptx"
  );
  await pptx.writeFile({ fileName: outputFile });
  console.log(`Wrote deck to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
