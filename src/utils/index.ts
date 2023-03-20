export const intervalsToSeconds = {
  "1m": 60,
  "3m": 180,
  "5m": 300,
  "15m": 900,
  "30m": 1800,
  "1h": 3600,
  "2h": 7200,
  "4h": 14400,
  "6h": 21600,
  "8h": 28800,
  "12h": 43200,
  "1d": 86400,
  "3d": 259200,
  "1w": 604800,
  "1M": 86400 * 30,
};

export const transformBinaceStreamSymbol = (symbol: string) =>
  symbol.replace("/", "").toLowerCase();

type FetchApiProps = {
  url: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  headers?: HeadersInit | undefined;
};

export const fetchApi = async ({ url, method, headers }: FetchApiProps) =>
  fetch(url, { method, headers }).then((res) => {
    if (res.ok) {
      return res.json();
    }

    throw new Error("Fetch api error");
  });

export const isStreamReady = (stream: WebSocket | undefined): boolean => {
  return Boolean(stream && stream.readyState === 1);
};
