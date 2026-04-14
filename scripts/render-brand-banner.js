const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.resolve(ROOT, 'fonts');
const ASSETS_DIR = path.resolve(ROOT, 'assets');
const OUT_DIR = path.resolve(ROOT, 'brand', 'x-banner');

const soLogo = fs.readFileSync(path.resolve(ASSETS_DIR, 'logo-icon.svg'), 'utf-8');
const fontsDir = FONTS_DIR.replace(/ /g, '%20');
const bgPath = `file://${path.resolve(ASSETS_DIR, 'hero-bg.jpg').replace(/ /g, '%20')}`;

const W = 1500;
const H = 500;

const html = `<!DOCTYPE html>
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
    src: url('file://${fontsDir}/ProtoMono-Regular.woff') format('woff');
    font-weight: 400; font-style: normal;
  }

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    width: ${W}px; height: ${H}px;
    background: #010101; color: #fff;
    overflow: hidden; position: relative;
  }

  .bg-pixels {
    position:absolute; inset:0;
    background: url('${bgPath}') center/cover no-repeat;
    opacity: 0.4;
  }

  .guide-l, .guide-r {
    position:absolute; top:0; bottom:0; width:1px;
    background:rgba(255,255,255,0.12);
  }
  .guide-l { left:50px; }
  .guide-r { right:50px; }

  .divider {
    position:absolute; left:50px; right:50px; height:1px;
    background:rgba(255,255,255,0.12);
  }
  .divider::before, .divider::after {
    content:''; position:absolute; top:-1.5px; width:4px; height:4px;
    background:#fff;
  }
  .divider::before { left:-2px; }
  .divider::after  { right:-2px; }
  .divider-top { top:50px; }
  .divider-bottom { bottom:50px; }

  .center-content {
    position:absolute; inset:0;
    display:flex; align-items:center; justify-content:center;
    gap: 20px;
  }

  .so-logo { width:36px; height:36px; }
  .so-logo svg { width:100%; height:100%; display:block; }

  .brand-name {
    font-family:'FK Grotesk Trial',sans-serif;
    font-size:48px; font-weight:400;
    letter-spacing:-1.5px; color:#fff;
  }

  .url {
    position:absolute; bottom:68px; right:80px;
    font-family:'Proto Mono',monospace;
    font-size:14px; color:#848484; letter-spacing:-0.12px;
  }
</style>
</head>
<body>
  <div class="bg-pixels"></div>
  <div class="guide-l"></div>
  <div class="guide-r"></div>
  <div class="divider divider-top"></div>
  <div class="divider divider-bottom"></div>

  <div class="center-content">
    <div class="so-logo">${soLogo}</div>
    <span class="brand-name">Smooth Operators</span>
  </div>

  <span class="url">smoothoperators.dev</span>
</body>
</html>`;

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const tmpFile = path.join(OUT_DIR, '_tmp.html');
  fs.writeFileSync(tmpFile, html);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: W, height: H });
  await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const outFile = path.join(OUT_DIR, 'x-banner-1500x500.png');
  await page.screenshot({ path: outFile, type: 'png' });

  await page.close();
  await browser.close();
  fs.unlinkSync(tmpFile);

  console.log(`✓ Brand X banner saved to ${outFile}`);
}

main().catch(err => { console.error(err); process.exit(1); });
