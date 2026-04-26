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
const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require("./pptxgenjs_helpers/layout");

const pptx = new pptxgen();
pptx.defineLayout({ name: "A4LAND", width: 11.69, height: 8.27 });
pptx.layout = "A4LAND";
pptx.author = "OpenAI Codex";
pptx.company = "전종목";
pptx.subject = "기획력 과장승진자 팀 미션 실습지 흑백 출력용";
pptx.title = "기획력 과장승진자 팀 미션 실습지";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: FONT_FAMILY,
  bodyFontFace: FONT_FAMILY,
  lang: "ko-KR",
};

const C = {
  white: "FFFFFF",
  black: "111111",
  dark: "303030",
  gray1: "F5F5F5",
  gray2: "ECECEC",
  gray3: "D9D9D9",
  gray4: "A8A8A8",
  gray5: "666666",
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
    fontSize: extra.fontSize || 18,
    minFontSize: extra.minFontSize || 8,
    maxFontSize: extra.maxFontSize || extra.fontSize || 20,
    mode: "auto",
    margin: extra.margin !== undefined ? extra.margin : 0,
    breakLine: false,
    valign: extra.valign || "top",
    align: extra.align || "left",
    color: extra.color || C.black,
    bold: extra.bold || false,
    italic: extra.italic || false,
    paraSpaceAfter: extra.paraSpaceAfter || 0,
  });
  return { ...fit, ...extra };
}

function addBox(slide, cfg) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: cfg.h,
    rectRadius: cfg.radius || 0.04,
    line: { color: cfg.line || C.gray4, width: cfg.lineWidth || 1 },
    fill: { color: cfg.fill || C.white },
  });
  if (cfg.title) {
    slide.addText(
      cfg.title,
      textOpts(cfg.title, cfg.x + 0.12, cfg.y + 0.08, cfg.w - 0.24, 0.24, {
        fontSize: 10,
        minFontSize: 8.5,
        maxFontSize: 10,
        bold: true,
        color: C.black,
      })
    );
  }
}

function addRuleLine(slide, x, y, w) {
  slide.addShape(pptx.ShapeType.line, {
    x,
    y,
    w,
    h: 0,
    line: { color: C.gray4, width: 0.9 },
  });
}

function addLabeledLine(slide, x, y, label, lineW) {
  slide.addText(label, {
    x,
    y: y - 0.03,
    w: 0.9,
    h: 0.14,
    fontFace: FONT_FAMILY,
    fontSize: 8,
    color: C.dark,
    margin: 0,
  });
}

function addWriteLines(slide, x, yTop, w, count, gap = 0.16) {
  for (let i = 0; i < count; i += 1) {
    addRuleLine(slide, x, yTop - i * gap, w);
  }
}

function finalizeSlide(slide) {
  warnIfSlideHasOverlaps(slide, pptx, {
    muteContainment: true,
    ignoreDecorativeShapes: true,
  });
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function buildSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.32,
    y: 0.28,
    w: 11.05,
    h: 0.72,
    rectRadius: 0.05,
    line: { color: C.dark, width: 1 },
    fill: { color: C.dark },
  });
  slide.addText("기획력 과장승진자 과정 팀 미션 실습지", {
    x: 0.52,
    y: 0.43,
    w: 5.2,
    h: 0.24,
    fontFace: FONT_FAMILY,
    fontSize: 16,
    bold: true,
    color: C.white,
    margin: 0,
  });
  slide.addText("상사-과장-팀원 역할로 브리핑과 기획 재구성을 실습합니다.", {
    x: 0.54,
    y: 0.68,
    w: 5.0,
    h: 0.14,
    fontFace: FONT_FAMILY,
    fontSize: 7.8,
    color: C.white,
    margin: 0,
  });

  addBox(slide, { x: 0.32, y: 1.16, w: 2.94, h: 2.72, title: "1. 상사 브리프", fill: C.white });
  slide.addText(
    "우리 조직 팀 빌딩 프로그램을 하자.",
    textOpts("우리 조직 팀 빌딩 프로그램을 하자.", 0.44, 1.48, 2.48, 0.16, {
      fontSize: 8.2,
      minFontSize: 7.8,
      maxFontSize: 8.2,
      color: C.dark,
    })
  );
  slide.addText([
    { text: "조직원들끼리 갈등이 있는 것 같아 보임", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 3, fontFace: FONT_FAMILY, fontSize: 8, color: C.black } },
    { text: "각자 자기 일은 잘 하지만 서로 소통이 안 되니 분위기도 좋지 않음", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 3, fontFace: FONT_FAMILY, fontSize: 8, color: C.black } },
    { text: "완전히 바뀌진 않아도 갈등이 해소되는 시작이 되길 바람", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 3, fontFace: FONT_FAMILY, fontSize: 8, color: C.black } },
    { text: "술자리 중심 회식 프로그램은 제외하고 싶음", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 3, fontFace: FONT_FAMILY, fontSize: 8, color: C.black } },
    { text: "외부 이미지로도 괜찮아 보이는 프로그램이면 좋겠음", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 3, fontFace: FONT_FAMILY, fontSize: 8, color: C.black } },
    { text: "비슷한 프로그램 사례가 있으면 참고하고 싶음", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 3, fontFace: FONT_FAMILY, fontSize: 8, color: C.black } },
  ], {
    x: 0.42,
    y: 1.74,
    w: 2.58,
    h: 1.86,
    margin: 0,
    valign: "top",
  });

  addBox(slide, { x: 0.32, y: 3.96, w: 2.94, h: 1.74, title: "2. 과장 역할 체크 질문", fill: C.gray1 });
  slide.addText([
    { text: "왜 지금 이 과제를 해야 하나", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 1, fontFace: FONT_FAMILY, fontSize: 7.4, color: C.black } },
    { text: "상사는 어떤 결과를 기대하나", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 1, fontFace: FONT_FAMILY, fontSize: 7.4, color: C.black } },
    { text: "반드시 제외해야 할 것은 무엇인가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 1, fontFace: FONT_FAMILY, fontSize: 7.4, color: C.black } },
    { text: "성공했다고 말할 기준은 무엇인가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 1, fontFace: FONT_FAMILY, fontSize: 7.4, color: C.black } },
    { text: "일정, 예산, 대상, 운영 방식은 어느 정도까지 열려 있나", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 1, fontFace: FONT_FAMILY, fontSize: 7.4, color: C.black } },
  ], {
    x: 0.42,
    y: 4.3,
    w: 2.58,
    h: 0.8,
    margin: 0,
    valign: "top",
  });
  slide.addText(
    "핵심: 상사의 말을 복사하지 말고, 맥락과 기대를 정리해 번역한다.",
    textOpts("핵심: 상사의 말을 복사하지 말고, 맥락과 기대를 정리해 번역한다.", 0.42, 5.24, 2.56, 0.16, {
      fontSize: 6.8,
      minFontSize: 6.4,
      maxFontSize: 6.8,
      color: C.gray5,
    })
  );

  addBox(slide, { x: 3.44, y: 1.16, w: 3.4, h: 1.82, title: "3. 팀원에게 전달할 때 포함할 것", fill: C.gray2 });
  let y = 1.62;
  ["맥락 설명", "기대 결과", "일정", "특이사항", "참고 자료 또는 노하우"].forEach((label) => {
    addLabeledLine(slide, 3.58, y, label, 3.12);
    y += 0.27;
  });

  addBox(slide, { x: 3.44, y: 3.16, w: 3.4, h: 3.1, title: "4. 한 장 기획안", fill: C.white });
  slide.addText("안건", { x: 3.58, y: 3.52, w: 0.46, h: 0.12, fontFace: FONT_FAMILY, fontSize: 9, color: C.dark, margin: 0 });
  slide.addText("Why", { x: 3.58, y: 4.12, w: 0.46, h: 0.12, fontFace: FONT_FAMILY, fontSize: 9, color: C.dark, margin: 0 });
  slide.addText("What", { x: 3.58, y: 4.72, w: 0.46, h: 0.12, fontFace: FONT_FAMILY, fontSize: 9, color: C.dark, margin: 0 });
  slide.addText("How", { x: 3.58, y: 5.32, w: 0.46, h: 0.12, fontFace: FONT_FAMILY, fontSize: 9, color: C.dark, margin: 0 });
  slide.addText("If", { x: 3.58, y: 6.46, w: 0.46, h: 0.12, fontFace: FONT_FAMILY, fontSize: 9, color: C.dark, margin: 0 });

  addBox(slide, { x: 7.02, y: 1.16, w: 4.35, h: 5.1, title: "5. 발표 전 마지막 점검 / 6. 피드백 메모", fill: C.gray1 });
  slide.addText("발표 전 마지막 점검", {
    x: 7.16,
    y: 1.5,
    w: 1.5,
    h: 0.14,
    fontFace: FONT_FAMILY,
    fontSize: 9,
    bold: true,
    color: C.dark,
    margin: 0,
  });
  slide.addText([
    { text: "Why가 상대 입장에서도 들리는가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 2, fontFace: FONT_FAMILY, fontSize: 8.1, color: C.black } },
    { text: "What이 한 문장으로 남는가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 2, fontFace: FONT_FAMILY, fontSize: 8.1, color: C.black } },
    { text: "How가 실행 가능하게 보이는가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 2, fontFace: FONT_FAMILY, fontSize: 8.1, color: C.black } },
    { text: "If가 의미와 기대효과를 남기는가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 2, fontFace: FONT_FAMILY, fontSize: 8.1, color: C.black } },
  ], {
    x: 7.14,
    y: 1.78,
    w: 3.72,
    h: 1.02,
    margin: 0,
    valign: "top",
  });

  slide.addText("피드백 메모", {
    x: 7.16,
    y: 2.96,
    w: 1.0,
    h: 0.14,
    fontFace: FONT_FAMILY,
    fontSize: 9,
    bold: true,
    color: C.dark,
    margin: 0,
  });
  slide.addText("가장 좋았던 점", { x: 7.18, y: 3.28, w: 0.9, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.2, color: C.dark, margin: 0 });
  slide.addText("가장 보완하면 좋을 점", { x: 7.18, y: 4.34, w: 1.2, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.2, color: C.dark, margin: 0 });
  slide.addText("내일 현업에 바로 가져갈 한 가지", { x: 7.18, y: 5.4, w: 1.7, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.2, color: C.dark, margin: 0 });

  addRuleLine(slide, 0.32, 6.48, 11.05);
  slide.addText("진행 팁: 상사만 먼저 브리프를 읽고, 과장은 질문으로 맥락을 정리한 뒤 팀원에게 전달합니다.", {
    x: 0.34,
    y: 7.72,
    w: 4.9,
    h: 0.12,
    fontFace: FONT_FAMILY,
    fontSize: 7.2,
    color: C.gray5,
    margin: 0,
  });
  slide.addText("FST 기획력 과장승진자 과정", {
    x: 9.45,
    y: 7.72,
    w: 1.6,
    h: 0.12,
    fontFace: FONT_FAMILY,
    fontSize: 7.2,
    align: "right",
    color: C.gray5,
    margin: 0,
  });

  finalizeSlide(slide);
}

async function main() {
  ensureDir(path.join(__dirname, "output"));
  buildSlide();
  const outputFile = path.join(
    __dirname,
    "output",
    "기획력_과장승진자_팀미션_실습지_흑백출력용.pptx"
  );
  await pptx.writeFile({ fileName: outputFile });
  console.log(`Wrote deck to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
