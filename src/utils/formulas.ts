/**
 * Calculates the Exponential Moving Average (EMA) for a series of prices.
 * EMA gives more weight to recent prices, making it more responsive than a simple moving average.
 *
 * @param prices - Array of price numbers
 * @param period - Number of periods to calculate the EMA over
 * @returns The EMA value
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0; // Not enough data to calculate EMA

  const k = 2 / (period + 1); // Smoothing factor: more recent prices get higher weight
  let ema = prices[0];        // Initialize EMA with the first price

  // Iterate over the rest of the prices to compute EMA
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k); // EMA formula: weighted combination of current price and previous EMA
  }

  return ema;
}
