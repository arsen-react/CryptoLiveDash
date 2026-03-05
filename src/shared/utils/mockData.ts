import type { Kline, OrderBookEntry, Ticker } from "@/shared/types/market";
import { TOP_SYMBOLS } from "./constants";

// Seed-based pseudo-random for deterministic mock data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const MOCK_PRICES: Record<string, number> = {
  BTCUSDT: 87432.5,
  ETHUSDT: 3245.8,
  BNBUSDT: 612.4,
  SOLUSDT: 178.3,
  XRPUSDT: 2.34,
  ADAUSDT: 0.72,
  DOGEUSDT: 0.165,
  AVAXUSDT: 38.5,
  DOTUSDT: 7.82,
  MATICUSDT: 0.98,
  LINKUSDT: 18.4,
  UNIUSDT: 12.7,
  ATOMUSDT: 9.15,
  LTCUSDT: 92.3,
  ETCUSDT: 27.6,
  NEARUSDT: 5.43,
  APTUSDT: 11.2,
  ARBUSDT: 1.08,
  OPUSDT: 2.45,
  FILUSDT: 5.67,
};

export function generateMockKlines(symbol: string, count = 200): Kline[] {
  const rand = seededRandom(42);
  const basePrice = MOCK_PRICES[symbol] ?? 100;
  const now = Date.now();
  const interval = 3600000; // 1h
  const klines: Kline[] = [];

  let price = basePrice * 0.92;

  for (let i = 0; i < count; i++) {
    const volatility = basePrice * 0.008;
    const drift = (rand() - 0.48) * volatility;
    const open = price;
    const close = open + drift;
    const highExtra = rand() * volatility * 0.5;
    const lowExtra = rand() * volatility * 0.5;
    const high = Math.max(open, close) + highExtra;
    const low = Math.min(open, close) - lowExtra;
    const volume = (rand() * 500 + 100) * (basePrice > 1000 ? 1 : 1000);

    klines.push({
      openTime: now - (count - i) * interval,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(2)),
      closeTime: now - (count - i - 1) * interval,
    });

    price = close;
  }

  return klines;
}

export function generateMockOrderBook(symbol: string): {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
} {
  const rand = seededRandom(123);
  const basePrice = MOCK_PRICES[symbol] ?? 100;
  const spread = basePrice * 0.0002;

  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];

  for (let i = 0; i < 15; i++) {
    const bidPrice = basePrice - spread / 2 - i * spread * 0.5;
    const askPrice = basePrice + spread / 2 + i * spread * 0.5;
    const bidQty = (rand() * 2 + 0.1).toFixed(5);
    const askQty = (rand() * 2 + 0.1).toFixed(5);

    bids.push({ price: bidPrice.toFixed(2), quantity: bidQty });
    asks.push({ price: askPrice.toFixed(2), quantity: askQty });
  }

  return { bids, asks };
}

export function generateMockTickers(): Ticker[] {
  const rand = seededRandom(77);

  return TOP_SYMBOLS.map((symbol) => {
    const basePrice = MOCK_PRICES[symbol] ?? 100;
    const changePercent = (rand() - 0.45) * 10;
    const priceChange = basePrice * (changePercent / 100);
    const volume = (rand() * 1000000 + 100000).toFixed(2);

    return {
      symbol,
      price: basePrice.toFixed(basePrice > 1 ? 2 : 6),
      priceChange: priceChange.toFixed(2),
      priceChangePercent: changePercent.toFixed(2),
      highPrice: (basePrice * (1 + rand() * 0.03)).toFixed(2),
      lowPrice: (basePrice * (1 - rand() * 0.03)).toFixed(2),
      volume,
      quoteVolume: (parseFloat(volume) * basePrice).toFixed(2),
    };
  });
}
