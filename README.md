# LST Depeg Monitor

A lightweight bot that monitors Liquidity-Stable Token (LST) pairs on Dexscreener for potential depegs and sudden price drops. Alerts are sent via Telegram in real-time. Mainly used for detecting arbitrage opportunities.

---

## Features

- Monitors multiple LST pairs simultaneously.
- Calculates 100-period EMA to detect depegs.
- Sends alerts for:
  - Ratio dropping below EMA minus threshold.
  - Sudden price drops (>10%) compared to previous check.
- Historical price storage using SQLite.
- Telegram bot integration with command support:
  - `/status` – Show current monitoring status.
  - `/start` – Greet user and confirm bot is running.
  - `/help` – List available commands.
- Lightweight and Docker-ready for easy deployment.

---

## Setup

### Prerequisites

- Node.js 24+
- npm
- Docker (optional)
- Telegram bot token (create one using [BotFather](https://t.me/BotFather))
- Chat ID to receive alerts

### Environment Variables

Create a `.env` file in the project root:

```env
TELEGRAM_BOT_TOKEN=<your_bot_token>
TELEGRAM_CHAT_ID=<your_chat_id>
LOG_LEVEL=info
POLL_INTERVAL_SECONDS=60
DATABASE_URL=file:./prisma/dev.db
