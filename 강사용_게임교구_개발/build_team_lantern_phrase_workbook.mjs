import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const BASE = "C:/코딩/교육설계/강사용_게임교구_개발";
const CSV_PATH = path.join(BASE, "팀등불_등불카드데이터_v1.csv");
const OUT_PATH = path.join(BASE, "팀등불_문구편집용.xlsx");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows.shift();
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(headers.map((h, idx) => [h, r[idx] ?? ""])));
}

function splitPhrase(phrase) {
  if (phrase.includes("\n")) {
    return phrase.split(/\r?\n/).slice(0, 3);
  }
  const max = 14;
  const words = phrase.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if ([...candidate].length <= max) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return [...lines.slice(0, 2), lines.slice(2).join(" ")].filter(Boolean).slice(0, 3);
}

function matrixAddress(colCount, rowCount) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return `A1:${letters[colCount - 1]}${rowCount}`;
}

const csvText = await fs.readFile(CSV_PATH, "utf8");
const rows = parseCsv(csvText.replace(/^\uFEFF/, ""));

const workbook = Workbook.create();
const edit = workbook.worksheets.add("문구편집");
const guide = workbook.worksheets.add("사용법");

const headers = [
  "카드번호",
  "분류",
  "키워드",
  "현재 문구",
  "수정 문구 1행",
  "수정 문구 2행",
  "수정 문구 3행",
  "아래 설명 문구",
  "이유 말하기",
  "톤",
  "메모",
  "줄수",
  "글자수",
];

const values = [headers];
for (const row of rows) {
  const lines = splitPhrase(row.front_phrase);
  values.push([
    row.id,
    row.category,
    row.keyword,
    row.front_phrase.replace(/\r?\n/g, " / "),
    lines[0] ?? "",
    lines[1] ?? "",
    lines[2] ?? "",
    row.subtext,
    row.reason_prompt,
    row.tone,
    "",
    "",
    "",
  ]);
}

edit.getRange(matrixAddress(headers.length, values.length)).values = values;
edit.getRange("L2").formulas = [["=COUNTA(E2:G2)"]];
edit.getRange(`L2:L${values.length}`).fillDown();
edit.getRange("M2").formulas = [["=LEN(E2&F2&G2)"]];
edit.getRange(`M2:M${values.length}`).fillDown();

edit.freezePanes.freezeRows(1);
edit.showGridLines = false;
edit.getRange("A1:M1").format = {
  fill: "#1F2933",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
};
edit.getRange(`A2:M${values.length}`).format = {
  wrapText: true,
  font: { color: "#1F2933" },
};
edit.getRange(`A2:C${values.length}`).format = {
  fill: "#F4F0E6",
  font: { color: "#1F2933" },
};
edit.getRange(`E2:G${values.length}`).format = {
  fill: "#FFF7D6",
  font: { bold: true, color: "#111827" },
};
edit.getRange(`H2:J${values.length}`).format = {
  fill: "#F8FAFC",
};
edit.getRange(`K2:K${values.length}`).format = {
  fill: "#EEF6FF",
};
edit.getRange(`L2:M${values.length}`).format = {
  fill: "#F3F4F6",
};

const widths = [110, 70, 80, 260, 190, 190, 190, 280, 260, 120, 240, 55, 65];
widths.forEach((w, idx) => {
  edit.getRange(`${String.fromCharCode(65 + idx)}:${String.fromCharCode(65 + idx)}`).format.columnWidthPx = w;
});
edit.getRange(`1:${values.length}`).format.rowHeightPx = 58;
edit.getRange("1:1").format.rowHeightPx = 44;

guide.getRange("A1:F1").merge();
guide.getRange("A1").values = [["팀등불 문구 편집용 엑셀"]];
guide.getRange("A1").format = {
  fill: "#1F2933",
  font: { bold: true, color: "#FFFFFF" },
};
guide.getRange("A3:F12").values = [
  ["사용 순서", "", "", "", "", ""],
  ["1", "문구편집 시트에서 노란 칸만 편하게 고칩니다.", "", "", "", ""],
  ["2", "카드 앞면 제목 줄바꿈은 수정 문구 1행, 2행, 3행 그대로 반영합니다.", "", "", "", ""],
  ["3", "한 카드 제목은 1~3줄을 권장합니다. 한 줄이 너무 길면 카드에서 자동으로 작아집니다.", "", "", "", ""],
  ["4", "아래 설명 문구와 이유 말하기도 필요하면 고칠 수 있습니다.", "", "", "", ""],
  ["5", "메모 칸은 의견 기록용입니다. 카드 이미지에는 들어가지 않습니다.", "", "", "", ""],
  ["6", "수정이 끝나면 저에게 이 파일로 다시 뽑으라고 말씀하시면 됩니다.", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["권장 톤", "익살, 호들갑, 현장에서 바로 건넬 수 있는 칭찬", "", "", "", ""],
  ["주의", "비꼼, 외모 품평, 과한 사적 친밀감은 피합니다.", "", "", "", ""],
];
guide.getRange("A3:F3").format = {
  fill: "#FFF7D6",
  font: { bold: true, color: "#111827" },
};
guide.getRange("A1:F12").format.wrapText = true;
guide.getRange("A:A").format.columnWidthPx = 90;
guide.getRange("B:F").format.columnWidthPx = 180;
guide.getRange("1:12").format.rowHeightPx = 34;
guide.showGridLines = false;

const preview = await workbook.render({
  sheetName: "문구편집",
  range: "A1:M12",
  scale: 1,
  format: "png",
});
await fs.writeFile(path.join(BASE, "팀등불_문구편집용_미리보기.png"), new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(OUT_PATH);
console.log(OUT_PATH);
