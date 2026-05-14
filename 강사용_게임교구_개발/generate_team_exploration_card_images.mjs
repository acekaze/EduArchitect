import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "팀탐험_카드이미지");
const htmlDir = join(outDir, "_html");
mkdirSync(outDir, { recursive: true });
mkdirSync(htmlDir, { recursive: true });

const chromeCandidates = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];

const chrome = chromeCandidates.find((path) => {
  try {
    execFileSync("powershell", ["-NoProfile", "-Command", `Test-Path -LiteralPath '${path}'`], { encoding: "utf8" });
    return true;
  } catch {
    return false;
  }
});

if (!chrome) {
  throw new Error("Chrome 또는 Edge 실행 파일을 찾지 못했습니다.");
}

const icons = {
  flag: `
    <path d="M7 20V4" />
    <path d="M7 5h10l-2 4 2 4H7" />
    <path d="M5 20h6" />
  `,
  compass: `
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v3" />
    <path d="M12 18v3" />
    <path d="M3 12h3" />
    <path d="M18 12h3" />
    <path d="M15.5 8.5l-2.2 5.1-4.8 1.9 2.2-5.1 4.8-1.9z" />
  `,
  map: `
    <path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2V6z" />
    <path d="M9 4v14" />
    <path d="M15 6v14" />
  `,
  lantern: `
    <path d="M9 4h6" />
    <path d="M10 4c0 2-2 2-2 5v8c0 2 2 3 4 3s4-1 4-3V9c0-3-2-3-2-5" />
    <path d="M9 11h6" />
    <path d="M9 16h6" />
    <path d="M12 8v2" />
  `,
  rope: `
    <path d="M8 8c-2 0-4 2-4 4s2 4 4 4c1.5 0 2.7-.7 4-2" />
    <path d="M16 8c2 0 4 2 4 4s-2 4-4 4c-1.5 0-2.7-.7-4-2" />
    <path d="M9 12h6" />
    <path d="M10.5 9.5l3 5" />
    <path d="M13.5 9.5l-3 5" />
  `,
  food: `
    <path d="M7 8h10l1 11H6L7 8z" />
    <path d="M9 8c0-3 6-3 6 0" />
    <path d="M9 12h6" />
    <path d="M10 16h4" />
  `,
};

const cards = [
  { id: "flag", filename: "01_깃발_6점.png", name: "깃발", score: 6, meaning: "완주", copy: "팀이 끝까지 도착했다.", main: "#C64B3C", sub: "#F5D2CC" },
  { id: "compass", filename: "02_나침반_5점.png", name: "나침반", score: 5, meaning: "방향", copy: "팀의 방향이 정해졌다.", main: "#24476B", sub: "#D8E3EC" },
  { id: "map", filename: "03_지도_4점.png", name: "지도", score: 4, meaning: "구조", copy: "길이 한눈에 정리됐다.", main: "#5F7A52", sub: "#E1E8D9" },
  { id: "lantern", filename: "04_랜턴_3점.png", name: "랜턴", score: 3, meaning: "통찰", copy: "보이지 않던 길을 비췄다.", main: "#D49A2A", sub: "#F6E4B8" },
  { id: "rope", filename: "05_로프_2점.png", name: "로프", score: 2, meaning: "연결", copy: "팀이 서로를 연결했다.", main: "#8A6A4F", sub: "#E8D8C7" },
  { id: "food", filename: "06_식량_1점.png", name: "식량", score: 1, meaning: "지속", copy: "끝까지 갈 힘을 챙겼다.", main: "#A7A06A", sub: "#EEEACB" },
];

const baseCss = `
  * { box-sizing: border-box; }
  html, body {
    width: 700px;
    height: 1000px;
    margin: 0;
    overflow: hidden;
    background: transparent;
    font-family: "Pretendard", "Noto Sans KR", "Malgun Gothic", Arial, sans-serif;
  }
  .card {
    width: 700px;
    height: 1000px;
    position: relative;
    overflow: hidden;
    border: 4px solid rgba(24, 35, 33, 0.38);
    border-radius: 34px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.22)),
      var(--sub);
    padding: 62px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .card::before {
    content: "";
    position: absolute;
    inset: 32px;
    border: 2px solid rgba(255, 255, 255, 0.74);
    border-radius: 24px;
    pointer-events: none;
    z-index: 2;
  }
  .card::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 26% 22%, rgba(255, 255, 255, 0.52), transparent 34%),
      repeating-linear-gradient(34deg, transparent 0 82px, rgba(24, 35, 33, 0.04) 82px 87px);
    pointer-events: none;
    z-index: 1;
  }
  .card > * { position: relative; z-index: 3; }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 40px;
  }
  .label {
    color: var(--main);
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 0.08em;
    line-height: 1.22;
    text-transform: uppercase;
  }
  .score {
    width: 144px;
    height: 144px;
    border-radius: 50%;
    background: var(--main);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 18px 40px rgba(24, 35, 33, 0.24);
    flex: 0 0 auto;
  }
  .score strong {
    font-size: 72px;
    line-height: 0.92;
    font-weight: 900;
  }
  .score span {
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 0.08em;
  }
  .visual {
    display: grid;
    place-items: center;
    text-align: center;
  }
  .icon-frame {
    width: 300px;
    height: 300px;
    display: grid;
    place-items: center;
    margin-bottom: 44px;
    border: 5px solid color-mix(in srgb, var(--main), white 18%);
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 44%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.34) 68%),
      color-mix(in srgb, var(--sub), white 18%);
  }
  .icon {
    width: 188px;
    height: 188px;
    color: var(--main);
    stroke: currentColor;
    fill: none;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .name {
    font-size: 92px;
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: 0;
    color: #182321;
  }
  .meaning {
    width: fit-content;
    margin: 28px auto 0;
    padding: 10px 32px;
    border: 3px solid color-mix(in srgb, var(--main), white 22%);
    border-radius: 999px;
    color: var(--main);
    background: rgba(255, 255, 255, 0.55);
    font-size: 34px;
    font-weight: 900;
  }
  .copy {
    min-height: 132px;
    padding: 0 20px 6px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    text-align: center;
    color: #182321;
    font-size: 42px;
    line-height: 1.35;
    font-weight: 800;
    word-break: keep-all;
  }
  .back {
    color: #fffaf2;
    background:
      radial-gradient(circle at 50% 38%, rgba(242, 218, 153, 0.12), transparent 42%),
      linear-gradient(145deg, #1f332d, #182621);
    align-items: center;
    justify-content: center;
    gap: 72px;
    text-align: center;
  }
  .back::before { border-color: rgba(255, 255, 255, 0.22); }
  .back::after {
    background:
      linear-gradient(90deg, transparent 0 47%, rgba(255, 255, 255, 0.08) 47% 53%, transparent 53% 100%),
      linear-gradient(0deg, transparent 0 47%, rgba(255, 255, 255, 0.08) 47% 53%, transparent 53% 100%);
    transform: rotate(18deg) scale(1.4);
  }
  .back-mark {
    width: 330px;
    height: 330px;
    color: #e7d8a6;
    stroke: currentColor;
    fill: none;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.92;
  }
  .back-title {
    font-size: 78px;
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: 0.06em;
  }
`;

function svgIcon(id, className = "icon") {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${icons[id]}</svg>`;
}

function frontHtml(card) {
  return `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><style>${baseCss}</style></head>
<body>
  <article class="card" style="--main:${card.main}; --sub:${card.sub};">
    <div class="top">
      <div class="label">TEAM<br>EXPLORATION</div>
      <div class="score"><strong>${card.score}</strong><span>POINT</span></div>
    </div>
    <div class="visual">
      <div class="icon-frame">${svgIcon(card.id)}</div>
      <div class="name">${card.name}</div>
      <div class="meaning">${card.meaning}</div>
    </div>
    <div class="copy">${card.copy}</div>
  </article>
</body>
</html>`;
}

function backHtml() {
  return `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><style>${baseCss}</style></head>
<body>
  <article class="card back">
    ${svgIcon("compass", "back-mark")}
    <div class="back-title">EXPLORATION<br>CARD</div>
  </article>
</body>
</html>`;
}

function render(htmlName, pngName, html, width = 700, height = 1000) {
  const htmlPath = join(htmlDir, htmlName);
  const pngPath = join(outDir, pngName);
  writeFileSync(htmlPath, html, "utf8");
  const fileUrl = `file:///${htmlPath.replaceAll("\\", "/")}`;
  execFileSync(chrome, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${width},${height}`,
    `--screenshot=${pngPath}`,
    fileUrl,
  ], { stdio: "pipe" });
}

for (const card of cards) {
  render(`${card.id}.html`, card.filename, frontHtml(card));
}

render("back.html", "00_공통_뒷면.png", backHtml());

const sheetHtml = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      background: #eee7da;
      font-family: "Pretendard", "Noto Sans KR", "Malgun Gothic", Arial, sans-serif;
    }
    .wrap {
      width: 1500px;
      min-height: 1050px;
      padding: 42px;
    }
    h1 {
      margin: 0 0 26px;
      font-size: 42px;
      color: #182321;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 300px);
      gap: 28px;
    }
    img {
      width: 300px;
      height: auto;
      border-radius: 16px;
      box-shadow: 0 14px 26px rgba(47, 38, 25, 0.16);
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>팀 탐험 카드 이미지 시안</h1>
    <div class="grid">
      <img src="../01_깃발_6점.png" alt="깃발">
      <img src="../02_나침반_5점.png" alt="나침반">
      <img src="../03_지도_4점.png" alt="지도">
      <img src="../04_랜턴_3점.png" alt="랜턴">
      <img src="../05_로프_2점.png" alt="로프">
      <img src="../06_식량_1점.png" alt="식량">
      <img src="../00_공통_뒷면.png" alt="공통 뒷면">
    </div>
  </div>
</body>
</html>`;

render("preview.html", "팀탐험_카드_이미지시안_모음.png", sheetHtml, 1500, 1120);

console.log(`Rendered card images to ${outDir}`);
