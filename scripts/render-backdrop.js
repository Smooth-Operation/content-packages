const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { FORMATS, buildHTML, loadEvent } = require('./render.js');

const ASSETS_DIR = path.resolve(__dirname, '..', 'assets');

// Read intrinsic pixel dimensions of a PNG or JPEG without any dependencies.
function imageSize(file) {
  const buf = fs.readFileSync(file);
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.slice(0, 8).equals(pngSig)) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + len;
    }
  }
  throw new Error(`Unsupported image: ${file}`);
}

async function main() {
  const args = process.argv.slice(2);
  const slug = args[0];
  const formatName = args[1];
  const scale = parseFloat(args[2] || '3');

  if (!slug || !formatName) {
    console.error('Usage: node render-backdrop.js <event-slug> <format-name> [scale=3]');
    console.error('Example: node render-backdrop.js 2026-04-22-ai-buildathon telegram-1280x720 3');
    process.exit(1);
  }

  const format = FORMATS.find(f => f.name === formatName);
  if (!format) {
    console.error(`Unknown format: ${formatName}`);
    console.error(`Available: ${FORMATS.map(f => f.name).join(', ')}`);
    process.exit(1);
  }

  const event = loadEvent(slug);
  const outDir = path.join(event._dir, 'assets');
  fs.mkdirSync(outDir, { recursive: true });

  // Measure the event's background so we can tile it at 1:1 physical pixels.
  let bgOverrideCSS = '';
  if (event.background) {
    const bgPath = path.resolve(ASSETS_DIR, event.background);
    const { w: bgW, h: bgH } = imageSize(bgPath);
    // To map one source pixel to one output physical pixel at deviceScaleFactor=scale,
    // the background tile must occupy (bgW/scale × bgH/scale) CSS pixels.
    const tileW = bgW / scale;
    const tileH = bgH / scale;
    bgOverrideCSS = `<style>
      .bg-pixels {
        background-size: ${tileW}px ${tileH}px !important;
        background-position: 0 0 !important;
        background-repeat: repeat !important;
        image-rendering: pixelated;
      }
    </style>`;
  }

  const outW = Math.round(format.w * scale);
  const outH = Math.round(format.h * scale);

  let html = buildHTML(format, event);
  if (bgOverrideCSS) html = html.replace('</head>', `${bgOverrideCSS}</head>`);

  const tmpFile = path.join(outDir, `_tmp_backdrop_${format.name}.html`);
  fs.writeFileSync(tmpFile, html);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: format.w, height: format.h },
    deviceScaleFactor: scale,
  });
  const page = await context.newPage();
  await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const outFile = path.join(outDir, `${format.name}-${outW}x${outH}.png`);
  await page.screenshot({ path: outFile, type: 'png' });

  await page.close();
  await context.close();
  await browser.close();
  fs.unlinkSync(tmpFile);

  console.log(`  ✓ ${format.name} @ ${scale}× → ${outW}×${outH}`);
  console.log(`  ${outFile}`);
}

main().catch(err => { console.error(err); process.exit(1); });
