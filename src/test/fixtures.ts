import { vi } from "vitest";
import type { Kline, Ticker, WebSocketMiniTickerMessage } from "@/shared/types/market";

export function ticker(symbol: string, price: number, overrides: Partial<Ticker> = {}): Ticker {
  return {
    symbol,
    price: String(price),
    priceChange: "0",
    priceChangePercent: "0",
    highPrice: String(price * 1.1),
    lowPrice: String(price * 0.9),
    volume: "1000",
    quoteVolume: String(price * 1000),
    ...overrides,
  };
}

export function miniTicker(
  symbol: string,
  close: number,
  open = close,
): WebSocketMiniTickerMessage {
  return {
    e: "24hrMiniTicker",
    s: symbol,
    c: close.toFixed(2),
    o: open.toFixed(2),
    h: close.toFixed(2),
    l: open.toFixed(2),
    v: "10",
    q: "1000",
  };
}

export function kline(openTime: number, open: number, close: number, volume = 10): Kline {
  return {
    openTime,
    open,
    high: Math.max(open, close) + 1,
    low: Math.min(open, close) - 1,
    close,
    volume,
    closeTime: openTime + 3_599_999,
  };
}

export function queryResult<T>(data: T | undefined, overrides: Record<string, unknown> = {}) {
  return {
    data,
    isLoading: false,
    isFetching: false,
    error: undefined,
    fulfilledTimeStamp: data === undefined ? undefined : Date.now(),
    refetch: vi.fn(),
    ...overrides,
  } as never;
}
