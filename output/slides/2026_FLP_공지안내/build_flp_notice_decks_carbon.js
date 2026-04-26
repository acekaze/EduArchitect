"use strict";

const path = require("path");
const PptxGenJS = require("pptxgenjs");
const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require("./pptxgenjs_helpers/layout");

const FONT_HEAD = "Pretendard Variable";
const FONT_BODY = "SUIT Variable";
const FONT_LABEL = "SUIT Variable Medium";

const PAGE_W = 13.333;
const PAGE_H = 7.5;
const UNIT = 1 / 12;
const GRID = {
  cols: 16,
  marginX: 0.5,
  gutter: UNIT * 2,
};
GRID.colW = (PAGE_W - GRID.marginX * 2 - GRID.gutter * (GRID.cols - 1)) / GRID.cols;

const shapeRef = new PptxGenJS();
const { ShapeType } = shapeRef;

const C = {
  bg: "F7FAFF",
  paper: "FFFFFF",
  ink: "161616",
  sub: "525252",
  muted: "8A8F98",
  line: "DDE7F5",
  accent: "0F62FE",
  accentDark: "002D9C",
  accentSoft: "DCEBFF",
  accentPale: "F1F7FF",
  secondary: "24A148",
  warm: "FFF4E8",
};

function gx(col) {
  return GRID.marginX + col * (GRID.colW + GRID.gutter);
}

function gw(span) {
  return GRID.colW * span + GRID.gutter * (span - 1);
}

function createDeck(meta) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "전종목";
  pptx.subject = meta.subject;
  pptx.title = meta.title;
  pptx.lang = "ko-KR";
  pptx.theme = {
    headFontFace: FONT_HEAD,
    bodyFontFace: FONT_BODY,
    lang: "ko-KR",
  };
  return pptx;
}

function addCanvas(slide, color = C.bg) {
  slide.background = { color };
  slide.addShape(ShapeType.rect, {
    x: 0,
    y: 0,
    w: PAGE_W,
    h: PAGE_H,
    line: { color, transparency: 100 },
    fill: { color },
  });
}

function addChrome(slide, pageNo, section, model, title, subtitle, opts = {}) {
  addCanvas(slide, opts.bg || C.bg);

  slide.addShape(ShapeType.rect, {
    x: 0,
    y: 0,
    w: PAGE_W,
    h: 0.12,
    line: { color: opts.rule || C.accent, transparency: 100 },
    fill: { color: opts.rule || C.accent },
  });

  slide.addText(section, {
    x: gx(0),
    y: 0.22,
    w: gw(5),
    h: 0.18,
    fontFace: FONT_LABEL,
    fontSize: 8.2,
    bold: true,
    color: opts.sectionColor || C.accentDark,
    margin: 0,
  });

  slide.addText(model, {
    x: gx(11),
    y: 0.22,
    w: gw(5),
    h: 0.18,
    fontFace: FONT_BODY,
    fontSize: 8.2,
    color: C.muted,
    align: "right",
    margin: 0,
  });

  slide.addText(title, {
    x: gx(0),
    y: opts.titleY || 0.82,
    w: gw(opts.titleCols || 11),
    h: opts.titleH || 0.62,
    fontFace: FONT_HEAD,
    fontSize: opts.titleSize || 21,
    bold: true,
    color: opts.titleColor || C.ink,
    margin: 0,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: gx(0),
      y: opts.subtitleY || 1.58,
      w: gw(opts.subtitleCols || 11),
      h: 0.36,
      fontFace: FONT_BODY,
      fontSize: opts.subtitleSize || 9.8,
      color: opts.subtitleColor || C.sub,
      margin: 0,
    });
  }

  slide.addShape(ShapeType.line, {
    x: gx(0),
    y: 7.02,
    w: gw(16),
    h: 0,
    line: { color: C.line, width: 0.75 },
  });
  slide.addText(String(pageNo).padStart(2, "0"), {
    x: gx(15),
    y: 7.08,
    w: gw(1),
    h: 0.18,
    fontFace: FONT_BODY,
    fontSize: 8.2,
    color: C.muted,
    align: "right",
    margin: 0,
  });
}

function addPanel(slide, x, y, w, h, opts = {}) {
  slide.addShape(ShapeType.rect, {
    x,
    y,
    w,
    h,
    line: { color: opts.line || C.line, width: opts.lineWidth || 0.9 },
    fill: { color: opts.fill || C.paper },
  });

  if (opts.band) {
    slide.addShape(ShapeType.rect, {
      x,
      y,
      w,
      h: opts.bandHeight || 0.12,
      line: { color: opts.band, transparency: 100 },
      fill: { color: opts.band },
    });
  }

  if (opts.label) {
    slide.addText(opts.label, {
      x: x + 0.18,
      y: y + 0.16,
      w: w - 0.36,
      h: 0.16,
      fontFace: FONT_LABEL,
      fontSize: 7.8,
      bold: true,
      color: opts.labelColor || C.muted,
      margin: 0,
    });
  }

  if (opts.title) {
    slide.addText(opts.title, {
      x: x + 0.18,
      y: y + (opts.titleY || 0.36),
      w: w - 0.36,
      h: opts.titleH || 0.38,
      fontFace: FONT_HEAD,
      fontSize: opts.titleSize || 14,
      bold: true,
      color: opts.titleColor || C.ink,
      margin: 0,
    });
  }

  if (opts.body) {
    slide.addText(opts.body, {
      x: x + 0.18,
      y: y + (opts.bodyY || 0.78),
      w: w - 0.36,
      h: opts.bodyH || (h - (opts.bodyY || 0.78) - 0.22),
      fontFace: FONT_BODY,
      fontSize: opts.bodySize || 10,
      color: opts.bodyColor || C.sub,
      margin: 0,
      valign: "top",
    });
  }
}

function addTag(slide, x, y, w, text, fill = C.paper) {
  slide.addShape(ShapeType.rect, {
    x,
    y,
    w,
    h: 0.3,
    line: { color: fill, transparency: 100 },
    fill: { color: fill },
  });
  slide.addText(text, {
    x,
    y: y + 0.05,
    w,
    h: 0.16,
    fontFace: FONT_LABEL,
    fontSize: 7.4,
    bold: true,
    color: C.accentDark,
    align: "center",
    margin: 0,
  });
}

function addBulletList(slide, items, x, y, width, opts = {}) {
  const gap = opts.gap || 0.56;
  const fontSize = opts.fontSize || 10.8;
  items.forEach((item, idx) => {
    const yy = y + idx * gap;
    slide.addShape(ShapeType.ellipse, {
      x,
      y: yy + 0.08,
      w: 0.1,
      h: 0.1,
      line: { color: opts.dotColor || C.accent, transparency: 100 },
      fill: { color: opts.dotColor || C.accent },
    });
    slide.addText(item, {
      x: x + 0.2,
      y: yy,
      w: width - 0.2,
      h: 0.24,
      fontFace: FONT_BODY,
      fontSize,
      color: opts.textColor || C.ink,
      margin: 0,
    });
  });
}

function finalizeDeck(pptx) {
  for (const slide of pptx._slides) {
    warnIfSlideHasOverlaps(slide, pptx, {
      muteContainment: true,
      ignoreLines: true,
      ignoreDecorativeShapes: true,
    });
    warnIfSlideElementsOutOfBounds(slide, pptx);
  }
}

function buildPrenoticeDeck() {
  const pptx = createDeck({
    subject: "2026 FLP 사전고지 안내 슬라이드 Carbon 2x 버전",
    title: "2026 FLP Module 1 사전고지 Carbon 2x",
  });
  let slide;

  slide = pptx.addSlide();
  addChrome(slide, 1, "EDUCATION TEMPLATE", "Reflection / Notice", "2026 FLP Module 1", "Reflection 및 SKMS 토의 안내", { titleCols: 7, titleSize: 24 });
  addTag(slide, gx(0), 2.34, 1.45, "팀별 Self Review");
  addTag(slide, gx(2.1), 2.34, 1.2, "SKMS 연결");
  addTag(slide, gx(4.0), 2.34, 1.25, "Template 제출");
  addPanel(slide, gx(11), 1.74, gw(5), 4.94, {
    band: C.accentDark,
    label: "NOTICE SPINE",
    title: "마지막 1시간 운영 기준과 제출 항목만 먼저 안내합니다.",
    titleSize: 13,
    body: "이 안내는 경영시뮬레이션 설명이 아니라\n마지막 Reflection 60분 운영과\n팀별 작성·제출 기준을 정리하는 공지 화면입니다.",
    bodySize: 10,
    bodyY: 0.9,
  });

  slide = pptx.addSlide();
  addChrome(slide, 2, "운영 기준", "Reflection 60 min", "마지막 1시간은 이렇게 진행합니다", "별도 마무리 시간이 아니라 팀별 정리와 제출까지 포함된 필수 Reflection 세션입니다.");
  addPanel(slide, gx(0), 2.02, gw(10), 4.58, {
    band: C.accent,
    label: "FLOW",
    title: "4단계 운영",
    titleSize: 18,
    body: "1. 팀별 Self Review 진행\n2. 5가지 Review Point 기준 정리\n3. SKMS 연결 질문 토의\n4. 조별 Template 작성 및 제출",
    bodySize: 12,
  });
  addPanel(slide, gx(10.5), 2.02, gw(5.5), 4.58, {
    fill: C.accentPale,
    band: C.secondary,
    label: "TIME",
    title: "Reflection\n60분",
    titleSize: 22,
    titleH: 0.68,
    body: "팀별 정리, 최종 점검,\n업로드 완료 확인까지 포함합니다.",
    bodySize: 11.2,
    bodyY: 1.18,
  });

  slide = pptx.addSlide();
  addChrome(slide, 3, "Self Review", "5 review points", "팀별 Self Review는 5가지 기준으로 진행합니다", "결과 요약이 아니라 판단 기준과 의사결정 과정을 정리하는 방식으로 진행합니다.", { titleCols: 12 });
  addPanel(slide, gx(0), 2.14, gw(16), 4.38, {
    band: C.accentDark,
    label: "REVIEW POINTS",
    title: "정리 기준",
    titleSize: 17,
  });
  addBulletList(slide, [
    "경영의 목적  |  목표를 무엇으로 두었는가",
    "의사결정의 구조  |  누가 어떤 기준으로 결정했는가",
    "기능 간 연결  |  부분 판단이 전체 결과에 어떤 영향을 주었는가",
    "환경 변화 대응  |  변화에 따라 무엇을 조정했는가",
    "리더의 역할  |  리더가 방향과 우선순위를 어떻게 정리했는가",
  ], gx(0.5), 3.18, gw(14.8), { gap: 0.66, fontSize: 11.2, dotColor: C.secondary });

  slide = pptx.addSlide();
  addChrome(slide, 4, "SKMS", "Question block", "SKMS 연결 질문", "질문 문구는 그대로 사용하고, 개념 이름만 적지 말고 실제 상황과 연결해서 작성합니다.");
  addPanel(slide, gx(0), 2.08, gw(8), 4.52, {
    band: C.accent,
    label: "QUESTION 1",
    title: "의사결정 순간마다 영향을 준 SKMS 개념은 무엇이었습니까?",
    titleSize: 15.5,
    titleH: 0.58,
    body: "그 개념이 구체적으로 어떤 상황에서,\n어떤 방식으로 작용했는지 정리합니다.",
    bodySize: 11.2,
    bodyY: 1.12,
  });
  addPanel(slide, gx(8.5), 2.08, gw(7.5), 4.52, {
    band: C.secondary,
    label: "QUESTION 2",
    title: "오늘 경험을 통해 SKMS가 실제 기업경영에 기여할 수 있다고 느낀 지점은 무엇입니까?",
    titleSize: 15,
    titleH: 0.62,
    body: "의사결정의 질 또는 조직 실행력과 연결해서 적습니다.",
    bodySize: 11.2,
    bodyY: 1.18,
  });

  slide = pptx.addSlide();
  addChrome(slide, 5, "제출", "Write -> Check -> Upload", "작성 및 제출 안내", "팀별 Template 작성과 업로드까지 완료되어야 오늘 과정이 마무리됩니다.");
  addPanel(slide, gx(0), 2.16, gw(8), 4.44, {
    band: C.accentDark,
    label: "WRITE",
    title: "작성 항목",
    titleSize: 18,
    body: "각 조 테이블 공용 PC 내 Template 작성\n조별 제출 필수\nmySUNI 페이지 업로드\n시간 제약 시 일부 조만 전체 공유 진행",
    bodySize: 11.4,
  });
  addPanel(slide, gx(8.5), 2.16, gw(7.5), 4.44, {
    fill: C.accentPale,
    band: C.secondary,
    label: "SUBMIT",
    title: "제출 순서",
    titleSize: 18,
    body: "작성 -> 점검 -> 업로드\n\n마지막에는 업로드 완료까지 확인합니다.",
    bodySize: 11.4,
  });

  finalizeDeck(pptx);
  return pptx;
}

function buildDebriefDeck() {
  const pptx = createDeck({
    subject: "2026 FLP 디브리프 안내 슬라이드 Carbon 2x 버전",
    title: "2026 FLP 디브리프 Carbon 2x",
  });
  let slide;

  const reviews = [
    ["Review Point 1. 경영의 목적", "목표를 무엇으로 두었는지, 그리고 그 기준이 팀 안에서 합의되어 있었는지를 봅니다.", ["우리 팀의 목표는 무엇이었는가", "그 목표는 어떻게 설정했는가", "단기 성과와 장기 관점을 함께 보았는가"]],
    ["Review Point 2. 의사결정의 구조", "누가 결정했는가보다, 어떤 기준으로 결정했는가를 먼저 봅니다.", ["누가 어떤 기준으로 결정했는가", "판단 기준은 팀 안에서 공유되었는가", "더 좋은 판단을 위해 어떤 정보가 더 필요했는가"]],
    ["Review Point 3. 기능 간 연결", "부분 판단이 전체 결과와 어떻게 연결되었는지 확인하는 전사 관점 질문입니다.", ["부분 판단이 전체 결과에 어떤 영향을 주었는가", "기능 간 연결과 조정이 실제로 이루어졌는가", "부분 최적화가 전체 성과를 해친 장면은 없었는가"]],
    ["Review Point 4. 환경 변화 대응", "변화 자체보다, 변화를 읽고 조정한 기준을 정리해 주시면 됩니다.", ["변화 신호를 언제 감지했는가", "환경 변화에 따라 무엇을 유지하고 무엇을 바꿨는가", "전략 수정의 기준은 무엇이었는가"]],
    ["Review Point 5. 리더의 역할", "리더가 답을 냈는지보다, 팀 운영의 질을 어떻게 바꿨는지를 정리합니다.", ["리더가 있어서 달라진 점은 무엇이었는가", "리더는 방향, 우선순위, 역할, 소통을 어떻게 정리했는가", "리더의 개입이 판단의 질을 높였는가"]],
  ];

  slide = pptx.addSlide();
  addChrome(slide, 1, "EDUCATION TEMPLATE", "Reflection / Debrief", "Reflection & Debrief", "팀별 판단과 결과를 SKMS 기준으로 정리합니다", { titleCols: 7, titleSize: 24 });
  addTag(slide, gx(0), 2.34, 1.1, "Self Review");
  addTag(slide, gx(1.7), 2.34, 0.9, "SKMS");
  addTag(slide, gx(3.1), 2.34, 0.9, "Action");
  addPanel(slide, gx(11), 1.74, gw(5), 4.94, {
    band: C.accentDark,
    label: "DEBRIEF SPINE",
    title: "결과 확인보다 판단 기준과 학습 내용을 정리하는 시간입니다.",
    titleSize: 13,
    body: "팀별 결과를 확인하고,\nSelf Review와 SKMS 연결 질문을 통해\n오늘 경험을 판단 구조와 현업 언어로 정리합니다.",
    bodySize: 10,
    bodyY: 0.92,
  });

  slide = pptx.addSlide();
  addChrome(slide, 2, "진행 순서", "4-step flow", "오늘 디브리프는 4단계로 진행합니다", "팀별 작성이 먼저이고, 전체 공유는 그 다음입니다.");
  addPanel(slide, gx(0), 2.02, gw(10), 4.58, {
    band: C.accent,
    label: "PROCESS",
    title: "진행 흐름",
    titleSize: 18,
    body: "1. 팀 결과 확인\n2. 팀별 Self Review\n3. SKMS 연결 질문 토의\n4. 대표조 공유 및 제출",
    bodySize: 12,
  });
  addPanel(slide, gx(10.5), 2.02, gw(5.5), 4.58, {
    fill: C.accentPale,
    band: C.secondary,
    label: "TIME",
    title: "60분",
    titleSize: 24,
    body: "팀별 작성과 제출까지 포함한 시간입니다.",
    bodySize: 11.2,
    bodyY: 1.02,
  });

  slide = pptx.addSlide();
  addChrome(slide, 3, "결과 확인", "Result -> Judgment", "먼저 결과를 확인하겠습니다", "결과가 좋았던 팀도, 좋지 않았던 팀도 모두 같은 기준으로 보겠습니다.");
  addPanel(slide, gx(0), 2.12, gw(7), 4.4, {
    band: C.accentDark,
    label: "RESULT",
    title: "좌측에서 볼 것",
    titleSize: 17,
    body: "우리 팀의 결과는 어땠는가\n어떤 장면이 가장 잘되었는가\n어떤 부분이 꼬였는가",
    bodySize: 11.2,
  });
  addPanel(slide, gx(7.5), 2.12, gw(8.5), 4.4, {
    fill: C.warm,
    band: C.secondary,
    label: "JUDGMENT",
    title: "우측에서 볼 것",
    titleSize: 17,
    body: "그 결과는 어떤 판단에서 나왔는가\n결과보다 판단 구조를 먼저 본다",
    bodySize: 11.2,
  });

  slide = pptx.addSlide();
  addChrome(slide, 4, "Self Review", "4-step writing", "Self Review는 이 순서로 정리합니다", "서술형으로 길게 쓰기보다 핵심 문장 중심으로 정리해 주시면 됩니다.");
  addPanel(slide, gx(0), 2.12, gw(4), 4.42, { band: C.accent, label: "1", title: "사실", titleSize: 17, body: "우리는 무엇을 결정했는가", bodySize: 11 });
  addPanel(slide, gx(4), 2.12, gw(4), 4.42, { band: C.secondary, label: "2", title: "이유", titleSize: 17, body: "왜 그렇게 판단했는가", bodySize: 11 });
  addPanel(slide, gx(8), 2.12, gw(4), 4.42, { band: C.accent, label: "3", title: "결과", titleSize: 17, body: "무엇이 좋아졌고 무엇이 꼬였는가", bodySize: 11 });
  addPanel(slide, gx(12), 2.12, gw(4), 4.42, { band: C.secondary, label: "4", title: "학습", titleSize: 17, body: "다음에는 무엇을 바꿀 것인가", bodySize: 11 });

  reviews.forEach((review, idx) => {
    slide = pptx.addSlide();
    addChrome(slide, 5 + idx, "Review Point", `Point ${idx + 1}`, review[0], review[1], { titleCols: 12 });
    addPanel(slide, gx(0), 2.14, gw(16), 4.4, {
      band: idx % 2 === 0 ? C.accentDark : C.secondary,
      label: "TEAM QUESTIONS",
      title: "팀별로 정리할 질문",
      titleSize: 17,
    });
    addBulletList(slide, review[2], gx(0.5), 3.2, gw(14.6), { gap: 0.9, fontSize: 11.4, dotColor: idx % 2 === 0 ? C.accent : C.secondary });
  });

  slide = pptx.addSlide();
  addChrome(slide, 10, "SKMS", "Question 1", "SKMS 연결 질문 1", "개념 이름만 적지 말고, 실제 장면과 연결해서 정리해 주십시오.");
  addPanel(slide, gx(0), 2.12, gw(16), 4.42, {
    band: C.accentDark,
    label: "QUESTION",
    title: "시뮬레이션을 진행하면서 의사결정 순간마다 떠올랐거나, 실제로 팀의 판단에 영향을 준 SKMS의 개념이 있다면 무엇이었습니까?",
    titleSize: 15.5,
    titleH: 0.6,
    body: "그 개념이 구체적으로 어떤 상황에서, 어떤 방식으로 작용했는지 함께 정리합니다.",
    bodySize: 11.4,
    bodyY: 1.14,
  });

  slide = pptx.addSlide();
  addChrome(slide, 11, "SKMS", "Question 2", "SKMS 연결 질문 2", "오늘 경험을 현업 장면과 연결해서 적어 주시면 됩니다.");
  addPanel(slide, gx(0), 2.12, gw(16), 4.42, {
    band: C.secondary,
    label: "QUESTION",
    title: "오늘 경험을 통해 SKMS가 실제 기업경영에서 의사결정의 질을 높이거나 조직의 실행력을 강화하는 데 기여할 수 있다고 느낀 지점이 있다면 무엇입니까?",
    titleSize: 15.5,
    titleH: 0.6,
    body: "현업의 어떤 장면에 적용할 수 있는지도 함께 정리합니다.",
    bodySize: 11.4,
    bodyY: 1.14,
  });

  slide = pptx.addSlide();
  addChrome(slide, 12, "마무리", "Share / Submit", "공유 및 제출 마무리", "공유는 일부 팀만 진행할 수 있지만, 모든 조는 제출까지 완료해야 합니다.");
  addPanel(slide, gx(0), 2.14, gw(7.5), 4.4, {
    band: C.accentDark,
    label: "SHARE",
    title: "전체 공유 기준",
    titleSize: 17,
    body: "성과가 높았던 팀\n판단 기준이 선명했던 팀\n실패했지만 학습이 분명했던 팀",
    bodySize: 11.2,
  });
  addPanel(slide, gx(8), 2.14, gw(8), 4.4, {
    fill: C.accentPale,
    band: C.secondary,
    label: "SUBMIT",
    title: "제출 체크리스트",
    titleSize: 17,
    body: "대표조 또는 우수조 일부 전체 공유\n팀별 Template final check\n조별 제출 필수\nmySUNI 업로드 완료 확인",
    bodySize: 11.2,
  });

  finalizeDeck(pptx);
  return pptx;
}

async function main() {
  const prenoticePath = path.join(__dirname, "output", "2026_FLP_사전고지_공지슬라이드_Carbon2x.pptx");
  const debriefPath = path.join(__dirname, "output", "2026_FLP_디브리프_공지슬라이드_Carbon2x.pptx");

  await buildPrenoticeDeck().writeFile({ fileName: prenoticePath });
  console.log(`Wrote deck to ${prenoticePath}`);
  await buildDebriefDeck().writeFile({ fileName: debriefPath });
  console.log(`Wrote deck to ${debriefPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
