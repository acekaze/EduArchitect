"use strict";

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { FontLibrary } = require("skia-canvas");
const { autoFontSize } = require("./pptxgenjs_helpers/text");
const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require("./pptxgenjs_helpers/layout");

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
const SHAPE = new pptxgen().ShapeType;

const C = {
  white: "FFFFFF",
  black: "111111",
  dark: "2F2F2F",
  gray1: "F6F6F6",
  gray2: "ECECEC",
  gray3: "D8D8D8",
  gray4: "A8A8A8",
  gray5: "666666",
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function makeDeck(title, subject) {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "A4LAND", width: 11.69, height: 8.27 });
  pptx.layout = "A4LAND";
  pptx.author = "OpenAI Codex";
  pptx.company = "전종목";
  pptx.subject = subject;
  pptx.title = title;
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

function addHeader(slide, title, subtitle) {
  slide.addShape(SHAPE.roundRect, {
    x: 0.32,
    y: 0.28,
    w: 11.05,
    h: 0.72,
    rectRadius: 0.05,
    line: { color: C.dark, width: 1 },
    fill: { color: C.dark },
  });
  slide.addText(title, {
    x: 0.52,
    y: 0.43,
    w: 5.8,
    h: 0.24,
    fontFace: FONT_FAMILY,
    fontSize: 16,
    bold: true,
    color: C.white,
    margin: 0,
  });
  slide.addText(subtitle, {
    x: 0.54,
    y: 0.68,
    w: 5.8,
    h: 0.12,
    fontFace: FONT_FAMILY,
    fontSize: 7.8,
    color: C.white,
    margin: 0,
  });
}

function addBox(slide, x, y, w, h, title, fill = C.white) {
  slide.addShape(SHAPE.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.04,
    line: { color: C.gray4, width: 1 },
    fill: { color: fill },
  });
  slide.addText(
    title,
    textOpts(title, x + 0.12, y + 0.08, w - 0.24, 0.18, {
      fontSize: 10,
      minFontSize: 8.5,
      maxFontSize: 10,
      bold: true,
      color: C.black,
    })
  );
}

function addFooter(slide, left, right) {
  slide.addShape(SHAPE.line, {
    x: 0.32,
    y: 7.0,
    w: 11.05,
    h: 0,
    line: { color: C.gray3, width: 0.9 },
  });
  slide.addText(left, {
    x: 0.34,
    y: 7.15,
    w: 6.0,
    h: 0.12,
    fontFace: FONT_FAMILY,
    fontSize: 7.2,
    color: C.gray5,
    margin: 0,
  });
  slide.addText(right, {
    x: 9.3,
    y: 7.15,
    w: 1.8,
    h: 0.12,
    fontFace: FONT_FAMILY,
    fontSize: 7.2,
    color: C.gray5,
    align: "right",
    margin: 0,
  });
}

function finalizeSlide(slide, pptx) {
  warnIfSlideHasOverlaps(slide, pptx, {
    muteContainment: true,
    ignoreDecorativeShapes: true,
  });
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function buildManagerBrief() {
  const pptx = makeDeck(
    "기획력 과장승진자 팀 미션 상사용 흑백 출력용",
    "기획력 과장승진자 팀 미션 상사용 브리프"
  );
  const slide = pptx.addSlide();
  slide.background = { color: C.white };

  addHeader(slide, "팀 미션 상사용 브리프", "상사 역할만 먼저 읽고, 과장의 질문을 받은 뒤 필요한 만큼만 답합니다.");

  addBox(slide, 0.32, 1.18, 5.62, 4.68, "1. 브리프", C.white);
  slide.addText(
    "우리 조직 팀 빌딩 프로그램을 하자.",
    textOpts("우리 조직 팀 빌딩 프로그램을 하자.", 0.48, 1.5, 4.9, 0.16, {
      fontSize: 9.6,
      minFontSize: 8.6,
      maxFontSize: 9.6,
      color: C.dark,
      bold: true,
    })
  );
  slide.addText([
    { text: "조직원들끼리 갈등이 있는 것 같아 보임", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.7, color: C.black } },
    { text: "각자 자기 일은 잘 하지만 서로 소통이 안 되니 분위기도 좋지 않음", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.7, color: C.black } },
    { text: "완전히 바뀌진 않아도 이야기하고 갈등이 해소되는 시작이 되길 바람", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.7, color: C.black } },
    { text: "술자리 중심 회식 프로그램은 제외하고 싶음", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.7, color: C.black } },
    { text: "외부 이미지로도 괜찮아 보이는 프로그램이면 좋겠음", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.7, color: C.black } },
    { text: "비슷한 프로그램 사례가 있으면 참고하고 싶음", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.7, color: C.black } },
  ], {
    x: 0.46,
    y: 1.86,
    w: 5.0,
    h: 3.2,
    margin: 0,
    valign: "top",
  });

  addBox(slide, 6.16, 1.18, 5.21, 2.2, "2. 상사 역할 유의사항", C.gray1);
  slide.addText([
    { text: "브리프는 과장에게 한 번에 다 주지 말고 질문이 오면 답한다", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.black } },
    { text: "과장이 맥락, 기대 결과, 제외 조건을 묻는지 본다", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.black } },
    { text: "좋은 질문이 나오면 짧고 선명하게 답한다", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.black } },
    { text: "팀원이 직접 브리프를 보지 못하게 한다", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.black } },
  ], {
    x: 6.32,
    y: 1.54,
    w: 4.7,
    h: 1.42,
    margin: 0,
    valign: "top",
  });

  addBox(slide, 6.16, 3.62, 5.21, 2.24, "3. 과장이 물어오면 확인해야 할 핵심", C.gray2);
  slide.addText([
    { text: "왜 지금 이 과제를 해야 하는가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.7, color: C.black } },
    { text: "상사가 기대하는 결과는 무엇인가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.7, color: C.black } },
    { text: "반드시 제외해야 할 것은 무엇인가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.7, color: C.black } },
    { text: "성공했다고 말할 기준은 무엇인가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.7, color: C.black } },
  ], {
    x: 6.32,
    y: 3.98,
    w: 4.58,
    h: 1.46,
    margin: 0,
    valign: "top",
  });

  addBox(slide, 0.32, 6.08, 11.05, 0.72, "진행 메모", C.white);
  slide.addText(
    "이 자료는 상사 역할 전용입니다. 과장과 팀원에게는 브리프 전체를 보여주지 않고, 질문과 대화를 통해 필요한 정보만 전달하세요.",
    textOpts(
      "이 자료는 상사 역할 전용입니다. 과장과 팀원에게는 브리프 전체를 보여주지 않고, 질문과 대화를 통해 필요한 정보만 전달하세요.",
      0.48,
      6.36,
      10.4,
      0.18,
      {
        fontSize: 8.5,
        minFontSize: 7.8,
        maxFontSize: 8.5,
        color: C.dark,
      }
    )
  );

  addFooter(slide, "역할 분리의 핵심: 과장이 질문으로 맥락을 확보하게 만든다.", "FST 기획력 과장승진자 과정");
  finalizeSlide(slide, pptx);
  return pptx;
}

function buildParticipantSheet() {
  const pptx = makeDeck(
    "기획력 과장승진자 팀 미션 작성지 흑백 출력용",
    "기획력 과장승진자 팀 미션 작성지"
  );
  const slide = pptx.addSlide();
  slide.background = { color: C.white };

  addHeader(slide, "팀 미션 과장·팀원용 작성지", "상사 브리프는 보지 말고, 과장이 질문해 정리한 내용으로만 작성합니다.");

  addBox(slide, 0.32, 1.18, 3.2, 1.2, "1. 과장이 팀원에게 전달할 것", C.gray1);
  slide.addText("맥락 설명", { x: 0.48, y: 1.55, w: 1.0, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.dark, margin: 0 });
  slide.addText("기대 결과", { x: 0.48, y: 1.82, w: 1.0, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.dark, margin: 0 });
  slide.addText("일정", { x: 1.72, y: 1.55, w: 0.6, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.dark, margin: 0 });
  slide.addText("특이사항", { x: 1.72, y: 1.82, w: 0.8, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.dark, margin: 0 });
  slide.addText("참고 자료 또는 노하우", { x: 0.48, y: 2.08, w: 1.6, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.dark, margin: 0 });

  addBox(slide, 3.74, 1.18, 4.02, 5.44, "2. 한 장 기획안", C.white);
  slide.addText("안건", { x: 3.92, y: 1.56, w: 0.5, h: 0.12, fontFace: FONT_FAMILY, fontSize: 9.2, color: C.dark, margin: 0 });
  slide.addText("Why", { x: 3.92, y: 2.18, w: 0.5, h: 0.12, fontFace: FONT_FAMILY, fontSize: 9.2, color: C.dark, margin: 0 });
  slide.addText("What", { x: 3.92, y: 3.08, w: 0.5, h: 0.12, fontFace: FONT_FAMILY, fontSize: 9.2, color: C.dark, margin: 0 });
  slide.addText("How", { x: 3.92, y: 3.98, w: 0.5, h: 0.12, fontFace: FONT_FAMILY, fontSize: 9.2, color: C.dark, margin: 0 });
  slide.addText("If", { x: 3.92, y: 5.38, w: 0.5, h: 0.12, fontFace: FONT_FAMILY, fontSize: 9.2, color: C.dark, margin: 0 });

  addBox(slide, 8.0, 1.18, 3.37, 2.24, "3. 발표 전 마지막 점검", C.gray1);
  slide.addText([
    { text: "Why가 상대 입장에서도 들리는가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.2, color: C.black } },
    { text: "What이 한 문장으로 남는가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.2, color: C.black } },
    { text: "How가 실행 가능하게 보이는가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.2, color: C.black } },
    { text: "If가 의미와 기대효과를 남기는가", options: { bullet: { indent: 10 }, hanging: 3, paraSpaceAfter: 4, fontFace: FONT_FAMILY, fontSize: 8.2, color: C.black } },
  ], {
    x: 8.16,
    y: 1.56,
    w: 2.9,
    h: 1.46,
    margin: 0,
    valign: "top",
  });

  addBox(slide, 8.0, 3.62, 3.37, 3.0, "4. 피드백 메모", C.gray2);
  slide.addText("가장 좋았던 점", { x: 8.16, y: 4.0, w: 1.0, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.dark, margin: 0 });
  slide.addText("가장 보완하면 좋을 점", { x: 8.16, y: 4.98, w: 1.2, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.dark, margin: 0 });
  slide.addText("내일 현업에 바로 가져갈 한 가지", { x: 8.16, y: 5.96, w: 1.8, h: 0.12, fontFace: FONT_FAMILY, fontSize: 8.5, color: C.dark, margin: 0 });

  addFooter(slide, "작성 원칙: 줄 없이 박스 안에 직접 쓴다. 많이 쓰는 것보다 구조가 선명한 것이 중요하다.", "FST 기획력 과장승진자 과정");
  finalizeSlide(slide, pptx);
  return pptx;
}

async function writeDeck(pptx, filename) {
  ensureDir(path.join(__dirname, "output"));
  const outputFile = path.join(__dirname, "output", filename);
  await pptx.writeFile({ fileName: outputFile });
  console.log(`Wrote deck to ${outputFile}`);
}

async function main() {
  await writeDeck(
    buildManagerBrief(),
    "기획력_과장승진자_팀미션_상사용_흑백출력용.pptx"
  );
  await writeDeck(
    buildParticipantSheet(),
    "기획력_과장승진자_팀미션_작성지_흑백출력용.pptx"
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
