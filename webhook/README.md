# Pop Monster LINE OA Webhook

Cloudflare Worker that handles LINE Messaging API webhook events for the
Pop Monster (泡泡怪獸) Official Account.

> **Not the live bot (checked 2026-09-14).** LINE sends the Pop Monster OA's
> (@150tiznd) events to `pop-line-oa` (repo `3q-hatchery-line-oa`), not to this
> worker. Changing this worker changes nothing customers see. The deploy workflow
> will not point LINE back here unless you run it by hand with `take_over_line`.

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
| `ANTHROPIC_API_KEY` | secret | same — no key = AI fallback returns placeholder text; the GitHub deploy refuses to run while it is missing |
| `PNG_BASE_URL` | plain | `wrangler.toml` `[vars]`; the GitHub deploy sets it from `deploy.yml` |

## Deploy

### Via GitHub Actions (recommended)

Push to `main` → `.github/workflows/deploy.yml` runs automatically.

- **Secrets are not sent.** The upload carries the code and `PNG_BASE_URL` only;
  `keep_bindings` keeps every secret from the previous version. Change a worker
  secret with `wrangler secret put` or the dashboard, not in GitHub Secrets.
- **Before uploading** it reads (and stops if it cannot read) the version serving
  traffic, the worker's `configured` flags (token, secret and anthropic must all be
  `true`), and where LINE currently sends the OA's events.
- **After uploading** it fails if those flags changed, and prints the exact
  `npx wrangler rollback <version> --name pop-monster-webhook` to go back.
- **Rich menu and webhook URL** are never touched by a push. On a manual run or after
  *Render PNG assets* they are re-applied only if LINE already sends events to this
  worker. To switch customers to this worker on purpose, run the workflow by hand with
  `take_over_line` ticked. That run first asks LINE to verify this worker and stops
  before switching if it cannot. If it fails after switching, the run summary lists the
  previous webhook URL and default rich menu to put back.
- *Cleanup rich menus + force set default* deletes every other rich menu and changes the
  default menu for every customer. It refuses to run unless LINE sends events to this worker.
- Re-running an **old** run (from before this change) runs the old workflow file,
  which does repoint LINE and re-send secrets. Don't.

Required GitHub Secrets:
- `CF_API_TOKEN`, `CF_ACCOUNT_ID`
- `LINE_CHANNEL_ACCESS_TOKEN` (LINE API calls made by the workflow). It is a token for
  the Pop Monster OA, which pop-line-oa also serves: reissuing the channel's token can
  stop pop-line-oa replying to customers until it gets the new token too.

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

> Not for the Pop Monster OA today: its webhook points at `pop-line-oa`. Setting the URL
> below moves every customer to this worker.

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
