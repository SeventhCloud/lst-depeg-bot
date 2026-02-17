import { catchError, concatMap, delay, filter, from, lastValueFrom, of, timer, toArray } from 'rxjs';

import { Notifier } from '../notifiers/types';
import { DexscreenerService } from '../services/DexscreenerService';
import { FairValueService } from '../services/FairValueService';
import { PairStatus, Storage } from '../services/storage';
import escapeMarkdownV2 from '../utils/utils';
import { StorageService } from '../services/SotrageService';
import logger from '../../infra/logger';

export class LstMonitorSmart {

  constructor(
    private storageService: StorageService, // List of LST pairs to monitor
    private notifier: Notifier,         // Service to send notifications
    private storage: Storage, // Service to handle storage
    private dexscreener = new DexscreenerService(), // Service to fetch live LST data
    private fairValueService = new FairValueService(storageService.getChains())
  ) { }

  // Main method to check all LST pairs
  async check(): Promise<void> {

    for (const chain of this.storageService.getChains()) {
      for (const lst of chain.tokens) {
        if (!lst.alert)
          continue

        // Use RxJS to call getLstPair sequentially with 1s delay
        const marketPrices = await lastValueFrom(
          from(lst.pools).pipe(
            concatMap(poolAddress =>
              timer(1000).pipe(   // wait 3s before each request
                concatMap(() => {
                  console.log(`Feching POOL: ${poolAddress}`)
                  return from(this.dexscreener.getLstPair(chain.chainName, poolAddress, lst.symbol)).pipe(
                    catchError(err => {
                      console.error(`Failed to fetch pool ${poolAddress}:`, err);
                      return of(null)
                    })
                  )
                })
              )
            ),
            filter((p) => !!p), // remove null/undefined
            toArray() // collect into an array at the end
          )
        );

        const minDexPair = marketPrices.reduce((min, curr) => {
          if (!min?.priceNative) return curr;
          return (!min?.priceNative) || Number(curr.priceNative) >= Number(min.priceNative) ? curr : min;
        })

        const fairValue = await this.fairValueService.getFairValue(chain, lst);
        logger.info(`Fair value is: ${fairValue}`)
        const minPrice = Number(minDexPair.priceNative);
        if (fairValue - minPrice > lst.threshold) {
          let message = `DePEG Detected\n
          Pool: [DEXScreener Pool](${minDexPair.url}) 
          Price: ${minPrice.toFixed(6)}
          Fair Value: ${fairValue.toFixed(6)}
          DePEG is ${((fairValue - minPrice) * 100).toFixed(4)}%\n
          `;
          await this.notifier.notify(escapeMarkdownV2(message))
        }
      }
    }
  }
}
