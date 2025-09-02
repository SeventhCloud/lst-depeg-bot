import { Telegraf } from 'telegraf';
import { Notifier } from './types';
import { config } from '../../config';
import { logger } from '../../infra/logger';
import { Storage } from '../services/storage';

/**
 * Notifier implementation that sends messages via Telegram.
*/
export class TelegramBot implements Notifier {
  allowedChats: number[] = [Number(config.TELEGRAM_CHAT_ID)]; // replace with your own chat id
  private bot: Telegraf;

  constructor(private storage: Storage) {

    this.bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

    // Middleware runs for every incoming update -> check if chat is allowed Important for security. Ignore all other users
    this.bot.use((ctx, next) => {
      if (!this.allowedChats.includes(ctx.chat?.id ?? 0)) {
        console.log(`Blocked unauthorized chat: ${ctx.chat?.id}`);
        return; // Stop processing this update
      }
      return next(); // continue to next middleware/handler
    });

    // Register command handlers
    this.bot.start((ctx) => ctx.reply('👋 LST Depeg Monitor is running.'));

    this.bot.command('status', async (ctx) => {

      const status = this.storage.getStatus();
      if (!status.length) {
        return ctx.reply('No data yet. Wait until first check runs.');
      }
      const msg = status.map(s =>
        `*${s.symbol}*: ratio=${s.ratio.toFixed(4)}, EMA=${s.ema?.toFixed(4) ?? 'n/a'}`
      ).join('\n');

      await ctx.reply(msg, { parse_mode: 'Markdown' });
    });

    this.bot.command('help', (ctx) => {
      ctx.reply('Available commands:\n/start - Greet\n/status - Show monitor status\n/help - Show this help');
    });

    // Start listening
    this.bot.launch().then(() => {
      logger.info('Telegram bot listening for commands...');
    });

    // Graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
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
