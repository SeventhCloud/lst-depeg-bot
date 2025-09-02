import axios from 'axios';

export class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async getPrices(ids: string[], vsCurrency = 'usd'): Promise<Record<string, number>> {
    const url = `${this.baseUrl}/simple/price`;
    const res = await axios.get(url, { params: { ids: ids.join(','), vs_currencies: vsCurrency } });
    return Object.fromEntries(
      Object.entries(res.data).map(([id, data]) => [id, (data as any)[vsCurrency]])
    );
  }
}
