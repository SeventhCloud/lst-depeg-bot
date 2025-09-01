import { Telegraf } from 'telegraf';
import { Notifier } from './types';
import { config } from '../../config';
import { logger } from '../../infra/logger';

/**
 * Notifier implementation that sends messages via Telegram.
 */
export class TelegramNotifier implements Notifier {
  private bot: Telegraf;

  constructor() {
    // Initialize the Telegram bot with the token from config
    this.bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
  }

  /**
   * Sends a notification message to a configured Telegram chat.
   * @param message - The message to send (supports Markdown formatting)
   */
  async notify(message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(
        config.TELEGRAM_CHAT_ID, // Target chat ID from config
        message,
        { parse_mode: 'Markdown' } // Enable Markdown formatting
      );
      logger.info(`Sent Telegram alert: ${message}`); // Log success
    } catch (err) {
      logger.error(`Failed to send Telegram message: ${err}`); // Log failure
    }
  }
}
