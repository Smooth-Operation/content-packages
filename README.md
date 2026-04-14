# Smooth Operators — Content Packages

Event marketing material for Smooth Operators, rendered from HTML templates using Playwright and the real brand fonts.

## Quick start

```bash
npm install
npx playwright install chromium
node scripts/render.js 2026-04-22-ai-buildathon
```

## Creating material for a new event

1. Create `events/<YYYY-MM-DD-slug>/event.json` (copy from an existing event)
2. Add any collaborator logos to `assets/`
3. Run `node scripts/render.js <slug>`
4. Images appear in `events/<slug>/assets/`

See `CLAUDE.md` for full instructions and the design system reference.

## Formats

All 9 formats are listed in `formats.md`. Covers Luma, X/Twitter, Instagram, Telegram, print poster, and Open Graph.
