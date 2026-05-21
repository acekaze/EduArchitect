import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const BASE = "C:/코딩/교육설계/강사용_게임교구_개발";
const INPUT_PATH = path.join(BASE, "팀등불_문구편집용.xlsx");
const OUT_PATH = path.join(BASE, "팀등불_문구편집용_제안본.xlsx");
const PREVIEW_PATH = path.join(BASE, "팀등불_문구편집용_제안본_미리보기.png");

const proposals = {
  EXEC06: ["포기 버튼이", "고장났습니다", ""],
  THINK01: ["질문 하나로", "회의실 확장공사 완료", ""],
  THINK02: ["정리계의 압축파일", "복잡함이 깔끔해짐", ""],
  THINK03: ["관찰력 레이더", "사각지대 없습니다", ""],
  THINK04: ["아이디어 자판기", "오늘도 신상 출시", ""],
  THINK05: ["머릿속 설계도", "바로 펼쳐집니다", ""],
  THINK06: ["팩트도 따뜻하게", "포장하는 기술자", ""],
  SHIFT01: ["용기 버튼", "오늘 제대로 눌렀습니다", ""],
  SHIFT02: ["생각의 핸들링", "부드럽습니다", ""],
  SHIFT03: ["다시 들어오는 타이밍", "드라마 주인공급", ""],
  SHIFT04: ["팩트 배송 왔습니다", "근데 포장이 따뜻해요", ""],
  SHIFT05: ["배운 즉시 사용", "흡수력 최고", ""],
  SHIFT06: ["인간 공기청정기", "팀 공기가 편해집니다", ""],
  MOOD01: ["오늘 착장", "팀 사기 버프 걸렸습니다", ""],
  MOOD02: ["웃음 한 번에", "분위기 재부팅 완료", ""],
  MOOD03: ["존재감은 은은한데", "효과는 강력합니다", ""],
  MOOD04: ["센스 한 스푼", "분위기 완성", ""],
  MOOD05: ["말투가 푹신해서", "대화가 편안합니다", ""],
  MOOD06: ["팀 단체사진", "센터감입니다", ""],
};

const input = await FileBlob.load(INPUT_PATH);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("문구편집");
const used = sheet.getUsedRange();
const values = used.values;

for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
  const id = String(values[rowIndex][0] ?? "").trim();
  const proposal = proposals[id];
  if (!proposal) continue;
  sheet.getRangeByIndexes(rowIndex, 4, 1, 3).values = [proposal];
  sheet.getRangeByIndexes(rowIndex, 10, 1, 1).values = [["Codex 제안"]];
}

const preview = await workbook.render({
  sheetName: "문구편집",
  range: "A1:M37",
  scale: 1,
  format: "png",
});
await fs.writeFile(PREVIEW_PATH, new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(OUT_PATH);
console.log(OUT_PATH);
console.log(PREVIEW_PATH);
