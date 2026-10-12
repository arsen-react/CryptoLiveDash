import { describe, expect, it } from "vitest";
import type { Ticker } from "@/shared/types/market";
import {
  marketReducer,
  setSelectedSymbol,
  setWsStatus,
  updateTicker,
  updateTickers,
} from "./marketSlice";

const ticker = (symbol: string, price: string): Ticker => ({
  symbol,
  price,
  priceChange: "0",
  priceChangePercent: "0",
  highPrice: price,
  lowPrice: price,
  volume: "0",
  quoteVolume: "0",
});

const initial = () => marketReducer(undefined, { type: "init" });

describe("marketSlice", () => {
  it("starts on BTCUSDT with the socket closed", () => {
    expect(initial()).toMatchObject({ selectedSymbol: "BTCUSDT", wsStatus: "closed" });
  });

  it("selects a symbol", () => {
    expect(marketReducer(initial(), setSelectedSymbol("ETHUSDT")).selectedSymbol).toBe("ETHUSDT");
  });

  it("keeps the latest ticker per symbol", () => {
    const one = marketReducer(initial(), updateTicker(ticker("BTCUSDT", "64000")));
    const batch = marketReducer(
      one,
      updateTickers([ticker("BTCUSDT", "64100"), ticker("ETHUSDT", "3100")]),
    );

    expect(batch.liveTickers.BTCUSDT?.price).toBe("64100");
    expect(batch.liveTickers.ETHUSDT?.price).toBe("3100");
  });

  it("tracks the socket status", () => {
    expect(marketReducer(initial(), setWsStatus("open")).wsStatus).toBe("open");
  });
});
