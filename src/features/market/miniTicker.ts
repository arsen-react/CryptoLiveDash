import type { Ticker, WebSocketMiniTickerMessage } from "@/shared/types/market";

/**
 * Maps a Binance 24h mini-ticker to the app's Ticker. The change is computed from the
 * open and close prices and keeps the price's own number of decimals.
 */
export function miniTickerToTicker(message: WebSocketMiniTickerMessage): Ticker {
  const close = parseFloat(message.c);
  const open = parseFloat(message.o);
  const decimals = message.c.split(".")[1]?.length ?? 0;
  const change = close - open;
  const changePercent = open === 0 ? 0 : (change / open) * 100;

  return {
    symbol: message.s,
    price: message.c,
    priceChange: change.toFixed(decimals),
    priceChangePercent: changePercent.toFixed(3),
    highPrice: message.h,
    lowPrice: message.l,
    volume: message.v,
    quoteVolume: message.q,
  };
}
