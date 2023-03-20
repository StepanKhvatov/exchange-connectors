import { CandleMessage } from ".";

export type FetchCandlesArgs = {
  symbol: string;
  interval: number;
  startTime: number;
  endTime: number;
};

export type UnsubscribeCandlesArgs = {
  symbol: string;
};

export type SubscribeCandlesArgs = {
  symbol: string;
  interval: string;
  onMessage: (message: CandleMessage) => void;
};

export type SocketCandlesticksMessage = {
  channel: string;
  market: string;
  data?: {
    id: number;
    liquidation: boolean;
    price: number;
    side: string;
    size: number;
    time: string;
  }[];
  type: string;
};
