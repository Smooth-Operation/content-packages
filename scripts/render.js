const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// ─── FORMAT DEFINITIONS ───
const FORMATS = [
  { name: 'luma-1200x1200',     w: 1200, h: 1200, layout: 'square' },
  { name: 'x-post-1600x900',    w: 1600, h: 900,  layout: 'landscape' },
  { name: 'x-banner-1500x500',  w: 1500, h: 500,  layout: 'banner' },
  { name: 'ig-feed-1080x1080',  w: 1080, h: 1080, layout: 'square' },
  { name: 'ig-feed-1080x1350',  w: 1080, h: 1350, layout: 'portrait' },
  { name: 'ig-story-1080x1920', w: 1080, h: 1920, layout: 'story' },
  { name: 'telegram-1280x720',  w: 1280, h: 720,  layout: 'landscape' },
  { name: 'poster-2480x3508',   w: 2480, h: 3508, layout: 'poster' },
  { name: 'og-1200x630',        w: 1200, h: 630,  layout: 'banner' },
];

const ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.resolve(ROOT, 'fonts');
const ASSETS_DIR = path.resolve(ROOT, 'assets');

// ─── SO LOGO SVG ───
const SO_LOGO_PATH = path.resolve(ASSETS_DIR, 'logo-icon.svg');

function loadSoLogo() {
  return fs.readFileSync(SO_LOGO_PATH, 'utf-8');
}

function loadEvent(slug) {
  const eventDir = path.resolve(ROOT, 'events', slug);
  const configPath = path.join(eventDir, 'event.json');
  if (!fs.existsSync(configPath)) {
    console.error(`No event.json found at ${configPath}`);
    process.exit(1);
  }
  const event = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  event._dir = eventDir;
  return event;
}

function buildHTML(format, event) {
  const { w, h, layout } = format;
  const soLogo = loadSoLogo();

  // Scale factors based on format
  const s = Math.min(w, h) / 1200;
  const pad = Math.round(80 * s);
  const inner = Math.round(120 * s);

  // Font sizes scaled
  const logoSize = Math.round(28 * s);
  const logoTextSize = Math.round(22 * s);
  const dateSize = Math.round(22 * s);
  const collabLabelSize = Math.round(18 * s);
  const collabLogoH = Math.round(26 * s);
  const urlSize = Math.round(20 * s);
  const metaSize = Math.round(24 * s);

  // Title uses <br> for multiline, oneline for landscape
  const useMultiline = ['square', 'portrait', 'story', 'poster'].includes(layout);
  const titleText = useMultiline ? event.title.replace(/\n/g, '<br>') : event.titleOneline;
  const taglineText = useMultiline ? event.tagline.replace(/\n/g, '<br>') : event.taglineOneline;

  // Title and tagline sizes vary by layout
  let titleSize, taglineSize;
  switch (layout) {
    case 'square':
      titleSize = Math.round(180 * s);
      taglineSize = Math.round(32 * s);
      break;
    case 'landscape':
      titleSize = Math.round(130 * s);
      taglineSize = Math.round(22 * s);
      break;
    case 'banner':
      titleSize = Math.round(130 * (Math.min(w, h) / 500));
      taglineSize = Math.round(22 * (Math.min(w, h) / 500));
      break;
    case 'portrait':
      titleSize = Math.round(160 * s);
      taglineSize = Math.round(30 * s);
      break;
    case 'story':
      titleSize = Math.round(180 * (w / 1200));
      taglineSize = Math.round(36 * (w / 1200));
      break;
    case 'poster':
      titleSize = Math.round(200 * (w / 1200));
      taglineSize = Math.round(40 * (w / 1200));
      break;
  }

  // Layout-specific positioning
  let contentCSS;

  if (layout === 'banner') {
    const bp = Math.round(50 * (h / 500));
    const bi = Math.round(80 * (h / 500));
    contentCSS = `
      .logo-row { position:absolute; top:${Math.round(h*0.14)}px; left:${bi}px; display:flex; align-items:center; gap:${Math.round(12*(h/500))}px; }
      .so-logo { width:${Math.round(22*(h/500))}px; height:${Math.round(22*(h/500))}px; }
      .title { position:absolute; top:${Math.round(h*0.28)}px; left:${bi}px; font-size:${titleSize}px; letter-spacing:-4px; }
      .tagline { position:absolute; top:${Math.round(h*0.6)}px; left:${bi}px; font-size:${taglineSize}px; color:#848484; font-family:'FK Grotesk Trial',sans-serif; letter-spacing:-0.3px; }
      .meta { position:absolute; top:${Math.round(h*0.16)}px; right:${bi}px; font-size:${Math.round(16*(h/500))}px; line-height:1.7; text-align:right; }
      .collab { position:absolute; bottom:${Math.round(h*0.14)}px; left:${bi}px; display:flex; align-items:center; gap:${Math.round(12*(h/500))}px; }
      .ch-logo { height:${Math.round(18*(h/500))}px; opacity:0.7; }
      .url { position:absolute; bottom:${Math.round(h*0.14)}px; right:${bi}px; font-size:${Math.round(16*(h/500))}px; }
      .guide-l { left:${bp}px; } .guide-r { right:${bp}px; }
      .divider { left:${bp}px; right:${bp}px; }
      .divider-top { top:${bp}px; } .divider-bottom { bottom:${bp}px; }
    `;
  } else if (layout === 'story' || layout === 'poster') {
    const titleTop = Math.round(h * 0.25);
    const tagTop = Math.round(h * 0.55);
    contentCSS = `
      .logo-row { position:absolute; top:${inner}px; left:${inner}px; display:flex; align-items:center; gap:${Math.round(14*s)}px; }
      .so-logo { width:${logoSize}px; height:${logoSize}px; }
      .date-tag { position:absolute; top:${Math.round(inner + 4*s)}px; right:${inner}px; font-size:${dateSize}px; }
      .title { position:absolute; top:${titleTop}px; left:${inner}px; right:${inner}px; font-size:${titleSize}px; letter-spacing:${Math.round(-6*s)}px; }
      .tagline { position:absolute; top:${tagTop}px; left:${inner}px; right:${Math.round(inner*1.5)}px; font-size:${taglineSize}px; line-height:1.3; color:#848484; font-family:'FK Grotesk Trial',sans-serif; letter-spacing:-0.5px; }
      .meta { position:absolute; bottom:${Math.round(inner*2)}px; left:${inner}px; font-size:${metaSize}px; line-height:1.7; }
      .collab { position:absolute; bottom:${inner}px; left:${inner}px; display:flex; align-items:center; gap:${Math.round(16*s)}px; }
      .ch-logo { height:${collabLogoH}px; opacity:0.7; }
      .url { position:absolute; bottom:${inner}px; right:${inner}px; font-size:${urlSize}px; }
      .guide-l { left:${pad}px; } .guide-r { right:${pad}px; }
      .divider { left:${pad}px; right:${pad}px; }
      .divider-top { top:${pad}px; } .divider-bottom { bottom:${pad}px; }
    `;
  } else {
    const titleTop = layout === 'landscape' ? Math.round(h * 0.3) : Math.round(h * 0.23);
    const tagTop = layout === 'landscape' ? Math.round(h * 0.65) : Math.round(h * 0.62);
    contentCSS = `
      .logo-row { position:absolute; top:${Math.round(inner*0.92)}px; left:${inner}px; display:flex; align-items:center; gap:${Math.round(14*s)}px; }
      .so-logo { width:${logoSize}px; height:${logoSize}px; }
      .date-tag { position:absolute; top:${Math.round(inner*0.95)}px; right:${inner}px; font-size:${dateSize}px; }
      .title { position:absolute; top:${titleTop}px; left:${inner}px; right:${inner}px; font-size:${titleSize}px; letter-spacing:${Math.round(-6*s)}px; }
      .tagline { position:absolute; top:${tagTop}px; left:${inner}px; right:${Math.round(inner*1.5)}px; font-size:${taglineSize}px; line-height:1.3; color:#848484; font-family:'FK Grotesk Trial',sans-serif; letter-spacing:-0.5px; }
      .meta { position:absolute; bottom:${Math.round(inner*1.8)}px; left:${inner}px; font-size:${metaSize}px; line-height:1.7; }
      .collab { position:absolute; bottom:${Math.round(inner*0.92)}px; left:${inner}px; display:flex; align-items:center; gap:${Math.round(16*s)}px; }
      .ch-logo { height:${collabLogoH}px; opacity:0.7; }
      .url { position:absolute; bottom:${Math.round(inner*0.92)}px; right:${inner}px; font-size:${urlSize}px; }
      .guide-l { left:${pad}px; } .guide-r { right:${pad}px; }
      .divider { left:${pad}px; right:${pad}px; }
      .divider-top { top:${pad}px; } .divider-bottom { bottom:${pad}px; }
    `;
  }

  // Resolve background image
  const bgPath = event.background
    ? `file://${path.resolve(ASSETS_DIR, event.background).replace(/ /g, '%20')}`
    : '';
  const bgCSS = bgPath
    ? `.bg-pixels { position:absolute; inset:0; background:url('${bgPath}') center/cover no-repeat; opacity:0.6; }`
    : `.bg-pixels { display:none; }`;

  // Resolve collab logo
  const collabLogoPath = event.collab?.logo
    ? `file://${path.resolve(ASSETS_DIR, event.collab.logo).replace(/ /g, '%20')}`
    : '';

  const fontsDir = FONTS_DIR.replace(/ /g, '%20');

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
    width: ${w}px; height: ${h}px;
    background: #010101; color: #fff;
    overflow: hidden; position: relative;
  }

  ${bgCSS}

  .guide-l, .guide-r {
    position:absolute; top:0; bottom:0; width:1px;
    background:rgba(255,255,255,0.12);
  }
  .divider {
    position:absolute; height:1px;
    background:rgba(255,255,255,0.12);
  }
  .divider::before, .divider::after {
    content:''; position:absolute; top:-1.5px; width:4px; height:4px;
    background:#fff;
  }
  .divider::before { left:-2px; }
  .divider::after  { right:-2px; }

  .display {
    font-family:'FK Grotesk Trial',sans-serif;
    font-weight:400; line-height:0.95; color:#fff;
  }
  .mono {
    font-family:'Proto Mono',monospace;
    color:#fff; letter-spacing:-0.12px;
  }
  .mono-muted {
    font-family:'Proto Mono',monospace;
    color:#848484; letter-spacing:-0.12px;
  }

  .so-logo svg { width:100%; height:100%; display:block; }
  .collab-label { color:#555; }

  ${contentCSS}
</style>
</head>
<body>
  <div class="bg-pixels"></div>
  <div class="guide-l"></div>
  <div class="guide-r"></div>
  <div class="divider divider-top"></div>
  <div class="divider divider-bottom"></div>

  <div class="logo-row">
    <div class="so-logo">${soLogo}</div>
    <span class="mono" style="font-size:${logoTextSize}px; font-weight:400;">smooth operators</span>
  </div>

  ${layout !== 'banner'
    ? `<div class="date-tag mono-muted">${event.date}</div>`
    : `<div class="meta mono-muted">${event.date} &nbsp;·&nbsp; ${event.time}<br>${event.venue}<br>${event.city}</div>`
  }

  <div class="title display">${titleText}</div>
  <div class="tagline">${taglineText}</div>

  ${layout !== 'banner'
    ? `<div class="meta mono-muted">${event.time} &nbsp;·&nbsp; ${event.venue}<br>${event.city}</div>`
    : ''
  }

  ${event.collab ? `
  <div class="collab">
    <span class="collab-label mono-muted" style="font-size:${collabLabelSize}px;">${event.collab.label}</span>
    <img class="ch-logo" src="${collabLogoPath}" alt="${event.collab.name}">
  </div>
  ` : ''}

  <span class="url mono">${event.url}</span>
</body>
</html>`;
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: node render.js <event-slug>');
    console.error('Example: node render.js 2026-04-22-ai-buildathon');
    process.exit(1);
  }

  const event = loadEvent(slug);
  const outDir = path.join(event._dir, 'assets');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();

  for (const format of FORMATS) {
    const html = buildHTML(format, event);
    const tmpFile = path.join(outDir, `_tmp_${format.name}.html`);
    fs.writeFileSync(tmpFile, html);

    const page = await browser.newPage();
    await page.setViewportSize({ width: format.w, height: format.h });
    await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const outFile = path.join(outDir, `${format.name}.png`);
    await page.screenshot({ path: outFile, type: 'png' });
    await page.close();

    fs.unlinkSync(tmpFile);
    console.log(`  ✓ ${format.name} (${format.w}×${format.h})`);
  }

  await browser.close();
  console.log(`\nAll images saved to ${outDir}`);
}

main().catch(err => { console.error(err); process.exit(1); });
