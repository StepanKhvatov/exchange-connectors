import { isStreamReady } from "./utils";

export class Base {
  baseWsUrl: string | undefined;

  currentStream: WebSocket | undefined;

  pingInterval: ReturnType<typeof setInterval> | undefined;

  pingMessage: string;

  constructor() {
    this.pingMessage = "";
  }

  async openStream() {
    const stream = await this.createSocketConnection();

    if (stream && isStreamReady(stream)) {
      this.currentStream = stream;
    }

    return this;
  }

  closeStream() {
    if (this.currentStream && isStreamReady(this.currentStream)) {
      this.currentStream.close();

      if (this.pingInterval) {
        clearInterval(this.pingInterval);
      }

      return this;
    }

    throw new Error("Stream not open");
  }

  createSocketConnection(): Promise<WebSocket> | undefined {
    if (this.baseWsUrl) {
      const socket = new WebSocket(this.baseWsUrl);

      return new Promise((resolve, reject) => {
        socket.onerror = (err) => reject(err);

        socket.onopen = () => {
          if (this.pingMessage) {
            this.pingInterval = setInterval(
              () => socket.send(this.pingMessage),
              15000
            );
          }

          resolve(socket);
        };
      });
    }

    return undefined;
  }
}
