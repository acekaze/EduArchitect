import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const BASE = "C:/코딩/교육설계/강사용_게임교구_개발";
const WORKBOOK_PATH = process.argv[2] || path.join(BASE, "팀등불_문구편집용.xlsx");

function normalize(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\s+\/\s+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

function joinedLines(row) {
  return [row[4], row[5], row[6]].map(normalize).filter(Boolean).join("\n");
}

const input = await FileBlob.load(WORKBOOK_PATH);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("문구편집");
const values = sheet.getUsedRange().values;
const body = values.slice(1).filter((row) => normalize(row[0]));

const changed = [];
for (const row of body) {
  const current = normalize(row[3]);
  const edited = normalize(joinedLines(row));
  const subtext = normalize(row[7]);
  const reason = normalize(row[8]);
  const tone = normalize(row[9]);
  const memo = normalize(row[10]);
  if (current !== edited || memo) {
    changed.push({
      id: row[0],
      category: row[1],
      keyword: row[2],
      current,
      edited,
      subtext,
      reason,
      tone,
      memo,
    });
  }
}

console.log(JSON.stringify({ count: changed.length, changed }, null, 2));
