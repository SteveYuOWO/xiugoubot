import Big from "big.js";
import { client } from "./client";

async function thresholdFuturesMarkPrice(threshold = 0.1) {
  const futureMarkPrices = await client.futuresMarkPrice();
  futureMarkPrices.sort((a, b) =>
    Big(a.lastFundingRate).minus(b.lastFundingRate).toNumber()
  );
  return futureMarkPrices
    .map((a) => ({
      symbol: a.symbol,
      fundingRatePercent: Big(a.lastFundingRate).times(100).toNumber(),
      markPrice: a.markPrice,
    }))
    .filter((a) => Math.abs(a.fundingRatePercent) > threshold);
}

export async function thresholdFuturesDailyStatses(symbols: string[]) {
  return await Promise.all(
    symbols.map(async (symbol) => {
      const futuresDailyStas = await client.futuresDailyStats({ symbol });
      return Array.isArray(futuresDailyStas)
        ? futuresDailyStas[0]
        : futuresDailyStas;
    })
  );
}

export async function fetchAbnormalToken() {
  // funding rate less than 0.1 %
  const thresholdMarkPrice = await thresholdFuturesMarkPrice();

  // futures daily statses
  const thresholdDailyStats = await thresholdFuturesDailyStatses(
    thresholdMarkPrice.map((a) => a.symbol)
  );

  // daily bump less than 1%
  const resultSymbol = thresholdDailyStats
    .filter((a) => Big(a.priceChangePercent).abs().lt(1))
    .map((a) => a.symbol);

  return resultSymbol.map((symbol) => {
    const a = thresholdMarkPrice.find((a) => a.symbol === symbol)!;
    return a;
  });
}

export async function runApp() {
  const result = await fetchAbnormalToken();
  console.log(result);
}
