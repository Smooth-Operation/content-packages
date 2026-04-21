const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.resolve(ROOT, 'fonts');
const ASSETS_DIR = path.resolve(ROOT, 'assets');

// Print dimensions @ 300 DPI
const A4_W = 3508; // A4 landscape width  (297 mm)
const A4_H = 2480; // A4 landscape height (210 mm)
const A5_W = 2480; // A5 landscape width  (210 mm)
const A5_H = 1748; // A5 landscape height (148 mm)

const OFFSET_X = Math.round((A4_W - A5_W) / 2); // 514
const OFFSET_Y = Math.round((A4_H - A5_H) / 2); // 366

const SO_ICON = fs.readFileSync(path.resolve(ASSETS_DIR, 'logo-icon.svg'), 'utf-8');
const SO_TEXT = fs.readFileSync(path.resolve(ASSETS_DIR, 'logo-text.svg'), 'utf-8');

const CONFIG = {
  slug: '2026-04-22-ai-buildathon',
  title: 'Build an idea in<br>2 hours challenge.',
  sectionHeader: 'Rules',
  rules: [
    'Get assigned an idea.',
    'Use Github.',
    'When ready, post your github link in the portal at events.smoothoperators.dev.',
    'Present the final result in 2 minutes at 21:00.',
  ],
  url: 'smoothoperators.dev',
  background: 'hero-bg.jpg',
  output: 'rules-a4-landscape.png',
};

function buildHTML(cfg) {
  const fontsDir = FONTS_DIR.replace(/ /g, '%20');
  const bgPath = `file://${path.resolve(ASSETS_DIR, cfg.background).replace(/ /g, '%20')}`;

  const innerPad = 160;     // content inset from A5 edge
  const guidePad = 90;      // guide-line inset from A5 edge
  const titleSize = 180;    // FK Grotesk title (multi-line)
  const sectionSize = 44;   // Proto Mono SemiBold section label
  const bulletSize = 54;    // Proto Mono Light rules body
  const smallMeta = 28;     // URL / logo row text

  // Crop-mark geometry (short L-ticks outside the A5 rectangle)
  const tickLen = 54;
  const tickGap = 18;
  const tickColor = 'rgba(255,255,255,0.65)';
  const tickThick = 3;

  const cropMark = (x, y, dx, dy, len) => `
    <div style="position:absolute;
      left:${x}px; top:${y}px;
      width:${dx ? len : tickThick}px;
      height:${dy ? len : tickThick}px;
      background:${tickColor};"></div>`;

  const corners = [
    // Top-left
    cropMark(OFFSET_X - tickGap - tickLen, OFFSET_Y, 1, 0, tickLen),
    cropMark(OFFSET_X, OFFSET_Y - tickGap - tickLen, 0, 1, tickLen),
    // Top-right
    cropMark(OFFSET_X + A5_W + tickGap, OFFSET_Y, 1, 0, tickLen),
    cropMark(OFFSET_X + A5_W, OFFSET_Y - tickGap - tickLen, 0, 1, tickLen),
    // Bottom-left
    cropMark(OFFSET_X - tickGap - tickLen, OFFSET_Y + A5_H - tickThick, 1, 0, tickLen),
    cropMark(OFFSET_X, OFFSET_Y + A5_H + tickGap, 0, 1, tickLen),
    // Bottom-right
    cropMark(OFFSET_X + A5_W + tickGap, OFFSET_Y + A5_H - tickThick, 1, 0, tickLen),
    cropMark(OFFSET_X + A5_W, OFFSET_Y + A5_H + tickGap, 0, 1, tickLen),
  ].join('');

  const rulesLis = cfg.rules.map(r => `<li>${r}</li>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'FK Grotesk Trial';
    src: url('file://${fontsDir}/FKGroteskTrial-Regular.otf') format('opentype');
    font-weight: 400; font-style: normal;
  }
  @font-face {
    font-family: 'Proto Mono';
    src: url('file://${fontsDir}/ProtoMono-Light.woff') format('woff');
    font-weight: 300; font-style: normal;
  }
  @font-face {
    font-family: 'Proto Mono';
    src: url('file://${fontsDir}/ProtoMono-Regular.woff') format('woff');
    font-weight: 400; font-style: normal;
  }
  @font-face {
    font-family: 'Proto Mono';
    src: url('file://${fontsDir}/ProtoMono-SemiBold.woff') format('woff');
    font-weight: 600; font-style: normal;
  }

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    width: ${A4_W}px; height: ${A4_H}px;
    background: #010101; color: #fff;
    position: relative; overflow: hidden;
  }

  .bg-pixels {
    position: absolute; inset: 0;
    background: url('${bgPath}') center/cover no-repeat;
    opacity: 0.85;
    filter: brightness(1.35) contrast(1.1);
  }

  .a5 {
    position: absolute;
    left: ${OFFSET_X}px; top: ${OFFSET_Y}px;
    width: ${A5_W}px; height: ${A5_H}px;
    overflow: hidden;
  }

  .guide-l, .guide-r {
    position: absolute; top: 0; bottom: 0; width: 1px;
    background: rgba(255,255,255,0.12);
  }
  .guide-l { left: ${guidePad}px; }
  .guide-r { right: ${guidePad}px; }

  .divider {
    position: absolute; height: 1px;
    left: ${guidePad}px; right: ${guidePad}px;
    background: rgba(255,255,255,0.12);
  }
  .divider-top { top: ${guidePad}px; }
  .divider-bottom { bottom: ${guidePad}px; }
  .divider::before, .divider::after {
    content:''; position:absolute; top:-1.5px; width:4px; height:4px;
    background:#fff;
  }
  .divider::before { left:-2px; }
  .divider::after  { right:-2px; }

  .logo-row {
    position: absolute;
    top: ${Math.round(innerPad * 0.92)}px;
    left: ${innerPad}px;
    display: flex; align-items: center; gap: 28px;
  }
  .so-logo { width: 76px; height: 76px; }
  .so-text { height: 48px; }
  .so-logo svg { width:100%; height:100%; display:block; }
  .so-text svg { width:100%; height:100%; display:block; fill:white; }

  .url {
    position: absolute;
    bottom: ${Math.round(innerPad * 0.92)}px;
    right: ${innerPad}px;
    font-family: 'Proto Mono', monospace;
    font-weight: 400;
    font-size: ${smallMeta}px;
    color: #fff;
    letter-spacing: -0.12px;
  }

  .title {
    position: absolute;
    left: ${innerPad}px;
    right: ${innerPad}px;
    top: ${Math.round(A5_H * 0.22)}px;
    font-family: 'FK Grotesk Trial', sans-serif;
    font-weight: 400;
    font-size: ${titleSize}px;
    line-height: 0.95;
    letter-spacing: -5px;
    color: #fff;
  }

  .section-header {
    position: absolute;
    left: ${innerPad}px;
    top: ${Math.round(A5_H * 0.52)}px;
    font-family: 'Proto Mono', monospace;
    font-weight: 600;
    font-size: ${sectionSize}px;
    color: #fff;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .rules {
    position: absolute;
    left: ${innerPad + 20}px;
    right: ${innerPad}px;
    top: ${Math.round(A5_H * 0.52) + 90}px;
    font-family: 'Proto Mono', monospace;
    font-weight: 300;
    font-size: ${bulletSize}px;
    line-height: 1.45;
    color: #fff;
    letter-spacing: -0.4px;
    list-style: none;
  }
  .rules li {
    position: relative;
    padding-left: 48px;
    margin-bottom: 10px;
  }
  .rules li::before {
    content: '•';
    position: absolute; left: 12px; top: 0;
    color: #848484;
  }
</style>
</head>
<body>
  <div class="bg-pixels"></div>
  ${corners}

  <div class="a5">
    <div class="guide-l"></div>
    <div class="guide-r"></div>
    <div class="divider divider-top"></div>
    <div class="divider divider-bottom"></div>

    <div class="logo-row">
      <div class="so-logo">${SO_ICON}</div>
      <div class="so-text">${SO_TEXT}</div>
    </div>

    <div class="title">${cfg.title}</div>

    <div class="section-header">${cfg.sectionHeader}</div>
    <ul class="rules">${rulesLis}</ul>

    <span class="url">${cfg.url}</span>
  </div>
</body>
</html>`;
}

async function main() {
  const outDir = path.resolve(ROOT, 'events', CONFIG.slug, 'assets');
  fs.mkdirSync(outDir, { recursive: true });

  const html = buildHTML(CONFIG);
  const tmpFile = path.join(outDir, `_tmp_rules.html`);
  fs.writeFileSync(tmpFile, html);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: A4_W, height: A4_H });
  await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const outFile = path.join(outDir, CONFIG.output);
  await page.screenshot({ path: outFile, type: 'png' });
  await page.close();
  await browser.close();

  fs.unlinkSync(tmpFile);
  console.log(`✓ ${CONFIG.output} (${A4_W}×${A4_H})`);
  console.log(`  A5 centered at ${OFFSET_X},${OFFSET_Y} — cut inside tick marks`);
  console.log(`  saved to ${outFile}`);
}

main().catch(err => { console.error(err); process.exit(1); });
