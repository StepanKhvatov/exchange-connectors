import { Base } from "../base";
import { CandleMessage } from "../types";
import {
  SocketCandlesticksMessage,
  SubscribeCandlesArgs,
  UnsubscribeCandlesArgs,
} from "../types/bitglobal";
import { isStreamReady } from "../utils";

const transformCandleMessage = (
  message: SocketCandlesticksMessage
): CandleMessage | null => {
  const candle = message.data;

  if (candle && candle.symbol) {
    return {
      symbol: candle.symbol.replace("-", "/"),
      open: +candle.c,
      high: +candle.h,
      low: +candle.l,
      volume: +candle.vol,
      close: +candle.c,
      time: message.timestamp,
    };
  }

  return null;
};

export class Bitglobal extends Base {
  constructor() {
    super();
    this.baseWsUrl = "wss://global-api.bithumb.pro/message/realtime";
    this.pingMessage = JSON.stringify({
      cmd: "ping",
    });
  }

  subscribeCandles({ symbol, onMessage }: SubscribeCandlesArgs) {
    if (this.currentStream && isStreamReady(this.currentStream)) {
      this.currentStream.send(
        JSON.stringify({
          cmd: "subscribe",
          args: [`TICKER:${symbol.replace("/", "-")}`],
        })
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
        JSON.stringify({
          cmd: "unSubscribe",
          args: [`TICKER:${symbol.replace("/", "-")}`],
        })
      );
    }
  }
}
