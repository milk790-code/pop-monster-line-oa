# Pop Monster LINE OA Webhook

Cloudflare Worker that handles LINE Messaging API webhook events for the
Pop Monster (泡泡怪獸) Official Account.

## Behavior

| LINE event | Worker response |
|---|---|
| `follow` (new friend) | Welcome card image + welcome text |
| `message` text matching a keyword | Canned reply (+ carousel for `產品`/`你好`) |
| `message` text not matching | AI fallback via Claude Haiku 4.5 + product KB |
| `postback` (rich menu tap) | Routes through keyword matcher |
| Other events | Ignored |

## Environment variables

| Name | Type | Where |
|---|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | secret | `wrangler secret put` or dashboard "Secrets" |
| `LINE_CHANNEL_SECRET` | secret | same |
| `ANTHROPIC_API_KEY` | secret (optional) | same — no key = AI fallback returns placeholder text |
| `PNG_BASE_URL` | plain | `wrangler.toml` `[vars]` or dashboard "Variables" |

## Deploy

### Via GitHub Actions (recommended)

Push to `main` → `.github/workflows/deploy.yml` runs automatically.
Required GitHub Secrets:
- `CF_API_TOKEN`, `CF_ACCOUNT_ID`
- `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`
- `ANTHROPIC_API_KEY` (optional)

### Via Wrangler (local)

```bash
cd webhook
npx wrangler login                                     # one-time
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put ANTHROPIC_API_KEY              # optional
npx wrangler deploy
```

## Configure LINE

In LINE Developers Console → your channel → Messaging API tab:

- Webhook URL: `https://pop-monster-webhook.<subdomain>.workers.dev`
- Use webhook: **ON**
- "Verify" button: should return 200
- Disable "Auto-reply messages" (Worker handles all replies)
- Disable "Greeting messages" (Worker's follow event handles welcome)

## Test

- Add the bot as a friend → receive welcome image + welcome text
- Send `鍍膜` → receive Angel Coating Guard spec
- Send `產品` → receive catalog text + carousel of 4 cards
- Send `我的車烤漆有刮痕，鍍膜能掩蓋嗎？` (no keyword match) → AI fallback reply

## Signature verification

The worker rejects requests without a valid `X-Line-Signature` header.
Signature = `base64(hmac-sha256(channelSecret, requestBody))`.

## AI fallback details

- Model: `claude-haiku-4-5`
- System prompt: brand voice statement + ~3KB product KB
- `max_tokens: 350`, 8-second `AbortController` timeout
- On failure (timeout, API error, no key) → static fallback text
- Per-reply cost: ~$0.0007 USD (no prompt caching since KB is below 4096-token min)
