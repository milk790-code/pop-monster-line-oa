# LINE OA UI Kit

The five core LINE Official Account surfaces for Pop Monster, rendered to spec:

| File | Surface | Spec |
|---|---|---|
| `Avatar.jsx` | Profile avatar | 640×640, circle-cropped, POP / MONSTER wordmark |
| `CoverImage.jsx` | Account cover | 1080×878, 60/40 split (photo / type) |
| `RichMenu.jsx` | Rich menu | 2500×1686, hero band + 4-CTA grid |
| `WelcomeCard.jsx` | Welcome card | 1040×1040, top photo / bottom type |
| `Carousel.jsx` | Push carousel | 1040×1040, 4 product cards, locked color-grade |

Plus `LineChrome.jsx` — a small approximation of the LINE chat frame for situating the assets in context.

`index.html` is an interactive walkthrough: start in the chat, tap the avatar to see it large, tap the menu to expand the Rich Menu, scroll the carousel.

`_exports-index.html` is the asset export hub — open each export HTML to render and download the PNG.

## Phase 1 placeholder note

The visual layer reuses the 3Q editorial design tokens (charcoal + cream + gold accent, Cormorant Garamond serif) as a placeholder. Pop Monster brand copy (product names, voice, CTAs) is real. Phase 1.5 swaps in:
- Real Pop Monster logo
- Brand color hex codes
- Real product photography (replaces `assets/photography/*.svg`)
