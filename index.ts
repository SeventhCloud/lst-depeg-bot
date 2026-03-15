import { catchError, concatMap, defer, EMPTY, repeat, timer } from 'rxjs';
import { LstMonitorLifi } from './src/monitors/LstMonitor';
import { TelegramBot } from './src/notifiers/TelegramBot';
import LiFiService from './src/services/LiFiService';
import { StorageService } from './src/services/SotrageService';
import { logger } from './src/infra/logger';


const POLL_INTERVAL_SECONDS = Number(process.env.POLL_INTERVAL_SECONDS);

async function main() {
  const storageService = new StorageService();

  // Initialize the notifier service (Telegram in this case)
  const telegramBot = new TelegramBot(storageService);

  const liFiService = await LiFiService.create(storageService.getChains());
  const lifiMonitor = new LstMonitorLifi(storageService, telegramBot, liFiService);

  const checkingInterval = defer(() => lifiMonitor.check()).pipe(
    catchError(err => {
      console.error('Monitor error:', err);
      return EMPTY; // ignore error and continue
    }),
    concatMap(() => {
      console.log("REPEATING soon")
      return timer(POLL_INTERVAL_SECONDS * 1000)
    }), // wait delayMs before next run
    repeat() // repeat indefinitely
  ).subscribe();

  logger.info('🚀 LST Depeg Monitor started (watching LiFi Pools)');

  const shutdown = async (signal: string) => {
    console.log(`🛑 Received ${signal}, shutting down...`);
    checkingInterval.unsubscribe();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('SIGHUP', shutdown);
}

// Run the main function and handle any uncaught errors
main().catch(err => {
  console.error(err);
  process.exit(1);
});
