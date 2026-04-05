
import logger from '../infra/logger';
import { FairValueService } from '../services/FairValueService';
import LiFiService from '../services/LiFiService';
import { StorageService } from '../services/SotrageService';
import escapeMarkdownV2 from '../utils/utils';
import type { Notifier } from './Notifier';

export class LstMonitorLifi {

  constructor(
    private storageService: StorageService, // List of LST pairs to monitor
    private notifier: Notifier,         // Service to send notifications
    private liFiService: LiFiService, // Service to fetch live LST data
    private fairValueService = new FairValueService(storageService.getChains())
  ) { }

  // Main method to check all LST pairs
  async check(): Promise<void> {

    for (const lst of this.storageService.getTokenList()) {
      if (!lst.alert)
        continue

      const marketPrice = await this.liFiService.getQuoteAllChains(lst);
      if (!marketPrice) {
        logger.warn(`No market price found for ${lst.symbol} on any chain, skipping...`)
        continue
      }
      const minPrice = Number(marketPrice.estimate.toAmount);
      logger.info(`Current price for ${lst.symbol} is ${minPrice} ${lst.chainName}`)
      const fairValue = await this.fairValueService.getFairValue(lst);

      if (!fairValue) {
        logger.warn(`No fair value found for ${lst.symbol} on ${lst.chainName}, skipping...`)
        continue
      }
      
      logger.info(`Fair value is: ${fairValue}`)
      if (fairValue - minPrice > lst.threshold) {
        let message = `DePEG Detected\n
          Pool: [DEXScreener Pool](---) 
          Price: ${minPrice.toFixed(6)}
          Fair Value: ${fairValue.toFixed(6)}
          DePEG is ${((fairValue - minPrice) * 100).toFixed(4)}%\n
          `;
        await this.notifier.notify(escapeMarkdownV2(message))
      }
    }
  }
}
