import { session, Telegraf } from 'telegraf';
import { Stage, WizardContext } from 'telegraf/scenes';
import { logger } from '../../infra/logger';
import { StorageService } from '../services/SotrageService';
import { Storage } from '../services/storage';
import monitorWizard from './scenes/monitorWizard';
import thresholdWizard from './scenes/thresholdWizard';

export class TelegramBot {
  private bot: Telegraf<WizardContext>;
  private allowedUsers: Set<string> = new Set();

  constructor(private storage: Storage, private storageService: StorageService) {
    this.bot = new Telegraf<WizardContext>(process.env.TELEGRAM_BOT_TOKEN!);
    this.allowedUsers = new Set(
      process.env.ALLOWED_USER_IDS?.trim().split(",") || []
    ); // store your ID in env


    this.bot.use(async (ctx, next) => {
      if (!ctx.from) return; // ignore system updates
      if (!this.allowedUsers.has(ctx.from.id.toString())) {
        console.log(
          `Blocked message from ${ctx.from.username} (${ctx.from.id})`
        );
        return; // 🚫 stop processing for other users
      }
      return next(); // ✅ continue for you
    });

    const scenes = new Stage([
      monitorWizard(this.storageService),
      thresholdWizard(this.storageService)
    ]);
    this.bot.use(session()); // Required for scenes
    this.bot.use(scenes.middleware());
    this.setupCommands();

  }

  async notify(message: string): Promise<void> {
    try {
      const allowedUsers = Array.from(this.allowedUsers.values());
      await this.bot.telegram.sendMessage(allowedUsers[0], message, { parse_mode: 'MarkdownV2' });
      logger.info(`Sent Telegram alert: ${message}`);
    } catch (err) {
      logger.error(`Failed to send Telegram message: ${err}`);
    }
  }

  setupCommands() {
    this.bot.start(ctx => ctx.reply('👋 LST Depeg Monitor is running.'));

    // Monitor command
    this.bot.command('monitor', async ctx => {
      return ctx.scene.enter("monitor-wizard", {
        tokenList: this.storageService.getTokenList(),
      });
    });

    // Threshold command
    this.bot.command('threshold', async ctx => {
      return ctx.scene.enter("threshold-wizard", {
        tokenList: this.storageService.getTokenList(),
      });
    });

    // Status command
    this.bot.command('status', async ctx => {
      const status = this.storage.getStatus();
      if (!status.length) return ctx.reply('No data yet. Wait until first check runs.');
      const msg = status.map(s => `*${s.symbol}*: ratio=${s.ratio.toFixed(4)}, EMA=${s.ema?.toFixed(4) ?? 'n/a'}`).join('\n');
      await ctx.reply(msg, { parse_mode: 'Markdown' });
    });

    this.bot.command('help', ctx => {
      ctx.reply('Available commands:\n/start - Greet\n/status - Show monitor status\n/monitor - Monitor an LST token\n/help - Show this help');
    });


    this.bot.launch().then(() => logger.info('Telegram bot listening for commands...'));
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}
