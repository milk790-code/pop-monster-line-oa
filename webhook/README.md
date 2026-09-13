# Pop Monster LINE OA Webhook

Cloudflare Worker that handles LINE Messaging API webhook events for the
Pop Monster (泡泡怪獸) Official Account.

> **Reference branch — do not merge or deploy (2026-09-14).** The fan-out below was
> built on the wrong worker. LINE sends the Pop Monster OA's (@150tiznd) events to
> `pop-line-oa` (repo `3q-hatchery-line-oa`), not to this worker, so enabling
> `HARNESS_WEBHOOK_URL` here would relay nothing. To use it, port `fanOutToHarness`
> to pop-line-oa's `/webhook` handler, and only after the downstream has a
> read-only ingest endpoint (see the risks listed below).

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
| `HARNESS_WEBHOOK_URL` | secret (optional) | `wrangler secret put HARNESS_WEBHOOK_URL` — see *Webhook fan-out* below. Unset = off |

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

## Webhook fan-out (second consumer on the same OA)

LINE allows exactly one webhook URL per Official Account. To let a second system
(e.g. the L Harness CRM) see the same events without giving up this worker's
replies, set `HARNESS_WEBHOOK_URL` to that system's webhook endpoint. This worker
then relays each signature-verified payload to it.

**Unset = the feature does not run at all.** Shipping the code is therefore
independent of switching it on; the fan-out only starts when the variable is added.

Guarantees, each verified against a local `wrangler dev` run:

| Situation | Result |
|---|---|
| Downstream healthy | Worker answers LINE `200` in ~66 ms; downstream gets a byte-identical body (SHA-256 match) and a valid signature |
| Downstream unreachable | Worker answers `200` in ~34 ms; failure logged only |
| Downstream hangs | Worker answers `200` in ~87 ms; the relay is aborted at 5 s |
| `HARNESS_WEBHOOK_URL` unset | Byte-for-byte the previous behaviour (`200`/`OK`, bad signature still `401`) |

Why it is safe: the relay runs inside `ctx.waitUntil`, so it is never on the path
of the response LINE waits for, and `fanOutToHarness` never throws — LINE disables
a webhook that stops answering `200`.

Requirements on the downstream:

- It must verify `X-Line-Signature` itself, against **the same channel secret**.
- It must **not** reply to events. A LINE `replyToken` is single-use and belongs
  to this worker; a second replier would make one of the two replies fail.

For L Harness specifically, "does not reply" is a property of its *data*, not a
mode you can switch on. There is no global read-only / dry-run / send-disabled
flag anywhere in that codebase. Nearly every send path is gated on a database
row, so empty tables stay quiet — but "nearly" is doing real work here:

- **Table-driven paths** (`auto_replies`, `scenarios`, `entry_routes`,
  `automations`): empty table → nothing sent. Verified in `routes/webhook.ts`,
  `services/auto-reply.ts`, `services/event-bus.ts`.
- **Seeded exception — ships active.** `bootstrap.sql` and migration
  `067_mileage_keyword_auto_reply.sql` insert a global, active auto-reply on the
  exact keyword `マイル`. Deactivate it to be certain:
  `UPDATE auto_replies SET is_active = 0 WHERE id = 'builtin-mileage-wallet-keyword';`
- **Hard-coded exception — not table-driven at all.** `routes/webhook.ts` replies
  and cross-account-pushes on the literal text `体験を完了する`, bypassing
  `auto_replies` entirely. Narrow (needs that exact string, a registered account
  and a linked `user_id`), but no table can switch it off.
- **`line_account_id IS NULL` matches everything.** `webhook.ts` computes
  `scenarioAccountMatch = !scenario.line_account_id || !lineAccountId || ...`,
  and `event-bus.ts` filters automations with
  `!a.line_account_id || a.line_account_id === lineAccountId || (eventType !== 'tag_change' && !lineAccountId)`.
  So leaving this OA *unregistered* in `line_accounts` does not isolate it — it
  makes **every** unscoped scenario and automation in that database match.
- **Registering it has its own cost.** The worker's cron runs every minute
  (`crons = ["* * * * *", ...]`) and calls `refreshLineAccessTokens`, which
  treats a `NULL` `token_expires_at` as "refresh now" and POSTs
  `client_credentials` to `https://api.line.me/v2/oauth/accessToken`. Whether a
  freshly issued token invalidates the one this worker holds is LINE platform
  behaviour that source code cannot settle — do not find out on an account with
  live customers.
- **Losing the `replyToken` race is not silent.** `event-bus.ts` catches the
  `400 Invalid reply token` and *falls back to* `pushMessage`. A lost race
  therefore becomes a real push to the customer's phone, not a dropped message.
- Creating a `friend_add` scenario in the L Harness admin later **will** make it
  contend for `replyToken` (`pushImmediateFirstStep` replies rather than pushes),
  and `scenarios.ts` inserts with `is_active = 1` — there is no draft state.
  Existing followers are unaffected (LINE only emits `follow` on a new or
  re-added friend); the exposure is new and returning friends.

Verification note: L Harness answers `200 {"status":"ok"}` for a bad signature, a
malformed signature and unparseable JSON alike. **An HTTP 200 from the downstream
proves nothing.** Confirm a relay actually landed by querying its database, or by
watching its log for `Invalid LINE signature` — never by status code.

### Pre-flight before setting `HARNESS_WEBHOOK_URL`

1. `SELECT count(*) FROM auto_replies WHERE is_active = 1;` — expect only the
   `マイル` row, then deactivate it.
2. `SELECT count(*) FROM scenarios WHERE is_active = 1 AND trigger_type = 'friend_add';`
   — must be `0`.
3. `SELECT count(*) FROM automations WHERE is_active = 1;` — must be `0`, or every
   one of them must be scoped to a different `line_account_id` *and* this OA must
   be registered so `lineAccountId` is non-null.
4. Decide the `line_accounts` question deliberately: registered (token refresh
   fires) or unregistered (`NULL` account matching fires). There is no third
   option that avoids both.
5. Point it at a throwaway LINE channel first and confirm zero outbound messages.

## AI fallback details

- Model: `claude-haiku-4-5`
- System prompt: brand voice statement + ~3KB product KB
- `max_tokens: 350`, 8-second `AbortController` timeout
- On failure (timeout, API error, no key) → static fallback text
- Per-reply cost: ~$0.0007 USD (no prompt caching since KB is below 4096-token min)
