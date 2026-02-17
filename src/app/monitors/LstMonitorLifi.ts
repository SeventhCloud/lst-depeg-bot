import { catchError, concatMap, delay, filter, from, lastValueFrom, of, timer, toArray } from 'rxjs';

import { Notifier } from '../notifiers/types';
import { DexscreenerService } from '../services/DexscreenerService';
import { FairValueService } from '../services/FairValueService';
import { PairStatus, Storage } from '../services/storage';
import escapeMarkdownV2 from '../utils/utils';
import { StorageService } from '../services/SotrageService';
import logger from '../../infra/logger';
import LiFiService from '../services/LiFiService';

export class LstMonitorLifi {

  constructor(
    private storageService: StorageService, // List of LST pairs to monitor
    private notifier: Notifier,         // Service to send notifications
    private storage: Storage, // Service to handle storage
    private liFiService: LiFiService, // Service to fetch live LST data
    private fairValueService = new FairValueService(storageService.getChains())
  ) { }

  // Main method to check all LST pairs
  async check(): Promise<void> {
/* 
    from(this.storageService.getTokenList()).pipe(
      filter(lst => lst.alert), // only check tokens with alert enabled
      concatMap(lst =>
        timer(1000).pipe( // wait 1s before each token to avoid spamming APIs
          concatMap(() => {
            logger.info(`Checking ${lst.symbol} on ${lst.chainName}...`)
            return from(this.liFiService.getQuoteAllChains(lst)).pipe(
              catchError(err => {
                console.error(`Failed to fetch market price for ${lst.symbol} on ${lst.chainName}:`, err);
                return of(null); // skip this token on error
              })
            )
          })
        )
      ) */

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
