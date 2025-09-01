import { calculateEMA } from '../../utils/formulas';
import { Notifier } from '../notifiers/types';
import { DexPairRequest, DexscreenerService } from '../services/DexscreenerService';
import { PairStatus, Storage } from '../services/storage';

export class LstMonitor {
  // Stores the last observed ratio per pair to detect sudden changes
  private prevRatios = new Map<string, number>();

  constructor(
    private lstPairs: DexPairRequest[], // List of LST pairs to monitor
    private notifier: Notifier,         // Service to send notifications
    private storage: Storage, // Service to handle storage
    private dexscreener = new DexscreenerService() // Service to fetch live LST data
  ) { }

  // Main method to check all LST pairs
  async check(): Promise<void> {
    const statusSnapshot: PairStatus[] = [];

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

      let message = "";

      // Alert if ratio drops below EMA minus threshold
      if (ratio < (ema || 1) - lst.threshold) {
        message = `⚠️ Depeg Alert: *${lst.symbol}* ratio = ${ratio.toFixed(4)} (< ${(1 - lst.threshold).toFixed(2)})`;
        await this.notifier.notify(message);
      }
      // Alert if sudden drop (>10%) compared to previous ratio
      else if (prev && ratio < prev * 0.9) {
        message = `⚠️ Sudden De/PEG: *${lst.symbol}* ratio ${ratio.toFixed(4)} vs prev ${prev.toFixed(4)}`;
        await this.notifier.notify(message);
      }

      // Update previous ratio for this pair
      this.prevRatios.set(lst.pairAddress, ratio);

      statusSnapshot.push({
        symbol: lst.symbol,
        pairAddress: lst.pairAddress,
        ratio,
        ema,
        lastAlert: message
      });
    }

    // update Status
    this.storage.setStatus(statusSnapshot);
  }
}
