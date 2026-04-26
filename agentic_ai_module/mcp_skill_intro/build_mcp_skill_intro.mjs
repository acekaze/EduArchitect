import pptxgen from "file:///C:/Users/aceka/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs/dist/pptxgen.es.js";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Codex";
pptx.subject = "MCP와 스킬 소개";
pptx.title = "MCP와 스킬 소개";
pptx.company = "전종목 AI 활용 과정";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: "Pretendard Black",
  bodyFontFace: "Pretendard",
  lang: "ko-KR",
};

const C = {
  ink: "111827",
  slate: "1F2937",
  muted: "64748B",
  line: "D7DEE8",
  white: "FFFFFF",
  paper: "F7F7F3",
  blue: "0F3A66",
  cyan: "1B7C86",
  green: "2F7D4A",
  orange: "D9730D",
  red: "B42318",
  softBlue: "EAF2FF",
  softGreen: "EAF7EF",
  softOrange: "FFF4E6",
  softCyan: "E8F6F7",
};

const FONT_BODY = "Pretendard";
const FONT_HEAD = "Pretendard Black";

function addText(slide, text, opts) {
  slide.addText(text, {
    fontFace: opts.head ? FONT_HEAD : FONT_BODY,
    margin: 0,
    breakLine: false,
    fit: "shrink",
    ...opts,
  });
}

function addRail(slide, { x, y, w, h, color, fill, title, body, tag }) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: fill },
    line: { color: fill },
  });
  slide.addShape(pptx.ShapeType.line, {
    x, y: y - 0.04, w, h: 0,
    line: { color, width: 2.4 },
  });
  addText(slide, tag, {
    x: x + 0.22, y: y + 0.22, w: 1.05, h: 0.18,
    fontSize: 7.6, color, head: true,
  });
  addText(slide, title, {
    x: x + 0.22, y: y + 0.56, w: w - 0.44, h: 0.42,
    fontSize: 15.4, bold: true, color: C.ink, head: true,
  });
  addText(slide, body, {
    x: x + 0.22, y: y + 1.15, w: w - 0.44, h: 0.82,
    fontSize: 10.1, color: C.slate,
  });
}

const slide = pptx.addSlide();
slide.background = { color: C.white };

addText(slide, "MCP와 스킬은 오늘 실습이 아니라 다음 확장 단계다", {
  x: 0.74, y: 0.72, w: 10.9, h: 0.58,
  fontSize: 22, bold: true, color: C.ink, head: true,
});
addText(slide, "일반 직장인 과정에서는 개념만 소개하고, 실제 설정과 제작은 심화 과정으로 분리한다.", {
  x: 0.76, y: 1.28, w: 10.8, h: 0.26,
  fontSize: 9.8, color: C.muted, head: true,
});

slide.addShape(pptx.ShapeType.rect, {
  x: 0.78, y: 2.05, w: 2.26, h: 2.12,
  fill: { color: C.ink },
  line: { color: C.ink },
});
addText(slide, "오늘", {
  x: 1.07, y: 2.38, w: 1.68, h: 0.28,
  fontSize: 13, color: C.white, bold: true, head: true,
  align: "center",
});
addText(slide, "설치\nFast 사용\n첫 요청문", {
  x: 1.02, y: 2.9, w: 1.76, h: 0.78,
  fontSize: 13.5, color: C.white, bold: true, head: true,
  align: "center",
});

slide.addShape(pptx.ShapeType.line, {
  x: 3.08, y: 3.12, w: 1.18, h: 0,
  line: { color: C.line, width: 2, endArrowType: "triangle" },
});

slide.addShape(pptx.ShapeType.roundRect, {
  x: 4.34, y: 2.38, w: 2.46, h: 1.46,
  rectRadius: 0.08,
  fill: { color: C.softCyan },
  line: { color: C.cyan, width: 1.2 },
});
addText(slide, "Agentic AI", {
  x: 4.66, y: 2.86, w: 1.82, h: 0.24,
  fontSize: 13.5, color: C.ink, bold: true, head: true,
  align: "center",
});
addText(slide, "일을 맡기는 환경", {
  x: 4.72, y: 3.2, w: 1.7, h: 0.18,
  fontSize: 8.2, color: C.muted, head: true,
  align: "center",
});

slide.addShape(pptx.ShapeType.line, {
  x: 6.84, y: 2.78, w: 0.94, h: -0.52,
  line: { color: C.line, width: 1.6, endArrowType: "triangle" },
});
slide.addShape(pptx.ShapeType.line, {
  x: 6.84, y: 3.43, w: 0.94, h: 0.52,
  line: { color: C.line, width: 1.6, endArrowType: "triangle" },
});

addRail(slide, {
  x: 7.92, y: 1.78, w: 4.58, h: 1.86,
  color: C.blue,
  fill: C.softBlue,
  tag: "MCP",
  title: "외부 도구와 연결하는 통로",
  body: "파일, 브라우저, 일정, 메일, 사내 시스템처럼 AI가 접근할 수 있는 도구를 정한다.",
});
addRail(slide, {
  x: 7.92, y: 4.05, w: 4.58, h: 1.86,
  color: C.orange,
  fill: C.softOrange,
  tag: "SKILL",
  title: "반복 업무 방식을 저장하는 단위",
  body: "자주 쓰는 절차, 문체, 검토 순서, 산출물 형식을 재사용 가능한 방식으로 정리한다.",
});

slide.addShape(pptx.ShapeType.line, {
  x: 0.78, y: 5.98, w: 11.72, h: 0,
  line: { color: C.line, width: 0.9 },
});
addText(slide, "이번 과정의 처리", {
  x: 0.8, y: 6.22, w: 1.6, h: 0.2,
  fontSize: 8.4, color: C.green, bold: true, head: true,
});
addText(slide, "MCP와 스킬은 5분 소개만 한다. 실제 연결, 권한 설계, 스킬 제작은 다음 과정에서 다룬다.", {
  x: 2.12, y: 6.2, w: 9.8, h: 0.26,
  fontSize: 13.2, color: C.ink, bold: true, head: true,
});
addText(slide, "강의 멘트: 오늘은 AI에게 일을 맡기는 기본 환경을 만든다. 외부 연결과 반복 업무 자동화는 더 높은 권한을 다루므로 심화 과정에서 실습한다.", {
  x: 2.12, y: 6.58, w: 9.86, h: 0.24,
  fontSize: 8.8, color: C.muted,
});

if (typeof slide.addNotes === "function") {
  slide.addNotes("이 장은 Antigravity 설치 실습 뒤, Codex 비교 시연 전후에 넣는다. 핵심은 MCP와 스킬을 흥미 요소로 소개하되 오늘 실습 범위에서 분리하는 것이다.");
}

const out = "C:/코딩/교육설계/agentic_ai_module/mcp_skill_intro/mcp_skill_소개_1페이지.pptx";
await pptx.writeFile({ fileName: out });
console.log(out);
