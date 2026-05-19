const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.resolve(ROOT, 'fonts');
const ASSETS_DIR = path.resolve(ROOT, 'assets');

// Print dimensions @ 300 DPI
const A4_W = 2480; // A4 portrait width  (210 mm)
const A4_H = 3508; // A4 portrait height (297 mm)
const A5_W = 1748; // A5 portrait width  (148 mm)
const A5_H = 2480; // A5 portrait height (210 mm)

const OFFSET_X = Math.round((A4_W - A5_W) / 2); // 366
const OFFSET_Y = Math.round((A4_H - A5_H) / 2); // 514

const SO_ICON = fs.readFileSync(path.resolve(ASSETS_DIR, 'logo-icon.svg'), 'utf-8');
const SO_TEXT = fs.readFileSync(path.resolve(ASSETS_DIR, 'logo-text.svg'), 'utf-8');

const CONFIG = {
  slug: '2026-04-22-ai-buildathon',
  title: 'Future-proof yourself.<br>Become an operator.',
  body: 'Learn from makers building on the cutting edge of AI. New products, ideas, and conversations live in our community.',
  qrLabel: 'Join us on Telegram',
  qrImage: 'qr-community.jpg',
  background: 'hero-bg.jpg',
  output: 'community-a4-portrait.png',
};

function buildHTML(cfg) {
  const fontsDir = FONTS_DIR.replace(/ /g, '%20');
  const bgPath = `file://${path.resolve(ASSETS_DIR, cfg.background).replace(/ /g, '%20')}`;
  const qrPath = `file://${path.resolve(ASSETS_DIR, cfg.qrImage).replace(/ /g, '%20')}`;

  const innerPad = 160;
  const guidePad = 90;
  const titleSize = 130;
  const bodySize = 44;
  const labelSize = 40;
  const qrSize = 690;

  const tickLen = 54;
  const tickGap = 18;
  const tickColor = 'rgba(255,255,255,0.65)';
  const tickThick = 3;

  const cropMark = (x, y, w, h) => `
    <div style="position:absolute;
      left:${x}px; top:${y}px;
      width:${w}px; height:${h}px;
      background:${tickColor};"></div>`;

  const corners = [
    // Top-left
    cropMark(OFFSET_X - tickGap - tickLen, OFFSET_Y, tickLen, tickThick),
    cropMark(OFFSET_X, OFFSET_Y - tickGap - tickLen, tickThick, tickLen),
    // Top-right
    cropMark(OFFSET_X + A5_W + tickGap, OFFSET_Y, tickLen, tickThick),
    cropMark(OFFSET_X + A5_W - tickThick, OFFSET_Y - tickGap - tickLen, tickThick, tickLen),
    // Bottom-left
    cropMark(OFFSET_X - tickGap - tickLen, OFFSET_Y + A5_H - tickThick, tickLen, tickThick),
    cropMark(OFFSET_X, OFFSET_Y + A5_H + tickGap, tickThick, tickLen),
    // Bottom-right
    cropMark(OFFSET_X + A5_W + tickGap, OFFSET_Y + A5_H - tickThick, tickLen, tickThick),
    cropMark(OFFSET_X + A5_W - tickThick, OFFSET_Y + A5_H + tickGap, tickThick, tickLen),
  ].join('');

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
    bottom: ${Math.round(innerPad * 0.85)}px;
    left: 50%;
    transform: translateX(-50%);
    display: flex; align-items: center; gap: 40px;
  }
  .so-logo { width: 130px; height: 130px; }
  .so-text { height: 82px; }
  .so-logo svg { width:100%; height:100%; display:block; }
  .so-text svg { width:100%; height:100%; display:block; fill:white; }

  .title {
    position: absolute;
    left: ${innerPad}px;
    right: ${innerPad}px;
    top: ${Math.round(A5_H * 0.09)}px;
    font-family: 'FK Grotesk Trial', sans-serif;
    font-weight: 400;
    font-size: ${titleSize}px;
    line-height: 1.05;
    letter-spacing: -3px;
    color: #fff;
    text-align: center;
  }

  .body {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: ${Math.round(A5_H * 0.22)}px;
    width: ${A5_W - innerPad * 2 - 120}px;
    font-family: 'FK Grotesk Trial', sans-serif;
    font-weight: 400;
    font-size: ${bodySize}px;
    line-height: 1.35;
    letter-spacing: -0.3px;
    color: #848484;
    text-align: center;
  }

  .qr-label {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: ${Math.round(A5_H * 0.33)}px;
    font-family: 'Proto Mono', monospace;
    font-weight: 600;
    font-size: ${labelSize}px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #fff;
  }

  .qr-wrap {
    position: absolute;
    left: 50%;
    top: ${Math.round(A5_H * 0.39)}px;
    transform: translateX(-50%);
    width: ${qrSize}px;
    height: ${qrSize}px;
    padding: 36px;
    background: #fff;
  }
  .qr-wrap img {
    width: 100%;
    height: 100%;
    display: block;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
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
    <div class="body">${cfg.body}</div>

    <div class="qr-label">${cfg.qrLabel}</div>
    <div class="qr-wrap">
      <img src="${qrPath}" alt="QR code">
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  const outDir = path.resolve(ROOT, 'events', CONFIG.slug, 'assets');
  fs.mkdirSync(outDir, { recursive: true });

  const html = buildHTML(CONFIG);
  const tmpFile = path.join(outDir, `_tmp_community.html`);
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
