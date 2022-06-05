import Big from "big.js";
import { client } from "./client";
import DingtalkBot from "./dingtalk-bot";
import dayjs from "dayjs";

async function fetchSpotFuturePairs() {
  const [spotPrices, futurePrices] = await Promise.all([
    client.prices(),
    client.futuresPrices(),
  ]);

  const symbols = Object.keys(futurePrices).filter((symbol) =>
    symbol.endsWith("USDT")
  );

  const pricePairs = symbols
    .map((symbol) => {
      const spotPrice = spotPrices[symbol];
      const futurePrice = futurePrices[symbol];

      if (!spotPrice || !futurePrice) {
        return null;
      }

      const weight = Big(spotPrice).minus(futurePrice).abs().toNumber();

      let level = "D";
      if (weight > 0.1) level = "C";
      if (weight > 1) level = "B";
      if (weight > 5) level = "A";
      if (weight > 10) level = "S";

      // console.log(Big(futurePrice).lt(100), futurePrice)
      return {
        level,
        symbol,
        spotPrice,
        futurePrice,
        weight,
      };
    })
    .filter(Boolean)
    .filter((a) => Big(a.futurePrice).lt(500))
    .sort((a, b) => b.weight - a.weight); // large to small
  return pricePairs;
}

export async function fetchExcellentPairs() {
  const pairs = await fetchSpotFuturePairs();
  const excellentPairs = pairs.filter((a) => a.level !== "D");
  return excellentPairs;
}

export async function runApp() {
  const abnormalTokens = await fetchExcellentPairs();

  if (abnormalTokens.length > 0) {
    const dateTime = dayjs(new Date().getTime()).format("YYYY/MM/DD HH:mm:ss");
    const messageLines = [`时间: ${dateTime}`, "异常币种监测\n"];

    let idx = 0;
    for (const abnormalToken of abnormalTokens) {
      idx++;
      messageLines.push(
        `${idx}. 币种: ${abnormalToken.symbol}\n等级: ${abnormalToken.level}\n合约价格: ${abnormalToken.futurePrice}\n权重: ${abnormalToken.weight}\n`
      );
    }
    await DingtalkBot.sendText(messageLines.join("\n"));
  }
}
