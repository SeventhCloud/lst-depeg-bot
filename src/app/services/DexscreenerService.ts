import axios from 'axios';
import { DexscreenerResponse, DexPair } from './types';

export type DexPairRequest = {
  chainId: string;
  pairAddress: string;
  symbol: string; // e.g. "wstETH"
  threshold: number;
};

export class DexscreenerService {
  private baseUrl = 'https://api.dexscreener.com/latest/dex/pairs';

  async getLstRatio(pair: DexPairRequest): Promise<DexPair | null> {
    try {
      const url = `${this.baseUrl}/${pair.chainId}/${pair.pairAddress}`;
      const res = await axios.get<DexscreenerResponse>(url);
      const data = res.data;
      if (!data) return null;
      
      return data.pair;
    } catch (err) {
      console.error(`Dexscreener API error for ${pair.symbol}:`, err);
      return null;
    }
  }
}
