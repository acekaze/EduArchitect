import pptxgen from "file:///C:/Users/aceka/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs/dist/pptxgen.es.js";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Codex";
pptx.subject = "Agentic AI 추가 모듈";
pptx.title = "Agentic AI 추가 모듈";
pptx.company = "전종목 AI 활용 과정";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: "Pretendard Black",
  bodyFontFace: "Pretendard",
  lang: "ko-KR",
};

const W = 13.333;
const H = 7.5;
const C = {
  ink: "111827",
  muted: "64748B",
  line: "D7DEE8",
  paper: "F7F7F3",
  white: "FFFFFF",
  blue: "0F3A66",
  cyan: "1B7C86",
  green: "2F7D4A",
  orange: "D9730D",
  red: "B42318",
  dark: "101318",
  slate: "1F2937",
  softBlue: "EAF2FF",
  softGreen: "EAF7EF",
  softOrange: "FFF4E6",
  softRed: "FDECEC",
  softCyan: "E8F6F7",
};

const FONT_BODY = "Pretendard";
const FONT_HEAD = "Pretendard Black";
const FONT = FONT_BODY;
const ASSET_DIR = "C:/코딩/교육설계/agentic_ai_module/assets";
const safe = { x: 0.72, y: 0.58, w: 11.9, h: 6.2 };

function asset(name) {
  return `${ASSET_DIR}/${name}`;
}

function addRaster(slide, name, x, y, w, h) {
  slide.addImage({ path: asset(name), x, y, w, h });
}

function addNotes(slide, notes) {
  if (!notes) return;
  if (typeof slide.addNotes === "function") slide.addNotes(notes);
}

function addHeader(slide, no, section = "AGENTIC AI", dark = false) {
  slide.addText(section, {
    x: 0.55, y: 0.22, w: 3.8, h: 0.22,
    fontFace: FONT_HEAD, fontSize: 5.5, bold: true,
    color: dark ? "AFC0D5" : "8A97A8",
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });
  slide.addText(String(no).padStart(2, "0"), {
    x: 12.18, y: 0.22, w: 0.62, h: 0.24,
    fontFace: FONT, fontSize: 5.5,
    color: dark ? "AFC0D5" : "8A97A8",
    align: "right",
    margin: 0,
  });
}

function bg(slide, color = C.white) {
  slide.background = { color };
}

function titleSlide({ no, title, subtitle, dark = false, section, notes, illustration }) {
  const slide = pptx.addSlide();
  bg(slide, dark ? C.dark : C.white);
  addHeader(slide, no, section, dark);
  const color = dark ? C.white : C.ink;
  if (illustration) {
    addRaster(slide, illustration, 7.35, 1.55, 4.85, 3.23);
  }
  slide.addText(title, {
    x: illustration ? 1.05 : 1.28, y: 2.38, w: illustration ? 5.95 : 10.7, h: 1.35,
    fontFace: FONT_HEAD, fontSize: 34, bold: true,
    color, align: illustration ? "left" : "center",
    valign: "mid", margin: 0.02,
    fit: "shrink",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: illustration ? 1.08 : 1.65, y: 3.78, w: illustration ? 5.75 : 10, h: 0.7,
      fontFace: FONT_HEAD, fontSize: 15,
      color: dark ? "CBD5E1" : C.muted,
      align: illustration ? "left" : "center",
      valign: "mid",
      margin: 0.02,
      fit: "shrink",
    });
  }
  addNotes(slide, notes);
}

function bigText({ no, text, sub, dark = false, color, section, notes, align = "center", illustration }) {
  const slide = pptx.addSlide();
  bg(slide, dark ? C.dark : C.white);
  addHeader(slide, no, section, dark);
  if (illustration) {
    addRaster(slide, illustration, 7.65, 1.68, 4.35, 2.9);
  }
  slide.addText(text, {
    x: illustration ? 0.95 : 1.0, y: sub ? 2.22 : 2.72, w: illustration ? 6.35 : 11.35, h: sub ? 1.3 : 1.2,
    fontFace: FONT_HEAD, fontSize: 29, bold: true,
    color: color || (dark ? C.white : C.ink),
    align: illustration ? "left" : align, valign: "mid", margin: 0.01,
    fit: "shrink",
  });
  if (sub) {
    slide.addText(sub, {
      x: illustration ? 0.98 : 1.55, y: 3.86, w: illustration ? 6.25 : 10.2, h: 1.05,
      fontFace: FONT_HEAD, fontSize: 16,
      color: dark ? "D2D8E2" : C.muted,
      align: illustration ? "left" : align, valign: "mid", margin: 0.02,
      breakLine: false,
      fit: "shrink",
    });
  }
  addNotes(slide, notes);
}

function sectionAgenda({ no, items, notes }) {
  const slide = pptx.addSlide();
  bg(slide, C.paper);
  addHeader(slide, no, "TODAY");
  slide.addText("오늘의 진행", {
    x: 0.8, y: 0.82, w: 3.2, h: 0.38,
    fontFace: FONT_HEAD, fontSize: 15, bold: true, color: C.ink, margin: 0,
  });
  const colors = [C.blue, C.orange, C.green, C.red];
  const fills = [C.softBlue, C.softOrange, C.softGreen, C.softRed];
  items.forEach((it, idx) => {
    const x = 0.78 + idx * 3.0;
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.62, w: 2.62, h: 3.85,
      fill: { color: fills[idx] },
      line: { color: fills[idx] },
    });
    slide.addShape(pptx.ShapeType.line, {
      x, y: 1.55, w: 2.62, h: 0,
      line: { color: colors[idx], width: 2.2 },
    });
    slide.addText(it.k, {
      x: x + 0.16, y: 1.83, w: 2.25, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 8.5, bold: true, color: colors[idx], margin: 0,
    });
    slide.addText(it.t, {
      x: x + 0.16, y: 2.28, w: 2.25, h: 0.9,
      fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C.ink, margin: 0.01,
      breakLine: false, fit: "shrink",
    });
    slide.addText(it.d, {
      x: x + 0.16, y: 3.45, w: 2.24, h: 1.1,
      fontFace: FONT, fontSize: 8.1, color: C.slate, margin: 0.01,
      breakLine: false, fit: "shrink",
    });
  });
  addNotes(slide, notes);
}

function twoColumn({ no, title, leftTitle, leftLines, rightTitle, rightLines, notes }) {
  const slide = pptx.addSlide();
  bg(slide, C.white);
  addHeader(slide, no);
  slide.addText(title, {
    x: 0.78, y: 0.86, w: 8.9, h: 0.46,
    fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0,
  });
  const specs = [
    { x: 0.9, t: leftTitle, lines: leftLines, fill: C.softRed, bar: C.red },
    { x: 6.85, t: rightTitle, lines: rightLines, fill: C.softGreen, bar: C.green },
  ];
  specs.forEach((s) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: s.x, y: 1.65, w: 5.25, h: 4.62,
      fill: { color: s.fill },
      line: { color: s.fill },
    });
    slide.addShape(pptx.ShapeType.line, {
      x: s.x, y: 1.58, w: 5.25, h: 0,
      line: { color: s.bar, width: 2.1 },
    });
    slide.addText(s.t, {
      x: s.x + 0.28, y: 1.93, w: 4.7, h: 0.45,
      fontFace: FONT_HEAD, fontSize: 15, bold: true, color: C.ink, margin: 0,
    });
    let ly = 2.7;
    for (const line of s.lines) {
      slide.addText(line, {
        x: s.x + 0.32, y: ly, w: 4.6, h: 0.25,
        fontFace: FONT, fontSize: 12.6, color: C.slate,
        margin: 0, fit: "shrink",
      });
      ly += 0.36;
    }
  });
  addNotes(slide, notes);
}

function fourBoxes({ no, title, subtitle, boxes, notes, section = "FRAME", illustration }) {
  const slide = pptx.addSlide();
  bg(slide, C.white);
  addHeader(slide, no, section);
  if (illustration) {
    addRaster(slide, illustration, 9.4, 0.64, 2.35, 1.57);
  }
  slide.addText(title, {
    x: 0.76, y: 0.78, w: 8.9, h: 0.42,
    fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.76, y: 1.22, w: 10.9, h: 0.32,
      fontFace: FONT_HEAD, fontSize: 9.5, color: C.muted, margin: 0,
    });
  }
  const positions = [
    [0.82, 1.95], [6.9, 1.95], [0.82, 4.0], [6.9, 4.0],
  ];
  const fills = [C.softBlue, C.softOrange, C.softGreen, C.softCyan];
  const bars = [C.blue, C.orange, C.green, C.cyan];
  boxes.forEach((b, i) => {
    const [x, y] = positions[i];
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 5.45, h: 1.45,
      fill: { color: fills[i] },
      line: { color: fills[i] },
    });
    slide.addShape(pptx.ShapeType.line, {
      x, y: y - 0.06, w: 5.45, h: 0,
      line: { color: bars[i], width: 2 },
    });
    slide.addText(b.t, {
      x: x + 0.24, y: y + 0.16, w: 4.9, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 13, bold: true, color: C.ink, margin: 0,
    });
    slide.addText(b.d, {
      x: x + 0.24, y: y + 0.62, w: 4.95, h: 0.58,
      fontFace: FONT, fontSize: 9.5, color: C.slate, margin: 0.01,
      breakLine: false, fit: "shrink",
    });
  });
  addNotes(slide, notes);
}

function loopSlide({ no, title, items, notes, section = "WHAT" }) {
  const slide = pptx.addSlide();
  bg(slide, C.white);
  addHeader(slide, no, section);
  slide.addText(title, {
    x: 0.75, y: 0.82, w: 8.5, h: 0.46,
    fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0,
  });
  const cx = W / 2;
  const cy = 3.85;
  const rx = 4.0;
  const ry = 1.75;
  const fills = [C.softBlue, C.softOrange, C.softGreen, C.softCyan, C.softRed, "EEF2F7"];
  const bars = [C.blue, C.orange, C.green, C.cyan, C.red, C.slate];
  items.forEach((item, i) => {
    const angle = -90 + i * (360 / items.length);
    const rad = angle * Math.PI / 180;
    const x = cx + rx * Math.cos(rad) - 0.82;
    const y = cy + ry * Math.sin(rad) - 0.36;
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 1.64, h: 0.72,
      rectRadius: 0.06,
      fill: { color: fills[i] },
      line: { color: bars[i], width: 1.1 },
    });
    slide.addText(item, {
      x: x + 0.08, y: y + 0.18, w: 1.48, h: 0.25,
      fontFace: FONT_HEAD, fontSize: 8.6, bold: true, color: C.ink,
      align: "center", margin: 0, fit: "shrink",
    });
  });
  slide.addShape(pptx.ShapeType.arc, {
    x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2,
    adjustPoint: 0.25,
    line: { color: C.line, width: 2.1, beginArrowType: "none", endArrowType: "triangle" },
  });
  slide.addText("반복하면서\n일을 끝낸다", {
    x: cx - 1.5, y: cy - 0.45, w: 3.0, h: 0.9,
    fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C.ink,
    align: "center", valign: "mid", margin: 0,
  });
  addNotes(slide, notes);
}

function toolSlide({ no, title, tagline, bullets, color = C.blue, notes, illustration }) {
  const slide = pptx.addSlide();
  bg(slide, C.white);
  addHeader(slide, no, "TOOLS");
  if (illustration) {
    addRaster(slide, illustration, 0.72, 2.34, 5.35, 3.57);
  }
  slide.addText(title, {
    x: 0.82, y: 1.02, w: 5.6, h: 0.72,
    fontFace: FONT_HEAD, fontSize: 28, bold: true, color, margin: 0,
    fit: "shrink",
  });
  slide.addText(tagline, {
    x: 0.86, y: 1.9, w: 5.6, h: 0.55,
    fontFace: FONT_HEAD, fontSize: 14.5, bold: true, color: C.ink, margin: 0,
    fit: "shrink",
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 7.12, y: 1.06, w: 4.95, h: 4.85,
    fill: { color: "F8FAFC" },
    line: { color: "E2E8F0" },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 7.12, y: 1.06, w: 4.95, h: 0.55,
    fill: { color },
    line: { color },
  });
  slide.addText("어떤 일에 맞나", {
    x: 7.42, y: 1.22, w: 2.3, h: 0.2,
    fontFace: FONT_HEAD, fontSize: 8.4, bold: true, color: C.white, margin: 0,
  });
  let by = 3.05;
  bullets.forEach((b, idx) => {
    slide.addText(`${idx + 1}. ${b}`, {
      x: 7.45, y: by, w: 4.25, h: 0.25,
      fontFace: FONT, fontSize: 11.6, color: C.slate,
      margin: 0, fit: "shrink",
    });
    by += 0.36;
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.87, y: 6.08, w: 5.0, h: 0,
    line: { color, width: 2.4 },
  });
  slide.addText("도구 설명보다 중요한 것은", {
    x: 0.9, y: 6.29, w: 5.5, h: 0.23,
    fontFace: FONT, fontSize: 11.8, color: C.muted, margin: 0,
  });
  slide.addText("'어떤 일을 맡길 것인가'다.", {
    x: 0.9, y: 6.56, w: 5.5, h: 0.23,
    fontFace: FONT, fontSize: 11.8, color: C.muted, margin: 0,
  });
  addNotes(slide, notes);
}

function requestSlide({ no, title, prompt, notes }) {
  const slide = pptx.addSlide();
  bg(slide, C.white);
  addHeader(slide, no, "HOW");
  slide.addText(title, {
    x: 0.78, y: 0.8, w: 8.8, h: 0.46,
    fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.0, y: 1.58, w: 11.25, h: 4.78,
    fill: { color: "F8FAFC" },
    line: { color: "D6E1EC" },
  });
  const lines = prompt.split("\n");
  let y = 1.92;
  for (const line of lines) {
    if (!line.trim()) {
      y += 0.28;
      continue;
    }
    slide.addText(line, {
      x: 1.35, y, w: 10.55, h: 0.25,
      fontFace: FONT, fontSize: 14.8,
      color: C.ink,
      margin: 0,
      fit: "shrink",
    });
    y += 0.33;
  }
  addNotes(slide, notes);
}

function ladderSlide({ no, title, steps, notes }) {
  const slide = pptx.addSlide();
  bg(slide, C.white);
  addHeader(slide, no, "SAFETY");
  slide.addText(title, {
    x: 0.78, y: 0.82, w: 7.2, h: 0.45,
    fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0,
  });
  const fills = [C.softBlue, C.softGreen, C.softOrange, C.softRed, "F4F4F5"];
  const bars = [C.blue, C.green, C.orange, C.red, C.slate];
  steps.forEach((s, i) => {
    const x = 0.95 + i * 2.38;
    const y = 5.15 - i * 0.72;
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 1.9, h: 0.68,
      fill: { color: fills[i] },
      line: { color: bars[i], width: 1.2 },
    });
    slide.addText(s.t, {
      x: x + 0.09, y: y + 0.13, w: 1.72, h: 0.2,
      fontFace: FONT_HEAD, fontSize: 8.5, bold: true, color: C.ink,
      align: "center", margin: 0, fit: "shrink",
    });
    slide.addText(s.d, {
      x: x - 0.06, y: y + 0.86, w: 2.02, h: 0.5,
      fontFace: FONT, fontSize: 7.4, color: C.muted, align: "center",
      margin: 0, fit: "shrink",
    });
    if (i < steps.length - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: x + 1.9, y: y + 0.34, w: 0.45, h: -0.62,
        line: { color: C.line, width: 1.2, endArrowType: "triangle" },
      });
    }
  });
  slide.addText("승인 범위는 한 번에 주지 않고\n실행 근거에 따라 넓힌다.", {
    x: 1.25, y: 1.75, w: 10.8, h: 0.78,
    fontFace: FONT_HEAD, fontSize: 24, bold: true, color: C.ink,
    align: "center", margin: 0,
  });
  addNotes(slide, notes);
}

function comparisonTableSlide({ no, notes }) {
  const slide = pptx.addSlide();
  bg(slide, C.white);
  addHeader(slide, no, "TOOLS");
  slide.addText("에이전틱 AI 비교 표", {
    x: 0.76, y: 0.78, w: 7.8, h: 0.42,
    fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0,
  });
  slide.addText("도구의 우열보다 업무 유형과 운영 방식에 맞춰 배치한다.", {
    x: 0.76, y: 1.2, w: 9.8, h: 0.24,
    fontFace: FONT_HEAD, fontSize: 8.8, color: C.muted, margin: 0,
  });

  const x0 = 0.64;
  const y0 = 1.64;
  const colW = [1.38, 2.08, 3.08, 2.42, 3.08];
  const headers = ["도구", "위치", "맡길 일", "강점", "운영 주의"];
  const rows = [
    ["Codex", "개발·문서\n작업 에이전트", "코드 수정\n테스트\n문서 초안\n리팩터링", "작업 범위가 분명한\n프로젝트 단위에 강함", "변경 파일\n실행 명령\n테스트 결과를 함께 점검"],
    ["Claude\nCode", "터미널·IDE형\n코딩 에이전트", "오류 수정\n테스트 작성\n저장소 규칙 적용", "개발자 흐름 안에서\n빠르게 반복", "터미널 명령과\n파일 변경 범위를\n먼저 제한"],
    ["Anti-\ngravity", "에이전트 우선\n개발 환경", "화면 개선\n브라우저 점검\n여러 에이전트 운영", "Artifact로\n작업 과정을\n공유하기 좋음", "자동 실행보다\n승인 단계를\n먼저 설계"],
    ["OpenClaw", "로컬·메신저\n상주형 에이전트", "알림\n초안\n채널 기반 업무 정리", "일상 채널과\n로컬 작업 연결", "외부 발송\n파일 접근\n개인정보 승인선 필요"],
    ["Hermes", "기억·스킬형\nself-hosted 에이전트", "반복 리포트\n개인 메모리\ncron 업무", "업무 습관과\n지식 축적에 적합", "메모리 범위와\n삭제 정책을\n먼저 정함"],
  ];
  const colors = [C.blue, C.orange, C.green, C.red, C.cyan];
  const rowH = 0.92;
  const headH = 0.46;

  let x = x0;
  headers.forEach((h, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x, y: y0, w: colW[i], h: headH,
      fill: { color: i === 0 ? C.ink : "F1F5F9" },
      line: { color: "D8E1EA", width: 0.6 },
    });
    slide.addText(h, {
      x: x + 0.06, y: y0 + 0.14, w: colW[i] - 0.12, h: 0.14,
      fontFace: FONT_HEAD, fontSize: 7.4,
      color: i === 0 ? C.white : C.ink,
      margin: 0, fit: "shrink",
    });
    x += colW[i];
  });

  rows.forEach((row, r) => {
    let cx = x0;
    row.forEach((cell, c) => {
      const fill = c === 0 ? "F8FAFC" : r % 2 === 0 ? "FFFFFF" : "F8FAFC";
      slide.addShape(pptx.ShapeType.rect, {
        x: cx, y: y0 + headH + r * rowH, w: colW[c], h: rowH,
        fill: { color: fill },
        line: { color: "D8E1EA", width: 0.45 },
      });
      if (c === 0) {
        slide.addShape(pptx.ShapeType.line, {
          x: cx, y: y0 + headH + r * rowH, w: colW[c], h: 0,
          line: { color: colors[r], width: 1.8 },
        });
      }
      slide.addText(cell, {
        x: cx + 0.07, y: y0 + headH + r * rowH + 0.12,
        w: colW[c] - 0.14, h: rowH - 0.18,
        fontFace: c === 0 ? FONT_HEAD : FONT_BODY,
        fontSize: c === 0 ? 8.1 : 6.95,
        bold: c === 0,
        color: c === 0 ? colors[r] : C.slate,
        margin: 0,
        fit: "shrink",
        breakLine: false,
      });
      cx += colW[c];
    });
  });
  addNotes(slide, notes);
}

function installDecisionSlide({ no, notes }) {
  const slide = pptx.addSlide();
  bg(slide, C.white);
  addHeader(slide, no, "SETUP");
  slide.addText("무료 조건에서의 도구 선택", {
    x: 0.76, y: 0.78, w: 7.8, h: 0.42,
    fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0,
  });
  slide.addText("일반 직장인, 개인 노트북 혼합, 현장 설치만 진행하는 조건으로 배치한다.", {
    x: 0.76, y: 1.2, w: 10.4, h: 0.24,
    fontFace: FONT_HEAD, fontSize: 8.8, color: C.muted, margin: 0,
  });

  const x0 = 0.68;
  const y0 = 1.62;
  const colW = [1.45, 2.22, 1.45, 2.25, 4.35];
  const headers = ["도구", "무료 조건", "난이도", "강의 배치", "운영 판단"];
  const rows = [
    ["Antigravity", "개인 공개\n프리뷰 무료", "중", "공통 실습", "설치, 첫 실행, Artifact 점검까지 현장 운영 가능"],
    ["Codex", "무료 계정은\n사용량 제한", "중", "강사 시연\n선택 실습", "전원 실습보다 비교 시연이 안정적"],
    ["Hermes", "오픈소스\n모델/API 필요", "높음", "심화 시연", "WSL2와 API 설정 부담이 커서 설치 실습 제외"],
    ["OpenClaw", "오픈소스\nAPI 설정 필요", "중~높음", "비교 소개", "상주형 에이전트의 권한·보안 설명에 적합"],
    ["Claude Code", "계정·요금\n조건 영향", "중", "비교 소개", "개발자 과정에서는 실습 후보, 이번 과정은 보조"],
  ];
  const colors = [C.green, C.blue, C.cyan, C.red, C.orange];
  const headH = 0.46;
  const rowH = 0.92;
  let x = x0;
  headers.forEach((h, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x, y: y0, w: colW[i], h: headH,
      fill: { color: i === 0 ? C.ink : "F1F5F9" },
      line: { color: "D8E1EA", width: 0.6 },
    });
    slide.addText(h, {
      x: x + 0.06, y: y0 + 0.14, w: colW[i] - 0.12, h: 0.14,
      fontFace: FONT_HEAD, fontSize: 7.3,
      color: i === 0 ? C.white : C.ink,
      margin: 0, fit: "shrink",
    });
    x += colW[i];
  });
  rows.forEach((row, r) => {
    let cx = x0;
    row.forEach((cell, c) => {
      const fill = c === 0 ? "F8FAFC" : r % 2 === 0 ? "FFFFFF" : "F8FAFC";
      slide.addShape(pptx.ShapeType.rect, {
        x: cx, y: y0 + headH + r * rowH, w: colW[c], h: rowH,
        fill: { color: fill },
        line: { color: "D8E1EA", width: 0.45 },
      });
      if (c === 0) {
        slide.addShape(pptx.ShapeType.line, {
          x: cx, y: y0 + headH + r * rowH, w: colW[c], h: 0,
          line: { color: colors[r], width: 1.8 },
        });
      }
      slide.addText(cell, {
        x: cx + 0.07, y: y0 + headH + r * rowH + 0.12,
        w: colW[c] - 0.14, h: rowH - 0.18,
        fontFace: c === 0 ? FONT_HEAD : FONT_BODY,
        fontSize: c === 0 ? 7.7 : 6.8,
        bold: c === 0,
        color: c === 0 ? colors[r] : C.slate,
        margin: 0,
        fit: "shrink",
        breakLine: false,
      });
      cx += colW[c];
    });
  });
  addNotes(slide, notes);
}

function installScheduleSlide({ no, notes }) {
  const slide = pptx.addSlide();
  bg(slide, C.white);
  addHeader(slide, no, "SETUP");
  slide.addText("현장 설치 60~90분 운영안", {
    x: 0.76, y: 0.78, w: 7.8, h: 0.42,
    fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0,
  });
  const rows = [
    ["0~10분", "개념 정리", "답변 받기와 업무 맡기기 차이를 설명"],
    ["10~30분", "Antigravity 설치", "다운로드, 로그인, 빈 폴더 열기"],
    ["30~45분", "안전 세팅", "실습 폴더, 파일 변경 전 승인, 비밀정보 제외"],
    ["45~70분", "공통 실습", "안내문, 체크리스트, 리스크 대응표 생성"],
    ["70~85분", "Codex 비교", "같은 과제를 계획·수정·보고 흐름으로 시연"],
    ["85~90분", "적용 문장", "내 업무 1개와 승인 범위를 작성"],
  ];
  const x0 = 0.82;
  const y0 = 1.54;
  const colW = [1.38, 2.2, 8.25];
  const colors = [C.blue, C.green, C.orange, C.red, C.cyan, C.slate];
  rows.forEach((row, i) => {
    const y = y0 + i * 0.78;
    slide.addShape(pptx.ShapeType.rect, {
      x: x0, y, w: 11.83, h: 0.58,
      fill: { color: i % 2 === 0 ? "F8FAFC" : "FFFFFF" },
      line: { color: "E2E8F0", width: 0.6 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x0, y, w: 0.08, h: 0.58,
      fill: { color: colors[i] },
      line: { color: colors[i] },
    });
    slide.addText(row[0], {
      x: x0 + 0.2, y: y + 0.18, w: colW[0], h: 0.16,
      fontFace: FONT_HEAD, fontSize: 8.4, bold: true, color: colors[i],
      margin: 0, fit: "shrink",
    });
    slide.addText(row[1], {
      x: x0 + colW[0] + 0.28, y: y + 0.16, w: colW[1], h: 0.18,
      fontFace: FONT_HEAD, fontSize: 9.4, bold: true, color: C.ink,
      margin: 0, fit: "shrink",
    });
    slide.addText(row[2], {
      x: x0 + colW[0] + colW[1] + 0.45, y: y + 0.16, w: colW[2], h: 0.18,
      fontFace: FONT, fontSize: 8.9, color: C.slate,
      margin: 0, fit: "shrink",
    });
  });
  addNotes(slide, notes);
}

function troubleshootingSlide({ no, notes }) {
  const slide = pptx.addSlide();
  bg(slide, C.white);
  addHeader(slide, no, "FIELD");
  slide.addText("현장 오류 대응표", {
    x: 0.76, y: 0.78, w: 7.8, h: 0.42,
    fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0,
  });
  slide.addText("설치가 늦어지는 사람을 기다리기보다, 페어 실습과 강사 화면으로 흐름을 유지한다.", {
    x: 0.76, y: 1.2, w: 10.6, h: 0.24,
    fontFace: FONT_HEAD, fontSize: 8.8, color: C.muted, margin: 0,
  });
  const x0 = 0.7;
  const y0 = 1.62;
  const colW = [2.45, 4.25, 4.95];
  const headers = ["상황", "즉시 조치", "강의 운영"];
  const rows = [
    ["관리자 권한 없음", "설치 가능한 옆 사람과 2인 1조", "관찰자는 요청문 작성과 결과 점검을 맡는다"],
    ["로그인 지연", "브라우저 재시도, 다른 계정 사용", "강사 화면을 보며 동일 요청문을 작성한다"],
    ["와이파이 지연", "설치 파일·샘플 폴더를 USB/공유폴더로 제공", "설치 대신 안전 세팅과 요청문 실습으로 전환"],
    ["화면이 다름", "버전 차이를 인정하고 핵심 메뉴만 안내", "도구 화면보다 작업 순서와 승인 범위에 집중"],
    ["설치 실패", "페어 실습으로 전환", "마지막 적용 문장은 개인별로 작성"],
  ];
  const headH = 0.46;
  const rowH = 0.86;
  let x = x0;
  headers.forEach((h, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x, y: y0, w: colW[i], h: headH,
      fill: { color: i === 0 ? C.ink : "F1F5F9" },
      line: { color: "D8E1EA", width: 0.6 },
    });
    slide.addText(h, {
      x: x + 0.08, y: y0 + 0.14, w: colW[i] - 0.16, h: 0.14,
      fontFace: FONT_HEAD, fontSize: 7.4,
      color: i === 0 ? C.white : C.ink,
      margin: 0, fit: "shrink",
    });
    x += colW[i];
  });
  rows.forEach((row, r) => {
    let cx = x0;
    row.forEach((cell, c) => {
      const fill = r % 2 === 0 ? "FFFFFF" : "F8FAFC";
      slide.addShape(pptx.ShapeType.rect, {
        x: cx, y: y0 + headH + r * rowH, w: colW[c], h: rowH,
        fill: { color: fill },
        line: { color: "D8E1EA", width: 0.45 },
      });
      slide.addText(cell, {
        x: cx + 0.08, y: y0 + headH + r * rowH + 0.14,
        w: colW[c] - 0.16, h: rowH - 0.2,
        fontFace: c === 0 ? FONT_HEAD : FONT_BODY,
        fontSize: c === 0 ? 7.8 : 6.9,
        bold: c === 0,
        color: c === 0 ? C.red : C.slate,
        margin: 0,
        fit: "shrink",
        breakLine: false,
      });
      cx += colW[c];
    });
  });
  addNotes(slide, notes);
}

function sourceTextSlide({ no, title, lines, notes, dark = false }) {
  const slide = pptx.addSlide();
  bg(slide, dark ? C.dark : C.white);
  addHeader(slide, no, dark ? "CHECK" : "IF", dark);
  slide.addText(title, {
    x: 0.82, y: 0.9, w: 9.5, h: 0.48,
    fontFace: FONT_HEAD, fontSize: 20, bold: true, color: dark ? C.white : C.ink,
    margin: 0,
  });
  const textColor = dark ? "E5E7EB" : C.slate;
  const baseSize = lines.length > 5 ? 16 : 17;
  let y = 1.82;
  for (const line of lines) {
    slide.addText(line, {
      x: 1.08, y, w: 10.9, h: 0.31,
      fontFace: FONT, fontSize: baseSize,
      color: textColor,
      margin: 0,
      fit: "shrink",
    });
    y += lines.length > 5 ? 0.42 : 0.48;
  }
  addNotes(slide, notes);
}

titleSlide({
  no: 1,
  title: "Agentic AI",
  subtitle: "답을 받는 AI에서, 일을 맡기는 AI로",
  dark: false,
  illustration: "cover_agentic.png",
  notes: "이 파트는 개발 도구 소개가 아니라 AI 활용 방식의 다음 단계로 연다.",
});

bigText({
  no: 2,
  text: "AI에게 어디까지 맡길 수 있는가",
  sub: "점수보다 중요한 일은 '업무를 맡길 단위'를 정하는 것이다.",
});

sectionAgenda({
  no: 3,
  items: [
    { k: "WHY", t: "왜 Agentic AI인가?", d: "답변에서 실행으로 이동하는 이유를 다룬다." },
    { k: "WHAT", t: "무엇이 달라지는가?", d: "Agent Loop와 Human Loop를 구분한다." },
    { k: "HOW", t: "어떻게 맡길 것인가?", d: "승인 범위, 근거, 멈춤 조건을 요청문에 넣는다." },
    { k: "IF", t: "내 업무에는?", d: "업무 장면 하나를 에이전트형 요청으로 바꾼다." },
  ],
});

twoColumn({
  no: 4,
  title: "답을 받는 것 vs 일을 맡기는 것",
  leftTitle: "답을 받는 AI",
  leftLines: ["한 번 묻는다", "문장이나 자료가 나온다", "사람이 다음 단계를 직접 한다", "틀려도 피해 범위가 작다"],
  rightTitle: "일을 맡기는 AI",
  rightLines: ["목표를 준다", "도구를 쓰고 환경을 바꾼다", "AI가 여러 단계를 반복한다", "승인 범위와 점검 절차가 필요하다"],
});

bigText({
  no: 5,
  text: "Event VS Process",
  sub: "Agentic AI는 이벤트가 아니라 프로세스다.",
  color: C.red,
});

bigText({
  no: 6,
  text: "AI가 도구를 잡는 순간",
  sub: "프롬프트는 요청이 되고, 에이전트는 실행자가 된다.",
  illustration: "ai_tools.png",
});

fourBoxes({
  no: 7,
  title: "Agentic AI란?",
  subtitle: "목표를 이해하고, 도구를 사용하고, 결과를 점검하며, 다시 수정하는 실행형 AI",
  boxes: [
    { t: "Goal", d: "무엇을 끝내야 하는지 목표를 받는다." },
    { t: "Tool", d: "파일, 터미널, 브라우저, API 같은 도구를 쓴다." },
    { t: "Loop", d: "실행 결과를 보고 다음 행동을 조정한다." },
    { t: "Report", d: "완료 근거와 잔여 리스크를 보고한다." },
  ],
  section: "WHAT",
});

loopSlide({
  no: 8,
  title: "Agent Loop",
  items: ["목표", "계획", "실행", "관찰", "수정", "보고"],
  notes: "중요한 것은 AI가 한 번 답하고 끝나는 것이 아니라 반복한다는 점이다.",
});

loopSlide({
  no: 9,
  title: "Human Loop",
  items: ["목적", "조건", "승인", "점검", "멈춤", "책임"],
  section: "WHY",
  notes: "에이전트가 반복할수록 사람의 판단 조건도 명료해야 한다.",
});

bigText({
  no: 10,
  text: "프롬프트 다음은 승인 범위다",
  sub: "승인 범위가 없으면 실행 품질이 불안정해진다.",
  illustration: "approval_gate.png",
});

fourBoxes({
  no: 11,
  title: "사람이 잡아야 할 네 가지",
  subtitle: "AI가 많이 움직일수록 사람은 더 분명해져야 한다.",
  boxes: [
    { t: "목적", d: "이 일을 왜 하는가." },
    { t: "조건", d: "무엇이면 완료인가." },
    { t: "승인 범위", d: "어디까지 실행해도 되는가." },
    { t: "점검", d: "무엇으로 결과를 판정할 것인가." },
  ],
});

sourceTextSlide({
  no: 12,
  title: "실습 | 맡기고 싶은 일",
  lines: [
    "1. 지금 반복해서 처리하는 일 하나를 적는다.",
    "2. 그 일이 끝났다고 판단할 결과를 적는다.",
    "3. AI가 건드리면 안 되는 선을 적는다.",
    "4. 내가 마지막에 직접 판단할 항목을 적는다.",
  ],
});

fourBoxes({
  no: 13,
  title: "맡길 일의 3분류",
  subtitle: "모든 일을 에이전트에게 바로 맡기면 안 된다.",
  boxes: [
    { t: "맡겨도 되는 일", d: "초안, 정리, 비교, 테스트, 반복 점검" },
    { t: "승인 후 맡길 일", d: "외부 발송, 대량 수정, 비용 발생, 고객 대응" },
    { t: "맡기면 안 되는 일", d: "최종 판단, 윤리적 책임, 비밀정보 노출" },
    { t: "먼저 쪼갤 일", d: "범위와 완료 조건이 모호한 일" },
  ],
});

fourBoxes({
  no: 14,
  title: "이동수단 지도",
  subtitle: "브랜드보다 목적을 먼저 정한다.",
  illustration: "placement_map.png",
  boxes: [
    { t: "개발형 에이전트", d: "코드, 문서, 테스트, PR 작업" },
    { t: "IDE형 에이전트", d: "에디터, 터미널, 브라우저를 함께 사용" },
    { t: "상주형 에이전트", d: "메신저, 일정, 파일, 자동화 채널 연결" },
    { t: "기억형 에이전트", d: "반복 업무를 메모리와 스킬로 축적" },
  ],
  section: "TOOLS",
});

toolSlide({
  no: 15,
  title: "Codex",
  tagline: "작업을 맡기고 결과물을 받는 코딩 에이전트",
  bullets: ["기능 구현, 리팩터링, 문서화", "여러 작업을 병렬로 맡기는 흐름", "작업 결과와 변경사항을 검토"],
  color: C.blue,
  illustration: "coding_agent.png",
});

requestSlide({
  no: 16,
  title: "Codex에게 좋은 일",
  prompt: "이 저장소의 온보딩 문서를 읽고,\n처음 실행하는 사람이 어려움을 겪을 지점을 찾아줘.\n\n바로 수정하지 말고 먼저\n1. 문제 목록\n2. 수정할 파일\n3. 실행할 명령\n4. 내가 승인해야 할 지점\n을 계획으로 제시해줘.",
});

toolSlide({
  no: 17,
  title: "Claude Code",
  tagline: "터미널과 IDE에서 프로젝트 규칙을 따라 움직이는 에이전트",
  bullets: ["테스트 작성, 오류 수정, 의존성 업데이트", "CLAUDE.md, MCP, hooks로 팀 규칙 연결", "서브에이전트로 작업 분담"],
  color: C.orange,
  illustration: "ide_agent.png",
});

requestSlide({
  no: 18,
  title: "Claude Code에게 좋은 일",
  prompt: "이 프로젝트의 규칙을 먼저 읽고,\n인증 모듈 테스트를 추가해줘.\n\n단, 변경 전 계획을 제시하고,\n테스트 실행 결과와 실패한 경우의 원인을\n마지막 보고에 반드시 포함해줘.",
});

toolSlide({
  no: 19,
  title: "Antigravity",
  tagline: "에이전트를 운영하고 산출물로 점검하는 개발 플랫폼",
  bullets: ["에디터, 터미널, 브라우저를 넘나드는 작업", "여러 에이전트의 비동기 작업 운영", "스크린샷, 계획, 녹화 같은 Artifact로 점검"],
  color: C.green,
  illustration: "antigravity_artifacts.png",
});

requestSlide({
  no: 20,
  title: "Antigravity에게 좋은 일",
  prompt: "이 화면의 첫 진입 흐름을 개선해줘.\n\n브라우저에서 직접 점검하고,\n변경 전후 스크린샷과 사용자가 느낄 차이를\nArtifact로 정리해줘.\n\n배포나 외부 전송은 하지 마.",
});

toolSlide({
  no: 21,
  title: "OpenClaw",
  tagline: "메신저와 로컬 환경에 붙는 상주형 에이전트",
  bullets: ["여러 채널에서 메시지를 받고 실행", "로컬 게이트웨이와 스킬 기반 자동화", "호스트 권한이 크므로 보안 설정이 핵심"],
  color: C.red,
  illustration: "openclaw_channels.png",
});

requestSlide({
  no: 22,
  title: "OpenClaw에게 좋은 일",
  prompt: "매일 오전 9시에 오늘 처리할 업무 후보를 정리해줘.\n\n메일이나 메신저를 직접 발송하지 말고,\n초안과 우선순위만 만들어줘.\n\n외부로 나가는 행동은 반드시 승인받아.",
});

toolSlide({
  no: 23,
  title: "Hermes",
  tagline: "기억과 스킬을 쌓아 반복 업무를 줄이는 에이전트",
  bullets: ["Persistent memory와 user profile", "스킬과 툴셋으로 반복 업무 축적", "MCP, cron, context files로 흐름 확장"],
  color: C.cyan,
  illustration: "hermes_memory.png",
});

requestSlide({
  no: 24,
  title: "Hermes에게 좋은 일",
  prompt: "내가 매주 만드는 교육 운영 리포트의 작성 원칙을 기억해줘.\n\n이번 주 자료를 읽고 같은 형식으로 초안을 만들되,\n지난주와 달라진 점, 판단이 필요한 점,\n대조해야 할 숫자를 분리해서 보고해줘.",
});

comparisonTableSlide({
  no: 25,
});

bigText({
  no: 26,
  text: "비교가 아니라 배치",
  sub: "좋은 질문은 '뭐가 제일 좋은가'가 아니라 '이 일에는 어떤 이동수단이 맞는가'다.",
});

bigText({
  no: 27,
  text: "CRAFT-O는 여전히 유효하다",
  sub: "Context, Role, Audience, Format, Tone, Option은 에이전트에게도 기본이다.",
});

fourBoxes({
  no: 28,
  title: "에이전트 요청에는 3문장을 더 붙인다",
  subtitle: "답변 요청이 아니라 실행 요청이기 때문이다.",
  boxes: [
    { t: "승인 범위", d: "어디까지 직접 실행해도 되는가." },
    { t: "근거", d: "무엇을 제시하면 완료인가." },
    { t: "멈춤 조건", d: "어디서 멈추고 물어봐야 하는가." },
    { t: "보고", d: "무엇을 정리해 사람에게 돌려줄 것인가." },
  ],
  section: "HOW",
});

requestSlide({
  no: 29,
  title: "기본 요청문",
  prompt: "지금부터 이 일을 맡기고 싶어.\n\n바로 실행하지 말고 먼저\n1. 네가 이해한 목표\n2. 필요한 정보\n3. 작업 순서\n4. 사용할 도구\n5. 위험하거나 점검이 필요한 지점\n을 정리해서 나에게 물어봐.\n\n내가 승인한 뒤에만 실행해.",
});

twoColumn({
  no: 30,
  title: "나쁜 요청 vs 좋은 요청",
  leftTitle: "나쁜 요청",
  leftLines: ["이거 알아서 다 해줘", "빨리 끝내줘", "문제 있으면 고쳐줘", "결과만 알려줘"],
  rightTitle: "좋은 요청",
  rightLines: ["목표와 완료 조건을 먼저 물어봐", "계획을 제시하고 승인받아", "수정 근거를 정리해줘", "위험하면 멈추고 물어봐"],
});

bigText({
  no: 31,
  text: "작업계획 먼저",
  sub: "에이전트에게 바로 실행을 맡기지 말고, 먼저 작업 순서를 제시하게 한다.",
});

sourceTextSlide({
  no: 32,
  title: "근거로 보고받기",
  lines: [
    "무엇을 바꿨는가",
    "어떤 명령을 실행했는가",
    "결과가 성공했다는 근거는 무엇인가",
    "추가 처리할 리스크는 무엇인가",
    "사람이 최종 판단해야 할 것은 무엇인가",
  ],
});

ladderSlide({
  no: 33,
  title: "승인 범위 사다리",
  steps: [
    { t: "읽기", d: "자료를 보고 요약" },
    { t: "초안", d: "새 파일이나 제안" },
    { t: "수정", d: "복사본/브랜치에서 변경" },
    { t: "실행", d: "명령, 테스트, 자동화" },
    { t: "외부", d: "발송, 배포, 비용" },
  ],
});

fourBoxes({
  no: 34,
  title: "안전장치",
  subtitle: "에이전트는 능력보다 환경 설계가 먼저다.",
  boxes: [
    { t: "복사본", d: "원본이 아니라 실습용 파일에서 시작한다." },
    { t: "브랜치", d: "변경은 되돌릴 수 있는 곳에서 한다." },
    { t: "비밀정보", d: "키, 고객정보, 내부자료는 범위를 정한다." },
    { t: "승인선", d: "발송, 배포, 삭제, 결제는 사람이 승인한다." },
  ],
  section: "SAFETY",
});

requestSlide({
  no: 35,
  title: "실습 1 | Codex형 요청문",
  prompt: "내 업무 자료 폴더를 바탕으로,\n반복해서 만드는 보고서 초안을 자동화하고 싶어.\n\n너는 먼저 폴더 구조와 샘플 파일을 읽고,\n어떤 템플릿과 스크립트가 필요한지 계획만 제시해줘.\n파일 생성은 내가 승인한 뒤에 해.",
});

requestSlide({
  no: 36,
  title: "실습 2 | 상주형 에이전트 요청문",
  prompt: "매주 금요일 오후 4시에\n이번 주 업무 메모를 정리해 다음 주 액션 후보를 만들어줘.\n\n단, 사람에게 보낼 메시지는 초안까지만 만들고,\n외부 발송과 일정 등록은 반드시 승인받아.",
});

sourceTextSlide({
  no: 37,
  title: "종합실습 순서",
  lines: [
    "1. 내 업무 장면을 한 문장으로 쓴다.",
    "2. 맡길 수 있는 단위로 쪼갠다.",
    "3. CRAFT-O를 짧게 채운다.",
    "4. 승인 범위, 근거, 멈춤 조건을 붙인다.",
    "5. 도구를 하나 고른다.",
    "6. 사람이 판단할 항목을 마지막에 둔다.",
  ],
});

sourceTextSlide({
  no: 38,
  title: "마지막 체크",
  lines: [
    "AI가 해도 되는 일인가?",
    "AI가 하면 안 되는 선은 어디인가?",
    "완료를 무엇으로 판정할 것인가?",
    "내가 끝까지 책임질 판단은 무엇인가?",
  ],
  dark: true,
});

bigText({
  no: 39,
  text: "Agentic AI의 핵심",
  sub: "AI가 더 많이 하게 만드는 것이 아니라, 사람이 더 정확히 맡기고 더 분명히 점검하는 일이다.",
  illustration: "final_check.png",
  dark: false,
});

sourceTextSlide({
  no: 40,
  title: "적용 문장",
  lines: [
    "지금 바로 실행하지 말고,",
    "먼저 목표와 완료 조건을 물어보고,",
    "작업계획과 위험 지점을 제시한 뒤,",
    "내가 승인한 범위 안에서만 실행해줘.",
  ],
});

bigText({
  no: 41,
  text: "왜 설치까지 다루는가",
  sub: "설치는 기능 학습이 아니라, AI에게 맡길 업무 환경을 세팅하는 일이다.",
  illustration: "antigravity_artifacts.png",
  section: "SETUP",
});

installDecisionSlide({
  no: 42,
});

toolSlide({
  no: 43,
  title: "Antigravity",
  tagline: "오늘의 공통 실습 도구",
  bullets: [
    "개인 공개 프리뷰 무료 조건으로 실습 설계",
    "Windows, macOS, Linux 환경 대응",
    "작업 계획과 산출물을 화면에서 함께 점검",
  ],
  color: C.green,
  illustration: "antigravity_artifacts.png",
});

fourBoxes({
  no: 44,
  title: "설치 전 준비물",
  subtitle: "현장 설치만 진행하므로 시작 전에 네 가지만 맞춘다.",
  boxes: [
    { t: "노트북", d: "개인 노트북과 전원 어댑터를 준비한다." },
    { t: "계정", d: "Google 계정 또는 사용 가능한 로그인 계정을 준비한다." },
    { t: "브라우저", d: "Chrome 또는 Edge에서 다운로드 페이지를 연다." },
    { t: "실습 폴더", d: "회사 자료가 없는 빈 폴더에서 시작한다." },
  ],
  section: "SETUP",
});

fourBoxes({
  no: 45,
  title: "안전한 실습 폴더 만들기",
  subtitle: "에이전트 실습은 폴더 설계부터 시작한다.",
  boxes: [
    { t: "샘플 자료만", d: "실제 고객명, 내부 숫자, 계정 정보는 넣지 않는다." },
    { t: "복사본 사용", d: "원본 파일이 아니라 실습용 복사본을 사용한다." },
    { t: "변경 전 승인", d: "파일 생성과 수정은 승인 후 진행하도록 요청한다." },
    { t: "결과 분리", d: "output 폴더에 결과물을 따로 저장하게 한다." },
  ],
  section: "SETUP",
  illustration: "approval_gate.png",
});

requestSlide({
  no: 46,
  title: "첫 요청문 구조",
  prompt: "이 폴더는 Agentic AI 설치 실습용 샘플 폴더야.\n\n먼저 폴더 안의 자료를 읽고,\n1. 네가 이해한 업무 목적\n2. 만들 수 있는 산출물\n3. 파일을 만들기 전 필요한 질문\n4. 승인받아야 할 행동\n을 정리해줘.\n\n내가 승인하기 전에는 파일을 만들거나 수정하지 마.",
});

twoColumn({
  no: 47,
  title: "Codex는 왜 선택 실습인가",
  leftTitle: "전원 실습 리스크",
  leftLines: ["무료 계정 사용량이 제한될 수 있다", "로그인과 권한 차이가 생길 수 있다", "개발 도구 화면이 낯설 수 있다", "수업 시간이 계정 문제에 쓰일 수 있다"],
  rightTitle: "선택 실습 가치",
  rightLines: ["폴더를 읽고 계획을 제시하는 흐름", "변경 파일과 실행 명령을 함께 보고", "강사 시연으로도 핵심 구조 전달", "관심자는 이후 심화 과정으로 연결"],
});

twoColumn({
  no: 48,
  title: "Hermes는 왜 시연으로 충분한가",
  leftTitle: "현장 설치 부담",
  leftLines: ["Windows에서는 WSL2 흐름이 필요하다", "모델 또는 API 설정이 필요하다", "비개발자에게 초기 진입 장벽이 높다", "설치 오류 대응 시간이 커질 수 있다"],
  rightTitle: "교육에서 다룰 내용",
  rightLines: ["기억과 스킬을 쌓는 에이전트 구조", "반복 업무가 축적되는 방식", "메모리 범위와 삭제 정책", "상주형 AI 운영의 보안 감각"],
});

troubleshootingSlide({
  no: 49,
});

sourceTextSlide({
  no: 50,
  title: "내 업무 적용 문장",
  lines: [
    "내가 맡기고 싶은 일은 __________ 이다.",
    "AI가 읽어도 되는 자료는 __________ 까지다.",
    "AI가 만들어야 할 산출물은 __________ 이다.",
    "파일 생성과 수정은 내 승인 뒤에 진행한다.",
    "최종 판단은 내가 직접 한다.",
  ],
});

installScheduleSlide({
  no: 51,
});

const out = "C:/코딩/교육설계/agentic_ai_module/충주ai과정_agentic_ai_추가모듈.pptx";
await pptx.writeFile({ fileName: out });
console.log(out);
