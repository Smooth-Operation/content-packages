# Content formats

Canonical reference for all image formats in a Smooth Operators content package.

## Formats

| Platform | Use | Aspect ratio | Pixels (px) | File name |
|---|---|---|---|---|
| Luma | Event cover | 1:1 | 1200 × 1200 | `luma-1200x1200.png` |
| X / Twitter | In-feed post | 16:9 | 1600 × 900 | `x-post-1600x900.png` |
| X / Twitter | Profile banner | 3:1 | 1500 × 500 | `x-banner-1500x500.png` |
| Instagram | Feed (square) | 1:1 | 1080 × 1080 | `ig-feed-1080x1080.png` |
| Instagram | Feed (portrait) | 4:5 | 1080 × 1350 | `ig-feed-1080x1350.png` |
| Instagram | Story / Reel cover | 9:16 | 1080 × 1920 | `ig-story-1080x1920.png` |
| Telegram | Channel post | 16:9 | 1280 × 720 | `telegram-1280x720.png` |
| Poster | Print (A3) | ~1:1.41 | 2480 × 3508 | `poster-2480x3508.png` |
| Open Graph | Link unfurl | 1.91:1 | 1200 × 630 | `og-1200x630.png` |

## Notes

- All formats are rendered by `scripts/render.js` from a single event config.
- The render script adapts Layout A (title-loud) to each aspect ratio automatically.
- Background images go in `assets/` and are referenced by filename in `event.json`.
- Sponsor/collaborator logos also go in `assets/`.
