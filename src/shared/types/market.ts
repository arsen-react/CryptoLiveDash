export interface Ticker {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
}

export interface OrderBook {
  lastUpdateId: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface CoinInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

export interface WebSocketTickerMessage {
  e: "24hrTicker";
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  c: string; // Last price
  h: string; // High price
  l: string; // Low price
  v: string; // Volume
  q: string; // Quote volume
}

export interface WebSocketKlineMessage {
  e: "kline";
  s: string;
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    o: string; // Open
    c: string; // Close
    h: string; // High
    l: string; // Low
    v: string; // Volume
  };
}
