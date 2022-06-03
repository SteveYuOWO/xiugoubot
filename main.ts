import Big from "big.js";
import { client } from "./client";
import DingtalkBot from "./dingtalk-bot";

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

export async function fetchAbnormalTokens() {
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
  const abnormalTokens = await fetchAbnormalTokens();

  await Promise.all(
    abnormalTokens.map(
      async (token) =>
        await DingtalkBot.sendText(
          [
            `异常币种监测`,
            `币种: ${token.symbol}`,
            `资金费率: ${token.fundingRatePercent}`,
            `标记价格: ${token.markPrice}`,
          ].join("\n")
        )
    )
  );
}
