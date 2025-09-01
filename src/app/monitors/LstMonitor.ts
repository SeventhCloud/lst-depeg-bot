import { PrismaClient } from '../../generated/prisma/client';
import { calculateEMA } from '../../utils/formulas';
import { Notifier } from '../notifiers/types';
import { DexPairRequest, DexscreenerService } from '../services/DexscreenerService';
import { Storage } from '../services/storage';

export class LstMonitor {
  // Stores the last observed ratio per pair to detect sudden changes
  private prevRatios = new Map<string, number>();
  
  // Handles database operations for price storage
  private storage = new Storage(new PrismaClient());

  constructor(
    private lstPairs: DexPairRequest[], // List of LST pairs to monitor
    private notifier: Notifier,         // Service to send notifications
    private dexscreener = new DexscreenerService() // Service to fetch live LST data
  ) {}

  // Main method to check all LST pairs
  async check(): Promise<void> {
    for (const lst of this.lstPairs) {
      // Fetch current ratio data for the pair
      const lstData = await this.dexscreener.getLstPair(lst);
      if (!lstData) continue; // Skip if no data returned

      // Persist current price in storage
      await this.storage.savePrice(lstData);

      // Retrieve recent prices to calculate EMA
      const lastPrices = await this.storage.getPrices(lst.pairAddress);
      const priceArray = lastPrices.map(p => p.priceNative);
      const ema = calculateEMA(priceArray, 100); // 100-period EMA

      const ratio = Number(lstData.priceNative); // Current ratio
      const prev = this.prevRatios.get(lst.pairAddress); // Previous ratio

      // Alert if ratio drops below EMA minus threshold
      if (ratio < (ema || 1) - lst.threshold) {
        await this.notifier.notify(
          `⚠️ Depeg Alert: *${lst.symbol}* ratio = ${ratio.toFixed(4)} (< ${(1 - lst.threshold).toFixed(2)})`
        );
      } 
      // Alert if sudden drop (>10%) compared to previous ratio
      else if (prev && ratio < prev * 0.9) {
        await this.notifier.notify(
          `⚠️ Sudden De/PEG: *${lst.symbol}* ratio ${ratio.toFixed(4)} vs prev ${prev.toFixed(4)}`
        );
      } 
      // Otherwise, send normal status
      else {
        console.log(`✅ *${lst.symbol}* ratio = ${ratio.toFixed(4)}, EMA = ${ema?.toFixed(4)}`);
      }

      // Update previous ratio for this pair
      this.prevRatios.set(lst.pairAddress, ratio);
    }
  }
}
