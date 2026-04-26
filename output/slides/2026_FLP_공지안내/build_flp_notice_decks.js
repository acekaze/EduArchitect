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

const C = {
  bg: "F7F5F0",
  paper: "FFFFFF",
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

function makeDeck(meta) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "전종목";
  pptx.subject = meta.subject;
  pptx.title = meta.title;
  pptx.lang = "ko-KR";
  pptx.theme = {
    headFontFace: FONT_FAMILY,
    bodyFontFace: FONT_FAMILY,
    lang: "ko-KR",
  };
  return pptx;
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

function addBase(pptx, slide, index, section, dark = false) {
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.08,
    line: { color: dark ? C.gold : C.navy, transparency: 100 },
    fill: { color: dark ? C.gold : C.navy },
  });
  slide.addText(section, {
    x: 0.78,
    y: 0.28,
    w: 5.2,
    h: 0.18,
    fontFace: FONT_FAMILY,
    fontSize: 10,
    bold: true,
    color: dark ? C.gold : C.blue,
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

function addTitle(slide, title, subtitle) {
  slide.addText(
    title,
    textOpts(title, 0.92, 0.82, 10.1, 0.76, {
      fontSize: 27,
      minFontSize: 21,
      maxFontSize: 30,
      bold: true,
      color: C.ink,
    })
  );
  if (subtitle) {
    slide.addText(
      subtitle,
      textOpts(subtitle, 0.94, 1.78, 9.2, 0.3, {
        fontSize: 13,
        minFontSize: 11,
        maxFontSize: 14,
        color: C.inkSoft,
      })
    );
  }
}

function addCenteredCover(slide, title, subtitle, tags) {
  slide.addText(
    title,
    textOpts(title, 1.6, 1.78, 10.1, 0.9, {
      fontSize: 28,
      minFontSize: 22,
      maxFontSize: 30,
      bold: true,
      align: "center",
      color: C.ink,
    })
  );
  slide.addText(
    subtitle,
    textOpts(subtitle, 2.0, 2.95, 9.3, 0.34, {
      fontSize: 13.5,
      minFontSize: 11,
      maxFontSize: 14.5,
      align: "center",
      color: C.inkSoft,
    })
  );
  tags.forEach((tag, idx) => {
    const x = 2.25 + idx * 2.95;
    slide.addShape("roundRect", {
      x,
      y: 4.85,
      w: 2.2,
      h: 0.42,
      rectRadius: 0.08,
      line: { color: C.line, width: 1 },
      fill: { color: C.paper },
      shadow: safeOuterShadow("20303C", 0.04, 45, 1, 1),
    });
    slide.addText(tag, {
      x,
      y: 4.96,
      w: 2.2,
      h: 0.14,
      fontFace: FONT_FAMILY,
      fontSize: 9.5,
      bold: true,
      color: C.navy,
      align: "center",
      margin: 0,
    });
  });
}

function addCard(pptx, slide, cfg) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: cfg.h,
    rectRadius: 0.08,
    line: { color: cfg.line || C.line, width: cfg.lineWidth || 1 },
    fill: { color: cfg.fill || C.paper },
    shadow: cfg.shadow === false ? undefined : safeOuterShadow("20303C", 0.05, 45, 1, 1),
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: cfg.stripH || 0.1,
    line: { color: cfg.stripColor || C.navy, transparency: 100 },
    fill: { color: cfg.stripColor || C.navy },
  });
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
      textOpts(cfg.title, cfg.x + 0.22, cfg.y + 0.38, cfg.w - 0.44, cfg.titleH || 0.58, {
        fontSize: cfg.titleSize || 17,
        minFontSize: cfg.titleMinSize || Math.min(cfg.titleSize || 17, 12),
        maxFontSize: cfg.titleSize || 17,
        bold: true,
        color: cfg.titleColor || C.ink,
      })
    );
  }
  if (cfg.body) {
    slide.addText(
      cfg.body,
      textOpts(cfg.body, cfg.x + 0.22, cfg.y + (cfg.bodyY || 1.0), cfg.w - 0.44, cfg.h - (cfg.bodyY || 1.0) - 0.22, {
        fontSize: cfg.bodySize || 12.2,
        minFontSize: cfg.bodyMinSize || 10.2,
        maxFontSize: cfg.bodySize || 12.2,
        color: cfg.bodyColor || C.ink,
      })
    );
  }
}

function addList(slide, items, x, y, w, opts = {}) {
  const dotColor = opts.dotColor || C.blue;
  const textColor = opts.textColor || C.ink;
  const gap = opts.gap || 0.54;
  const fontSize = opts.fontSize || 13;
  items.forEach((item, idx) => {
    const cy = y + idx * gap;
    slide.addShape("ellipse", {
      x,
      y: cy + 0.08,
      w: 0.1,
      h: 0.1,
      line: { color: dotColor, transparency: 100 },
      fill: { color: dotColor },
    });
    slide.addText(item, {
      x: x + 0.2,
      y: cy,
      w: w - 0.2,
      h: 0.24,
      fontFace: FONT_FAMILY,
      fontSize,
      color: textColor,
      margin: 0,
    });
  });
}

function finalizeSlide(pptx, slide) {
  warnIfSlideHasOverlaps(slide, pptx, {
    muteContainment: true,
    ignoreDecorativeShapes: true,
  });
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function buildPrenoticeDeck() {
  const pptx = makeDeck({
    subject: "2026 FLP 사전고지 안내 슬라이드",
    title: "2026 FLP Module 1 사전고지",
  });
  let slide;

  slide = pptx.addSlide();
  addBase(pptx, slide, 1, "2026 FLP PRE-NOTICE");
  addCenteredCover(
    slide,
    "2026 FLP Module 1",
    "Reflection 및 SKMS 토의 안내",
    ["팀별 Self Review", "SKMS 연결", "Template 제출"]
  );
  finalizeSlide(pptx, slide);

  slide = pptx.addSlide();
  addBase(pptx, slide, 2, "운영 기준");
  addTitle(slide, "마지막 1시간은 이렇게 진행합니다", "마무리 시간이 아니라 팀별 Reflection과 제출이 포함된 필수 세션입니다.");
  addCard(pptx, slide, {
    x: 0.96, y: 2.14, w: 8.1, h: 3.92, kicker: "Flow", title: "4단계 운영",
    body: "1. 팀별 Self Review 진행\n2. 5가지 Review Point 기준 정리\n3. SKMS 연결 질문 토의\n4. 조별 Template 작성 및 제출",
    fill: C.paper, stripColor: C.navy, titleSize: 20, bodySize: 13.2
  });
  addCard(pptx, slide, {
    x: 9.32, y: 2.14, w: 3.0, h: 3.92, kicker: "Time", title: "Reflection\n60분", titleSize: 22,
    body: "팀별 정리와 제출까지 포함한 시간입니다.", bodySize: 12, fill: C.blueSoft, stripColor: C.gold
  });
  finalizeSlide(pptx, slide);

  slide = pptx.addSlide();
  addBase(pptx, slide, 3, "Self Review");
  addTitle(slide, "팀별 Self Review는 5가지 기준으로 진행합니다", "결과 요약이 아니라 판단 기준과 의사결정 과정을 정리하는 방식입니다.");
  addCard(pptx, slide, { x: 0.96, y: 2.28, w: 11.34, h: 4.44, kicker: "Review Points", title: "정리 기준", titleSize: 18, bodyY: 0.82, bodyH: 0.1 });
  addList(slide, [
    "경영의 목적  |  목표를 무엇으로 두었는가",
    "의사결정의 구조  |  누가 어떤 기준으로 결정했는가",
    "기능 간 연결  |  부분 판단이 전체 결과에 어떤 영향을 주었는가",
    "환경 변화 대응  |  변화에 따라 무엇을 조정했는가",
    "리더의 역할  |  리더가 방향과 우선순위를 어떻게 정리했는가",
  ], 1.24, 3.0, 10.6, { gap: 0.66, fontSize: 12.4, dotColor: C.green });
  finalizeSlide(pptx, slide);

  slide = pptx.addSlide();
  addBase(pptx, slide, 4, "SKMS");
  addTitle(slide, "SKMS 연결 질문", "질문 문구는 그대로 사용하고, 개념 이름만 적지 말고 실제 상황과 연결해서 정리합니다.");
  addCard(pptx, slide, {
    x: 0.96, y: 2.28, w: 5.42, h: 4.28, kicker: "Question 1", title: "의사결정 순간마다 영향을 준 SKMS 개념은 무엇이었습니까?", titleSize: 16.5,
    body: "그 개념이 어떤 상황에서\n어떤 방식으로 작용했는지 정리합니다.", bodySize: 12.2, fill: C.paper, stripColor: C.navy
  });
  addCard(pptx, slide, {
    x: 6.72, y: 2.28, w: 5.58, h: 4.28, kicker: "Question 2", title: "오늘 경험을 통해 SKMS가 실제 기업경영에 기여할 수 있다고 느낀 지점은 무엇입니까?", titleSize: 16,
    body: "의사결정의 질 또는 조직 실행력과 연결해서 적습니다.", bodySize: 12.2, fill: C.paper, stripColor: C.gold
  });
  finalizeSlide(pptx, slide);

  slide = pptx.addSlide();
  addBase(pptx, slide, 5, "제출");
  addTitle(slide, "작성 및 제출 안내", "팀별 Template 작성과 업로드까지 완료되어야 오늘 과정이 마무리됩니다.");
  addCard(pptx, slide, {
    x: 0.96, y: 2.12, w: 5.38, h: 4.42, kicker: "Write", title: "작성 항목", titleSize: 18,
    body: "각 조 테이블 공용 PC 내 Template 작성\n조별 제출 필수\nmySUNI 페이지 업로드\n시간 제약 시 일부 조만 전체 공유 진행", bodySize: 12.4, fill: C.paper
  });
  addCard(pptx, slide, {
    x: 6.72, y: 2.12, w: 5.58, h: 4.42, kicker: "Submit", title: "제출 순서", titleSize: 18,
    body: "작성 -> 점검 -> 업로드\n\n마지막에는 업로드 완료까지 확인합니다.", bodySize: 13, fill: C.greenSoft, stripColor: C.green
  });
  finalizeSlide(pptx, slide);

  return pptx;
}

function buildDebriefDeck() {
  const pptx = makeDeck({
    subject: "2026 FLP 디브리프 안내 슬라이드",
    title: "2026 FLP 디브리프",
  });
  let slide;

  const reviewSlides = [
    {
      title: "Review Point 1. 경영의 목적",
      subtitle: "목표를 무엇으로 두었는지, 그리고 그 기준이 팀 안에서 합의되어 있었는지를 봅니다.",
      items: [
        "우리 팀의 목표는 무엇이었는가",
        "그 목표는 어떻게 설정했는가",
        "단기 성과와 장기 관점을 함께 보았는가",
      ],
    },
    {
      title: "Review Point 2. 의사결정의 구조",
      subtitle: "누가 결정했는가보다, 어떤 기준으로 결정했는가를 먼저 봅니다.",
      items: [
        "누가 어떤 기준으로 결정했는가",
        "판단 기준은 팀 안에서 공유되었는가",
        "더 좋은 판단을 위해 어떤 정보가 더 필요했는가",
      ],
    },
    {
      title: "Review Point 3. 기능 간 연결",
      subtitle: "부분 판단이 전체 결과와 어떻게 연결되었는지 확인하는 전사 관점 질문입니다.",
      items: [
        "부분 판단이 전체 결과에 어떤 영향을 주었는가",
        "기능 간 연결과 조정이 실제로 이루어졌는가",
        "부분 최적화가 전체 성과를 해친 장면은 없었는가",
      ],
    },
    {
      title: "Review Point 4. 환경 변화 대응",
      subtitle: "변화 자체보다, 변화를 읽고 조정한 기준을 정리해 주시면 됩니다.",
      items: [
        "변화 신호를 언제 감지했는가",
        "환경 변화에 따라 무엇을 유지하고 무엇을 바꿨는가",
        "전략 수정의 기준은 무엇이었는가",
      ],
    },
    {
      title: "Review Point 5. 리더의 역할",
      subtitle: "리더가 답을 냈는지보다, 팀 운영의 질을 어떻게 바꿨는지를 정리합니다.",
      items: [
        "리더가 있어서 달라진 점은 무엇이었는가",
        "리더는 방향, 우선순위, 역할, 소통을 어떻게 정리했는가",
        "리더의 개입이 판단의 질을 높였는가",
      ],
    },
  ];

  slide = pptx.addSlide();
  addBase(pptx, slide, 1, "2026 FLP DEBRIEF");
  addCenteredCover(
    slide,
    "Reflection & Debrief",
    "팀별 판단과 결과를 SKMS 기준으로 정리합니다",
    ["Self Review", "SKMS", "Action"]
  );
  finalizeSlide(pptx, slide);

  slide = pptx.addSlide();
  addBase(pptx, slide, 2, "진행 순서");
  addTitle(slide, "오늘 디브리프는 4단계로 진행합니다", "팀별 작성이 먼저이고, 전체 공유는 그 다음입니다.");
  addCard(pptx, slide, {
    x: 0.96, y: 2.08, w: 8.18, h: 4.48, kicker: "Process", title: "진행 흐름", titleSize: 20,
    body: "1. 팀 결과 확인\n2. 팀별 Self Review\n3. SKMS 연결 질문 토의\n4. 대표조 공유 및 제출", bodySize: 13.2
  });
  addCard(pptx, slide, {
    x: 9.4, y: 2.08, w: 2.92, h: 4.48, kicker: "Time", title: "60분", titleSize: 24,
    body: "결과 확인보다 판단 기준과 학습 내용을 정리하는 시간입니다.", bodySize: 12.2, fill: C.blueSoft, stripColor: C.gold
  });
  finalizeSlide(pptx, slide);

  slide = pptx.addSlide();
  addBase(pptx, slide, 3, "결과 확인");
  addTitle(slide, "먼저 결과를 확인하겠습니다", "결과가 좋았던 팀도, 좋지 않았던 팀도 모두 같은 기준으로 보겠습니다.");
  addCard(pptx, slide, {
    x: 0.96, y: 2.12, w: 5.34, h: 4.42, kicker: "Result", title: "좌측에서 확인할 것", titleSize: 18,
    body: "우리 팀의 결과는 어땠는가\n어떤 장면이 가장 잘되었는가\n어떤 부분이 꼬였는가", bodySize: 12.6
  });
  addCard(pptx, slide, {
    x: 6.72, y: 2.12, w: 5.6, h: 4.42, kicker: "Judgment", title: "우측에서 확인할 것", titleSize: 18,
    body: "그 결과는 어떤 판단에서 나왔는가\n결과보다 판단 구조를 먼저 본다", bodySize: 13, fill: C.sandSoft, stripColor: C.coral
  });
  finalizeSlide(pptx, slide);

  slide = pptx.addSlide();
  addBase(pptx, slide, 4, "Self Review");
  addTitle(slide, "Self Review는 이 순서로 정리합니다", "서술형으로 길게 쓰기보다 핵심 문장 중심으로 정리해 주시면 됩니다.");
  addCard(pptx, slide, { x: 0.96, y: 2.08, w: 2.62, h: 4.42, kicker: "1", title: "사실", body: "우리는 무엇을 결정했는가", fill: C.paper });
  addCard(pptx, slide, { x: 3.84, y: 2.08, w: 2.62, h: 4.42, kicker: "2", title: "이유", body: "왜 그렇게 판단했는가", fill: C.paper, stripColor: C.gold });
  addCard(pptx, slide, { x: 6.72, y: 2.08, w: 2.62, h: 4.42, kicker: "3", title: "결과", body: "무엇이 좋아졌고 무엇이 꼬였는가", fill: C.paper });
  addCard(pptx, slide, { x: 9.6, y: 2.08, w: 2.62, h: 4.42, kicker: "4", title: "학습", body: "다음에는 무엇을 바꿀 것인가", fill: C.paper, stripColor: C.green });
  finalizeSlide(pptx, slide);

  reviewSlides.forEach((review, idx) => {
    slide = pptx.addSlide();
    addBase(pptx, slide, 5 + idx, "Review Point");
    addTitle(slide, review.title, review.subtitle);
    addCard(pptx, slide, {
      x: 0.96, y: 2.08, w: 11.34, h: 4.48, kicker: "Questions", title: "팀별로 정리할 질문", titleSize: 18, bodyY: 0.82, bodyH: 0.1
    });
    addList(slide, review.items, 1.26, 3.04, 10.5, { gap: 0.88, fontSize: 13.2, dotColor: idx % 2 === 0 ? C.blue : C.green });
    finalizeSlide(pptx, slide);
  });

  slide = pptx.addSlide();
  addBase(pptx, slide, 10, "SKMS");
  addTitle(slide, "SKMS 연결 질문 1", "개념 이름만 적지 말고, 실제 장면과 연결해서 정리해 주십시오.");
  addCard(pptx, slide, {
    x: 0.96, y: 2.3, w: 11.34, h: 4.34, kicker: "Question", title: "시뮬레이션을 진행하면서 의사결정 순간마다 떠올랐거나, 실제로 팀의 판단에 영향을 준 SKMS의 개념이 있다면 무엇이었습니까?", titleSize: 16,
    body: "그 개념이 구체적으로 어떤 상황에서, 어떤 방식으로 작용했는지 함께 정리합니다.", bodySize: 13, fill: C.paper, stripColor: C.navy
  });
  finalizeSlide(pptx, slide);

  slide = pptx.addSlide();
  addBase(pptx, slide, 11, "SKMS");
  addTitle(slide, "SKMS 연결 질문 2", "오늘 경험을 현업 장면과 연결해서 적어 주시면 됩니다.");
  addCard(pptx, slide, {
    x: 0.96, y: 2.3, w: 11.34, h: 3.62, kicker: "Question", title: "오늘 경험을 통해 SKMS가 실제 기업경영에서 의사결정의 질을 높이거나 조직의 실행력을 강화하는 데 기여할 수 있다고 느낀 지점이 있다면 무엇입니까?", titleSize: 16,
    body: "현업의 어떤 장면에 적용할 수 있는지도 함께 정리합니다.", bodySize: 13, fill: C.paper, stripColor: C.gold
  });
  finalizeSlide(pptx, slide);

  slide = pptx.addSlide();
  addBase(pptx, slide, 12, "마무리");
  addTitle(slide, "공유 및 제출 마무리", "공유는 일부 팀만 진행할 수 있지만, 모든 조는 제출까지 완료해야 합니다.");
  addCard(pptx, slide, {
    x: 0.96, y: 2.12, w: 5.34, h: 4.42, kicker: "Share", title: "전체 공유 기준", titleSize: 18,
    body: "성과가 높았던 팀\n판단 기준이 선명했던 팀\n실패했지만 학습이 분명했던 팀", bodySize: 12.6
  });
  addCard(pptx, slide, {
    x: 6.72, y: 2.12, w: 5.6, h: 4.42, kicker: "Submit", title: "제출 체크리스트", titleSize: 18,
    body: "대표조 또는 우수조 일부 전체 공유\n팀별 Template final check\n조별 제출 필수\nmySUNI 업로드 완료 확인", bodySize: 12.6, fill: C.greenSoft, stripColor: C.green
  });
  finalizeSlide(pptx, slide);

  return pptx;
}

async function writeDeck(pptx, outputFile) {
  await pptx.writeFile({ fileName: outputFile });
  console.log(`Wrote deck to ${outputFile}`);
}

async function main() {
  ensureDir(path.join(__dirname, "output"));

  const prenoticePath = path.join(__dirname, "output", "2026_FLP_사전고지_공지슬라이드.pptx");
  const debriefPath = path.join(__dirname, "output", "2026_FLP_디브리프_공지슬라이드.pptx");

  await writeDeck(buildPrenoticeDeck(), prenoticePath);
  await writeDeck(buildDebriefDeck(), debriefPath);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
