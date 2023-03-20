import qs from "qs";
import { Base } from "../base";
import { CandleMessage } from "../types";
import {
  SocketCandlesticksMessage,
  FetchCandlesArgs,
  UnsubscribeCandlesArgs,
  SubscribeCandlesArgs,
  SendSocketMessageArgs,
} from "../types/binance";
import { transformBinaceStreamSymbol, fetchApi, isStreamReady } from "../utils";

// [Open time, Open, High, Low, Close, Volume, Close time, Quote asset volume, Number of trades, Taker buy base asset volume, Taker buy quote asset volume, Ignore]

type FetchCandlesResponse = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
][];

type FetchCandlesResult = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
}[];

type FetchMarketsResponse = {
  symbols: { permissions: string[]; baseAsset: string; quoteAsset: string }[];
};

type FetchMarketsResult = {
  symbol: string;
  baseTicker: string;
  quoteTicker: string;
}[];

const transformCandleMessage = (
  message: SocketCandlesticksMessage
): CandleMessage | null => {
  if (message.e === "kline") {
    const candle = message.k;

    return {
      open: +candle.o,
      high: +candle.h,
      low: +candle.l,
      close: +candle.c,
      volume: +candle.v,
      symbol: candle.s,
      time: candle.t,
      interval: candle.i,
    };
  }

  return null;
};

export class Binance extends Base {
  baseUrl: string;

  messageId: number;

  currentCandle:
    | {
        symbol: string;
        interval: string;
      }
    | undefined;

  constructor() {
    super();
    this.baseUrl = "https://api.binance.com/api";
    this.baseWsUrl = "wss://stream.binance.com:9443/ws";
    this.messageId = 0;
    this.currentCandle = undefined;
  }

  async fetchCandles({
    symbol,
    interval,
    startTime,
    endTime,
    limit = 1000,
  }: FetchCandlesArgs) {
    const params = qs.stringify({
      symbol: symbol.replace("/", ""),
      interval: interval,
      startTime: startTime,
      endTime: endTime,
      limit: limit,
    });

    return fetchApi({
      url: `${this.baseUrl}/v3/klines?${params}`,
    })
      .then((response: FetchCandlesResponse): FetchCandlesResult => {
        if (Array.isArray(response)) {
          return response.map(
            ([timestamp, open, high, low, close, volume]) => ({
              open: +open,
              high: +high,
              low: +low,
              close: +close,
              volume: +volume,
              time: timestamp,
            })
          );
        }

        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  async fetchMarkets() {
    return fetchApi({
      url: `${this.baseUrl}/v3/exchangeInfo`,
    })
      .then((response: FetchMarketsResponse): FetchMarketsResult => {
        const spotMarkets = response.symbols.filter((market) =>
          market.permissions.includes("SPOT")
        );

        const markets = spotMarkets.map((market) => ({
          symbol: `${market.baseAsset}/${market.quoteAsset}`,
          baseTicker: market.baseAsset,
          quoteTicker: market.quoteAsset,
        }));

        return markets;
      })
      .catch((error) => {
        return error;
      });
  }

  subscribeCandles({ symbol, interval, onMessage }: SubscribeCandlesArgs) {
    if (this.currentStream && isStreamReady(this.currentStream)) {
      this.sendSocketMessage({
        method: "SUBSCRIBE",
        params: [`${transformBinaceStreamSymbol(symbol)}@kline_${interval}`],
      });

      this.currentStream.onmessage = (event) => {
        const message = transformCandleMessage(JSON.parse(event.data));

        if (message) {
          return onMessage(message);
        }

        return undefined;
      };
    }
  }

  unsubscribeCandles({ symbol, interval }: UnsubscribeCandlesArgs) {
    if (this.currentStream && isStreamReady(this.currentStream)) {
      this.sendSocketMessage({
        method: "UNSUBSCRIBE",
        params: [`${transformBinaceStreamSymbol(symbol)}@kline_${interval}`],
      });
    }
  }

  sendSocketMessage({ method, params }: SendSocketMessageArgs) {
    this.messageId += 1;

    if (this.currentStream && isStreamReady(this.currentStream)) {
      this.currentStream.send(
        JSON.stringify({
          method: method,
          params: params,
          id: this.messageId,
        })
      );
    }
  }
}
