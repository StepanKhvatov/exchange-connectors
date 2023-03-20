import { CandleMessage } from ".";

export type FetchCandlesArgs = {
  symbol: string;
  interval: string;
  startTime: number;
  endTime: number;
  limit?: number;
};

export type UnsubscribeCandlesArgs = {
  symbol: string;
  interval: string;
};

export type SubscribeCandlesArgs = {
  symbol: string;
  interval: string;
  onMessage: (message: CandleMessage) => void;
};

export type SocketCandlesticksMessage = {
  // Event type
  e: string;
  k: {
    // Kline start time
    t: number;
    // Symbol
    s: string;
    // Interval
    i: string;
    // Open price
    o: string;
    // Close price
    c: string;
    // High price
    h: string;
    // Low price
    l: string;
    // Base asset volume
    v: string;
  };
};

export type SendSocketMessageArgs = {
  method: "SUBSCRIBE" | "UNSUBSCRIBE";
  params: string[];
};

type FetchMarketsResponse = {
  symbols: { permissions: string[]; baseAsset: string; quoteAsset: string }[];
};

type FetchMarketsResult = {
  symbol: string;
  baseTicker: string;
  quoteTicker: string;
}[];

type FetchPriceResponse = {
  symbol: string;
  price: string;
};

type FetchPriceResult = {
  symbol: string;
  price: number;
};
