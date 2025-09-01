import { LstMonitor } from './app/monitors/LstMonitor';
import { TelegramBot } from './app/notifiers/TelegramBot';
import { Storage } from './app/services/storage';
import { config } from './config';
import { PrismaClient } from './generated/prisma/client';
import { logger } from './infra/logger';
import { Scheduler } from './infra/scheduler';
import poolList from './resources/pool-list';

async function main() {

  const storage = new Storage(new PrismaClient());

  // Initialize the notifier service (Telegram in this case)
  const telegramBot = new TelegramBot(storage);

  // Load the list of LST pairs to monitor
  const lstPairs = poolList;

  // Create the monitor instance with pairs and notifier
  const monitor = new LstMonitor(lstPairs, telegramBot, storage);

  // Create a scheduler to periodically run the monitor.check() function
  // Interval is defined in config (in seconds, converted to ms)
  const scheduler = new Scheduler(
    () => monitor.check(), 
    config.POLL_INTERVAL_SECONDS * 1000
  );

  // Start the scheduled monitoring
  scheduler.start();

  // Log that the monitor has started
  logger.info('🚀 LST Depeg Monitor started (watching Dexscreener Pools specified in pool-list.ts)');
}

// Run the main function and handle any uncaught errors
main().catch(err => {
  console.error(err);
  process.exit(1);
});
