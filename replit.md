# Telegram Auto Reaction Bot

A Telegram bot that automatically reacts to messages in channels, groups, and private chats with configurable emojis.

## Run & Operate

- Workflows start automatically — API server on port 8080, frontend on port 19642
- `pnpm --filter @workspace/api-server run dev` — run the API server manually
- `pnpm run typecheck` — full typecheck across all packages
- Webhook is registered at: `https://<REPLIT_DOMAIN>/api/bot/webhook`
- To re-register the webhook after deploy: `curl "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=https://<domain>/api/bot/webhook"`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (artifacts/api-server)
- Frontend: Vite + React (artifacts/auto-reaction-bot) — landing page
- Bot logic: artifacts/api-server/src/lib/ (telegram-bot-api.ts, bot-handler.ts, bot-helpers.ts)
- No database needed

## Where things live

- Bot webhook handler: `artifacts/api-server/src/routes/bot.ts`
- Telegram API wrapper: `artifacts/api-server/src/lib/telegram-bot-api.ts`
- Bot update logic: `artifacts/api-server/src/lib/bot-handler.ts`
- Helper utilities: `artifacts/api-server/src/lib/bot-helpers.ts`
- Landing page: `artifacts/auto-reaction-bot/src/pages/home.tsx`

## Architecture decisions

- Bot uses webhook mode (not polling) — Telegram POSTs updates to `/api/bot/webhook`
- The frontend is a simple React landing page matching the original HTML from the Vercel import
- Bot config (token, emoji list, restricted chats) is loaded from env vars at startup
- No database — the bot is stateless; all state lives in Telegram

## Product

- Automatically reacts to messages in any Telegram channel, group, or private chat the bot is added to
- Configurable emoji set via `EMOJI_LIST` environment variable
- Adjustable randomness for group reactions via `RANDOM_LEVEL` (0–10)
- Supports `/start`, `/reactions`, and `/donate` commands
- Accepts Telegram Stars donations via `/donate`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After deploying to production, re-register the webhook with the new production domain
- `RANDOM_LEVEL` is optional (defaults to 0 = always react in groups). Higher = less frequent reactions
- `RESTRICTED_CHATS` is optional — comma-separated chat IDs where the bot should NOT react
- The bot returns HTTP 200 to Telegram even on errors (required by Telegram webhook protocol)

## Required secrets

- `BOT_TOKEN` — Telegram bot token from BotFather
- `BOT_USERNAME` — Bot username without @ (e.g. MyReactionBot)
- `EMOJI_LIST` — String of emojis to react with (e.g. 👍❤️🔥)
- `RESTRICTED_CHATS` — (optional) Comma-separated chat IDs to skip
- `RANDOM_LEVEL` — (optional) 0–10, controls group reaction frequency

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
