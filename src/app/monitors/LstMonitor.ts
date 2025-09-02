import { PrismaClient } from '@prisma/client';
import { calculateEMA } from '../../utils/formulas';
import { Notifier } from '../notifiers/types';
import { DexPairRequest, DexscreenerService } from '../services/DexscreenerService';
import { Storage } from '../services/storage';

export class LstMonitor {
  private prevRatios = new Map<string, number>();
  private storage = new Storage(PrismaClient);

  constructor(
    private lstPairs: DexPairRequest[],
    private notifier: Notifier,
    private dexscreener = new DexscreenerService()
  ) {}

  async check(): Promise<void> {
    for (const lst of this.lstPairs) {
      const lstData = await this.dexscreener.getLstRatio(lst);
      if (!lstData) continue;

      await this.storage.savePrice(lstData);

      const lastPrices = await this.storage.getPrices(lst.pairAddress);
      const priceArray = lastPrices.map(p => p.priceNative);
      const ema = calculateEMA(priceArray, 100);

      const ratio = Number(lstData.priceNative);
      const prev = this.prevRatios.get(lst.pairAddress);

      if (ratio < (ema || 1) - lst.threshold) {
        await this.notifier.notify(
          `⚠️ Depeg Alert: *${lst.symbol}* ratio = ${ratio.toFixed(4)} (< ${(1 - lst.threshold).toFixed(2)})`
        );
      } else if (prev && ratio < prev * 0.9) {
        await this.notifier.notify(
          `⚠️ Sudden De/PEG: *${lst.symbol}* ratio ${ratio.toFixed(4)} vs prev ${prev.toFixed(4)}`
        );
      } else {
        await this.notifier.notify(`✅ *${lst.symbol}* ratio = ${ratio.toFixed(4)}`);
      }

      this.prevRatios.set(lst.pairAddress, ratio); // I'm using the pair address for the HashMap key. As one symbol can have multiple pools (wstEth for example)
    }
  }
}
