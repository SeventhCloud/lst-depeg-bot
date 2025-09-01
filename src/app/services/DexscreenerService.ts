import axios from 'axios';
import { DexscreenerResponse, DexPair } from './types';

// Request format for monitoring a DEX pair
export type DexPairRequest = {
  chainId: string;      // Blockchain network ID
  pairAddress: string;  // Token pair contract address
  symbol: string;       // Symbol for the pair (e.g., "wstETH")
  threshold: number;    // Threshold for alerts
};

export class DexscreenerService {
  private baseUrl = 'https://api.dexscreener.com/latest/dex/pairs'; // API endpoint

  /**
   * Fetches the latest ratio and data for a specific pair from Dexscreener
   * @param pair - The pair to fetch data for
   * @returns DexPair data or null if fetch fails
   */
  async getLstPair(pair: DexPairRequest): Promise<DexPair | null> {
    try {
      const url = `${this.baseUrl}/${pair.chainId}/${pair.pairAddress}`; // Construct API URL
      const res = await axios.get<DexscreenerResponse>(url);             // Fetch data
      const data = res.data;
      if (!data) return null;                                             // Return null if no data
      
      return data.pair;                                                   // Return the pair object
    } catch (err) {
      console.error(`Dexscreener API error for ${pair.symbol}:`, err);    // Log errors
      return null;                                                        // Return null on failure
    }
  }
}
