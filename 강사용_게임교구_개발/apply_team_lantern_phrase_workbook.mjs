import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const BASE = "C:/코딩/교육설계/강사용_게임교구_개발";
const WORKBOOK_PATH = process.argv[2] || path.join(BASE, "팀등불_문구편집용.xlsx");
const CSV_PATH = path.join(BASE, "팀등불_등불카드데이터_v1.csv");

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function normalizeText(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

const input = await FileBlob.load(WORKBOOK_PATH);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("문구편집");
const used = sheet.getUsedRange();
const values = used.values;
const body = values.slice(1).filter((row) => normalizeText(row[0]));

const headers = ["id", "category", "keyword", "front_phrase", "subtext", "reason_prompt", "tone"];
const lines = [headers.join(",")];

for (const row of body) {
  const frontLines = [row[4], row[5], row[6]].map(normalizeText).filter(Boolean);
  const phrase = frontLines.length ? frontLines.join("\n") : normalizeText(row[3]);
  const record = [
    row[0],
    row[1],
    row[2],
    phrase,
    row[7],
    row[8],
    row[9],
  ];
  lines.push(record.map(csvEscape).join(","));
}

await fs.writeFile(CSV_PATH, `\uFEFF${lines.join("\n")}\n`, "utf8");
console.log(CSV_PATH);
