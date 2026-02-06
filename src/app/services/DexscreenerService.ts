import axios from 'axios';
import { DexscreenerResponse, DexPair } from './types';

export class DexscreenerService {
  private baseUrl = 'https://api.dexscreener.com/latest/dex/pairs'; // API endpoint

  /**
   * Fetches the latest ratio and data for a specific pair from Dexscreener
   * @param pair - The pair to fetch data for
   * @returns DexPair data or null if fetch fails
   */
  async getLstPair(chainName: string, poolAdress: string, symbol: string): Promise<DexPair | null> {
    const url = `${this.baseUrl}/${chainName}/${poolAdress}`; // Construct API URL
    const res = await axios.get<DexscreenerResponse>(url);             // Fetch data
    const data = res.data;
    if (!data?.pairs) throw Error("Got Empty Pool Info");               // Return null if no data
    return data.pair;                                                   // Return the pair object

  }
}
