import { LstMonitor } from './app/monitors/LstMonitor';
import { TelegramNotifier } from './app/notifiers/TelegramNotifier';
import { config } from './config';
import { logger } from './infra/logger';
import { Scheduler } from './infra/scheduler';
import poolList from './resources/pool-list';

async function main() {
  const notifier = new TelegramNotifier();

  const lstPairs = poolList;

  const monitor = new LstMonitor(lstPairs, notifier);
  const scheduler = new Scheduler(() => monitor.check(), config.POLL_INTERVAL_SECONDS * 1000);

  scheduler.start();
  logger.info('🚀 LST Depeg Monitor started (Dexscreener, direct WETH pairs)');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
