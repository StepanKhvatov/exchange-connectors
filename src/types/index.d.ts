export type CandleMessage = {
    open: number
    high: number
    low: number
    close: number
    volume: number
    symbol: string
    time: number
    interval?: string
}
