import { Telegraf } from 'telegraf';
import { Notifier } from './types';
import { config } from '../../config';
import { logger } from '../../infra/logger';

export class TelegramNotifier implements Notifier {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
  }

  async notify(message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(config.TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
      logger.info(`Sent Telegram alert: ${message}`);
    } catch (err) {
      logger.error(`Failed to send Telegram message: ${err}`);
    }
  }
}
