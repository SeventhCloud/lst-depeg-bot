import { catchError, concatMap, defer, EMPTY, exhaustMap, interval, lastValueFrom, repeat, timer } from 'rxjs';
import { LstMonitorSmart } from './app/monitors/LstMonitorSmart';
import { TelegramBot } from './app/notifiers/TelegramBot';
import { Storage } from './app/services/storage';
import { config } from './config';
import { PrismaClient } from './generated/prisma/client';
import { logger } from './infra/logger';
import { StorageService } from './app/services/SotrageService';
import LiFiService from './app/services/LiFiService';
import { LstMonitorLifi } from './app/monitors/LstMonitorLifi';

const POLL_INTERVAL_SECONDS = Number(process.env.POLL_INTERVAL_SECONDS);

async function main() {

  const storage = new Storage(new PrismaClient());
  const storageService = new StorageService();

  // Initialize the notifier service (Telegram in this case)
  const telegramBot = new TelegramBot(storage, storageService);

  // Load the list of LST pairs to monitor
  // Create the monitor instance with pairs and notifier
  // const monitor = new LstMonitorSmart(storageService, telegramBot, storage);
  const liFiService = await LiFiService.create(storageService.getChains());
  const lifiMonitor = new LstMonitorLifi(storageService, telegramBot, storage, liFiService);

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

  // start interval-based checks
  // const checkInterval = interval(config.POLL_INTERVAL_SECONDS * 1000)
  //   .pipe(
  //     exhaustMap(() => monitor.check()) // will wait for previous to finish
  //   )
  //   .subscribe({
  //     error: (err) => console.error('Monitoring error:', err)
  //   });

  // Log that the monitor has started
  logger.info('🚀 LST Depeg Monitor started (watching LiFi Pools)');

  const shutdown = async (signal: string) => {
    console.log(`🛑 Received ${signal}, shutting down...`);
    checkingInterval.unsubscribe();
    await storage.shutdown();
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
