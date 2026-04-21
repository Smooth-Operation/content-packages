const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const url = process.argv[2] || 'http://localhost:4323/';
  const w = parseInt(process.argv[3] || '3840', 10);
  const h = parseInt(process.argv[4] || '2160', 10);
  const outName = process.argv[5] || `hero-bg-${w}x${h}.jpg`;
  const outPath = path.resolve(__dirname, '..', 'assets', outName);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  // Hide only the foreground content so we see the pure bg stack (video + noise + stars).
  // Do NOT touch any sizing/layout — capture the site exactly as it renders.
  await page.addStyleTag({
    content: `
      .hero-content, .hero-text, .hero-cta, header, nav, footer { visibility: hidden !important; }
    `,
  });

  await page.waitForFunction(() => {
    const v = document.querySelector('.hero-video');
    return v && v.readyState >= 2 && v.videoWidth > 0 && !v.paused;
  }, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);

  const heroBox = await page.locator('.hero').first().boundingBox();
  const clip = heroBox
    ? {
        x: Math.max(0, Math.round(heroBox.x)),
        y: Math.max(0, Math.round(heroBox.y)),
        width: Math.min(w, Math.round(heroBox.width)),
        height: Math.min(h, Math.round(heroBox.height)),
      }
    : { x: 0, y: 0, width: w, height: h };

  await page.screenshot({ path: outPath, type: 'jpeg', quality: 95, clip });

  await page.close();
  await context.close();
  await browser.close();

  console.log(`  ✓ captured ${clip.width}×${clip.height} @ viewport ${w}×${h} → ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
