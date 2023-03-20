import { Base } from "../base";
import { CandleMessage } from "../types";
import {
  SubscribeCandlesArgs,
  UnsubscribeCandlesArgs,
  SocketCandlesticksMessage,
} from "../types/okx";
import { isStreamReady } from "../utils";

const transformCandleMessage = (
  message: SocketCandlesticksMessage
): CandleMessage | null => {
  if (message.data) {
    const symbol = message.arg.instId.replace("-", "/");

    const candle = message.data[0];

    return {
      open: +candle[1],
      high: +candle[2],
      low: +candle[3],
      close: +candle[4],
      volume: +candle[5],
      symbol: symbol,
      time: +candle[0],
    };
  }

  return null;
};

export class Okx extends Base {
  constructor() {
    super();
    this.baseWsUrl = "wss://ws.okex.com:8443/ws/v5/public";
    this.pingMessage = "ping";
  }

  // candle1Y, candle6M, candle3M, candle1M, candle1W, candle1D, candle2D, candle3D, candle5D, candle12H, candle6H, candle4H, candle2H, candle1H, candle30m, candle15m, candle5m, candle3m, candle1m

  subscribeCandles({ symbol, onMessage }: SubscribeCandlesArgs) {
    if (this.currentStream && isStreamReady(this.currentStream)) {
      this.currentStream.send(
        JSON.stringify({
          op: "subscribe",
          args: [
            {
              channel: "candle1D",
              instId: `${symbol.replace("/", "-")}`,
            },
          ],
        })
      );

      this.currentStream.onmessage = (event) => {
        if (event.data === "pong") {
          return undefined;
        }

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
          op: "unsubscribe",
          args: [
            {
              channel: "candle1D",
              instId: `${symbol.replace("/", "-")}`,
            },
          ],
        })
      );
    }
  }
}
