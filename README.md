# LST Depeg Monitor

A lightweight bot that monitors Liquidity-Stable Token (LST) pairs for potential depegs and sudden price drops. Alerts are sent via Telegram in real-time. 
Mainly used for detecting arbitrage opportunities.

## Features

- Monitors multiple LST pairs simultaneously.
- Sends alerts for:
  - DePEG 
- Telegram bot integration with command support:
  - `/status` – Show current monitoring status.
  - `/help` – List available commands.
- Lightweight and Docker-ready for easy deployment.

## Setup

### Prerequisites

- Node.js 24+
- npm
- Docker (optional)
- Telegram bot token (create one using [BotFather](https://t.me/BotFather))
- Chat ID to receive alerts
