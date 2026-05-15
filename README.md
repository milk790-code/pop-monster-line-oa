# Pop Monster · LINE OA

LINE Official Account for **Pop Monster (泡泡怪獸)** — Taiwan car-care DIY brand.

Architecture cloned from `3q-hatchery-line-oa` (the editorial-design template
that's been live and stable). This repo adapts:

- 13 keyword groups for Pop Monster's 5-product catalog
- Claude Haiku 4.5 AI fallback for unmatched questions
- Same Cloudflare Worker + GitHub Actions render+deploy pipeline

## What ships

- **Worker**: `https://pop-monster-webhook.milk790.workers.dev` (after deploy)
- **Pages assets**: `https://milk790-code.github.io/pop-monster-line-oa/assets/exports/`
- **OA**: Pop Monster · 泡泡怪獸 (LINE basic ID assigned at registration time)

## Repo layout

```
.
├── webhook/                  Cloudflare Worker (LINE webhook + AI fallback)
├── ui_kits/line_oa/          JSX components + HTML export pages
├── scripts/render-pngs.mjs   Playwright-driven PNG rendering
├── assets/                   Photography SVGs (placeholder) + icons + exports
├── .github/workflows/        Render, deploy, healthcheck, cleanup, inspect
└── colors_and_type.css       Editorial design tokens (shared with 3Q)
```

## Phase 0 — One-time setup (before first deploy)

Steps the user (account owner) does manually:

1. **Register LINE OA**
   - https://account.line.biz/login → create Pop Monster business account
   - LINE Developers Console → create Messaging API channel
   - Collect: **Channel ID**, **Channel Secret**, **long-lived Channel Access Token**

2. **GitHub repo**
   - Create empty repo `pop-monster-line-oa` under your GitHub account
   - Push this codebase to it

3. **GitHub Actions secrets** — Settings → Secrets and variables → Actions:
   - `CF_API_TOKEN` (Cloudflare API token, same as 3Q if sharing account)
   - `CF_ACCOUNT_ID` (Cloudflare account ID, same as 3Q)
   - `LINE_CHANNEL_ACCESS_TOKEN` (new, from step 1)
   - `LINE_CHANNEL_SECRET` (new, from step 1)
   - `ANTHROPIC_API_KEY` (optional but recommended; sign up at https://console.anthropic.com)

4. **GitHub Pages**: Settings → Pages → Source = `main` branch, root → save (serves `assets/exports/*.png` for the Worker to reference).

## Phase 1 — Deploy

Push to `main`. Three workflows fire automatically:

1. **Render PNG assets** — Playwright renders all 9 export HTMLs to `assets/exports/*.png`, compresses richmenu to JPEG
2. **Deploy Pop Monster LINE OA** — chains from render: uploads Worker, creates rich menu, uploads binary, sets default, configures webhook URL
3. **Daily healthcheck** — cron pings Worker daily

## Phase 1 — Post-deploy manual steps

Things LINE has no API for:

1. **LINE Developers Console** → your channel → Messaging API tab:
   - Auto-reply messages: **OFF**
   - Greeting messages: **OFF**
   - Use webhook: **ON**
2. **LINE OA Manager** → Account Settings → Basic settings:
   - Upload Avatar from `assets/exports/pop-monster-avatar-640.png`
   - Upload Cover from `assets/exports/pop-monster-cover-bowl-1080x878.png`
3. **Self-test** (in LINE app):
   - Add bot as friend → welcome card + text
   - Send `鍍膜` → Angel Coating Guard spec + Shopee link
   - Send `產品` → catalog text + 4-card carousel
   - Send `我的車烤漆有刮痕，鍍膜能掩蓋嗎？` (no keyword match) → AI fallback reply

## Phase 1.5 — Brand asset swap (when you're ready)

Edit `ui_kits/line_oa/LineSpecs.js` + replace `assets/photography/*.svg` with real product photos. Push to `main`. The render pipeline auto-refreshes everything.

## Worker behavior summary

| Event | Response |
|---|---|
| `follow` | Welcome card image + welcome text |
| `message` matching one of 13 keyword groups | Canned reply (+ carousel for greet/catalog) |
| `message` not matching | **Claude Haiku 4.5 AI fallback** with product KB |
| `postback` (rich menu tap) | Routes through keyword matcher |
| Invalid LINE signature | HTTP 401 |

Webhook lives at `webhook/worker.js`. Full env var list in `webhook/README.md`.

## Cost estimate

- LINE Messaging API: free tier 500 msg/month
- Cloudflare Workers: free tier 100K req/day (we'll see ~50/day)
- GitHub Actions: free for public repos
- Anthropic Haiku 4.5: ~$0.0007 per AI fallback reply. Recommend setting a $5/month spend cap at console.anthropic.com.

## Reference design

The visual style (editorial-Dior, charcoal/cream/gold) is intentionally borrowed from `3q-hatchery-line-oa` as a Phase 1 placeholder. Real Pop Monster brand assets swap in via Phase 1.5.
