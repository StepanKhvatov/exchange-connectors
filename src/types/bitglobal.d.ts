import { CandleMessage } from ".";

export type UnsubscribeCandlesArgs = {
  symbol: string;
};

export type SubscribeCandlesArgs = {
  symbol: string;
  interval: string;
  onMessage: (message: CandleMessage) => void;
};

export type SocketCandlesticksMessage = {
  code: number;
  data: {
    // the last new price
    c: string;
    // the highest price in the past 24 hours
    h: string;
    // the lowest price in the past 24 hours
    l: string;
    // price changed in the past 24 hours
    p: string;
    // Symbol in BTC-USDT format
    symbol: string;
    // deal quantity in the past 24 hours
    v: string;
    // version numbe
    ver: string;
    // Volume
    vol: string;
  };
  timestamp: number;
  topic: string;
};
