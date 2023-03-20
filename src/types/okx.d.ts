export type UnsubscribeCandlesArgs = {
    symbol: string
    interval: string
}

export type SubscribeCandlesArgs = {
    symbol: string
    interval: string
    onMessage: (message: CandleMessage) => void
}

export type SocketCandlesticksMessage = {
    arg: { chanel: string; instId: string }
    // [Opening time of the candlestick Unix timestamp format in milliseconds, Open price, highest price, Lowest price, Close price, Trading volume ]
    data: [string, string, string, string, string, string, string][]
}
