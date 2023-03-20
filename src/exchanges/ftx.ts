import { Base } from "../base";
import { CandleMessage } from "../types";
import {
  SubscribeCandlesArgs,
  UnsubscribeCandlesArgs,
  SocketCandlesticksMessage,
} from "../types/ftx";
import { isStreamReady } from "../utils/index";

const transformCandleMessage = (
  message: SocketCandlesticksMessage
): CandleMessage | null => {
  if (message.data) {
    const trades = message.data;

    const open = trades[0].price;

    const calculatedHighLowVolume = trades.reduce(
      (
        acc: { high: number; low: number; volume: number },
        { size, price }: { size: number; price: number }
      ) => ({
        high: price > acc.high ? price : acc.high,
        low: price < acc.low ? price : acc.low,
        volume: acc.volume + price * size,
      }),
      { high: open, low: open, volume: 0 }
    );

    const lastTrade = trades[trades.length - 1];

    const close = lastTrade.price;

    return {
      ...calculatedHighLowVolume,
      open: open,
      close: close,
      symbol: message.market,
      time: new Date(trades[0].time).getTime(),
    };
  }

  return null;
};

export class Ftx extends Base {
  constructor() {
    super();
    this.baseWsUrl = "wss://ftx.com/ws";
    this.pingMessage = JSON.stringify({
      op: "ping",
    });
  }

  subscribeCandles({ symbol, onMessage }: SubscribeCandlesArgs) {
    if (this.currentStream && isStreamReady(this.currentStream)) {
      this.currentStream.send(
        JSON.stringify({ op: "subscribe", channel: "trades", market: symbol })
      );

      this.currentStream.onmessage = (event) => {
        const message = transformCandleMessage(JSON.parse(event.data));

        if (message) {
          return onMessage(message);
        }

        return undefined;
      };
    }
  }

  unsubscribeCandles({ symbol }: UnsubscribeCandlesArgs) {
    if (this.currentStream && isStreamReady(this.currentStream)) {
      this.currentStream.send(
        JSON.stringify({ op: "unsubscribe", channel: "trades", market: symbol })
      );
    }
  }
}
