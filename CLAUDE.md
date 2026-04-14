# Content Packages — Claude Code instructions

This repo creates event marketing material for Smooth Operators. All images are rendered from HTML templates via Playwright, using the real brand fonts and design system.

## Brand identity

- Background: `#010101`
- Text: `#ffffff`
- Muted text: `#848484`
- Borders/guides: `rgba(255,255,255,0.12)`
- Display font: FK Grotesk Trial (Regular 400) — used for event titles, hero text
- Mono font: Proto Mono (Light 300, Regular 400, SemiBold 600) — used for metadata, labels, URLs
- Corner pixels: 4px × 4px white squares at guide line intersections
- Guide lines: 1px vertical rules inset from edges
- Brand voice: direct, plain, confident. No superlatives, no filler. See the LandingPage repo's DESIGN_SYSTEM.md for the full copy guidelines.

## How to create material for a new event

### 1. Create the event folder

```
events/<YYYY-MM-DD-event-slug>/
├── event.json
└── assets/          ← rendered images go here
```

### 2. Write event.json

Copy from an existing event and modify. Required fields:

```json
{
  "slug": "YYYY-MM-DD-event-name",
  "title": "Event\nTitle.",
  "titleOneline": "Event Title.",
  "tagline": "A short tagline\nfor the event.",
  "taglineOneline": "A short tagline for the event.",
  "date": "DD.MM.YYYY",
  "time": "HH:MM",
  "venue": "Venue Name",
  "city": "City, Malta",
  "url": "smoothoperators.dev",
  "collab": {
    "label": "in collaboration with",
    "name": "Partner Name",
    "logo": "partner-logo.jpg"
  },
  "background": "hero-bg.jpg"
}
```

- `title` uses `\n` for line breaks in square/tall formats. `titleOneline` is for landscape/banner formats.
- Same for `tagline` / `taglineOneline`.
- Title should end with a period (brand style: "AI Buildathon." not "AI Buildathon").
- `collab` is optional. Omit the entire key if there's no collaborator.
- `collab.logo` filename should be placed in the repo's `assets/` directory.
- `background` references a file in `assets/`. Use `hero-bg.jpg` (the pixel particle texture from the website) unless the event needs something different.

### 3. Render all formats

```bash
npm install              # first time only
npx playwright install chromium  # first time only
node scripts/render.js <event-slug>
```

This generates 9 images in `events/<slug>/assets/`:
- `luma-1200x1200.png` (1:1)
- `x-post-1600x900.png` (16:9)
- `x-banner-1500x500.png` (3:1)
- `ig-feed-1080x1080.png` (1:1)
- `ig-feed-1080x1350.png` (4:5)
- `ig-story-1080x1920.png` (9:16)
- `telegram-1280x720.png` (16:9)
- `poster-2480x3508.png` (~1:1.41, A3 print)
- `og-1200x630.png` (1.91:1)

See `formats.md` for the full format reference.

### 4. Review the output

Open the generated PNGs and verify they look correct. Check:
- Fonts are rendering (not falling back to system fonts)
- Guide lines and corner pixels are visible
- Text isn't overflowing or clipping at any aspect ratio
- Collaborator logo is visible and properly sized
- Background image is present at correct opacity

## Repo structure

```
content-packages/
├── CLAUDE.md          ← you are here
├── formats.md         ← canonical aspect ratio reference
├── assets/            ← shared brand assets (logos, backgrounds)
├── brand/
│   └── x-banner/      ← permanent X profile banner (not event-specific)
├── events/
│   └── <slug>/
│       ├── event.json ← event config
│       └── assets/    ← rendered images
├── fonts/             ← brand fonts (FK Grotesk Trial, Proto Mono)
└── scripts/
    └── render.js      ← Playwright render script
```

## Modifying the design

The layout is defined in `scripts/render.js` in the `buildHTML()` function. It uses Layout A (title-loud): big event title as hero, tagline below, metadata at bottom, logos at top and bottom.

The script adapts this layout to 5 layout types:
- `square` — 1:1 formats (Luma, IG feed square)
- `landscape` — 16:9 formats (X post, Telegram)
- `banner` — ultra-wide formats (X banner 3:1, OG 1.91:1)
- `portrait` — 4:5 format (IG feed portrait)
- `story` / `poster` — tall formats (IG story 9:16, A3 poster)

To change spacing, font sizes, or element positions, edit the layout-specific CSS blocks in `buildHTML()`.

## Adding a new format

Add an entry to the `FORMATS` array in `scripts/render.js`:

```js
{ name: 'platform-WIDTHxHEIGHT', w: WIDTH, h: HEIGHT, layout: 'square|landscape|banner|portrait|story|poster' }
```

Pick the `layout` type that best matches the aspect ratio. Also add it to `formats.md`.
