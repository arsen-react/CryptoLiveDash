export const BINANCE_REST_URL = import.meta.env.VITE_BINANCE_REST_URL || "https://api.binance.com";
export const BINANCE_WS_URL =
  import.meta.env.VITE_BINANCE_WS_URL || "wss://stream.binance.com:9443/ws";
export const BINANCE_STREAM_URL =
  import.meta.env.VITE_BINANCE_STREAM_URL || "wss://stream.binance.com:9443/stream";

export const DEFAULT_SYMBOL = "BTCUSDT";

export const TOP_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "AVAXUSDT",
  "DOTUSDT",
  "MATICUSDT",
  "LINKUSDT",
  "UNIUSDT",
  "ATOMUSDT",
  "LTCUSDT",
  "ETCUSDT",
  "NEARUSDT",
  "APTUSDT",
  "ARBUSDT",
  "OPUSDT",
  "FILUSDT",
];

export const TIMEFRAMES = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
] as const;

export const WS_RECONNECT_DELAY = 3000;
export const WS_MAX_RECONNECT_ATTEMPTS = 5;
