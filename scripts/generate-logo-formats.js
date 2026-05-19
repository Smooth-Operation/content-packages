const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.resolve(ROOT, 'assets');
const OUT_DIR = path.resolve(ASSETS_DIR, 'logo');

const VARIANTS = [
  { name: 'white', src: 'logo-white.svg', bg: 'transparent' },
  { name: 'black', src: 'logo-black.svg', bg: 'transparent' },
];

const PNG_WIDTHS = [512, 1024, 2048, 4096];
const ASPECT = 189.27 / 20; // SVG viewBox aspect

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();

  for (const v of VARIANTS) {
    const svg = fs.readFileSync(path.resolve(ASSETS_DIR, v.src), 'utf-8');

    // Copy SVG as-is
    fs.writeFileSync(path.join(OUT_DIR, `logo-${v.name}.svg`), svg);

    // Generate PNGs at multiple widths (transparent background)
    for (const w of PNG_WIDTHS) {
      const h = Math.round(w / ASPECT);
      const html = `<!DOCTYPE html><html><head><style>
        *{margin:0;padding:0} html,body{width:${w}px;height:${h}px;overflow:hidden}
        svg{width:${w}px;height:${h}px;display:block}
      </style></head><body>${svg}</body></html>`;
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.screenshot({
        path: path.join(OUT_DIR, `logo-${v.name}-${w}.png`),
        omitBackground: true,
        type: 'png',
      });
      await page.close();
    }

    // Generate PDF (vector). Page size matches SVG aspect; convert units to inches for pdf.
    // 600 wide × (600/ASPECT) tall in CSS px ≈ 6.25" wide.
    const pdfW = 600;
    const pdfH = Math.round(pdfW / ASPECT);
    const pdfHtml = `<!DOCTYPE html><html><head><style>
      @page { size: ${pdfW}px ${pdfH}px; margin: 0; }
      *{margin:0;padding:0} html,body{width:${pdfW}px;height:${pdfH}px;overflow:hidden;background:transparent}
      svg{width:${pdfW}px;height:${pdfH}px;display:block}
    </style></head><body>${svg}</body></html>`;
    const page = await browser.newPage({ viewport: { width: pdfW, height: pdfH } });
    await page.setContent(pdfHtml, { waitUntil: 'networkidle' });
    await page.pdf({
      path: path.join(OUT_DIR, `logo-${v.name}.pdf`),
      width: `${pdfW}px`,
      height: `${pdfH}px`,
      printBackground: false,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    await page.close();

    console.log(`  ✓ ${v.name}: svg, pdf, png (${PNG_WIDTHS.join(', ')})`);
  }

  await browser.close();
  console.log(`\nAll formats written to ${OUT_DIR}`);
}

main().catch(err => { console.error(err); process.exit(1); });
