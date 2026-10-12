import { describe, expect, it } from "vitest";
import type { WebSocketMiniTickerMessage } from "@/shared/types/market";
import { miniTickerToTicker } from "./miniTicker";

const message = (
  overrides: Partial<WebSocketMiniTickerMessage> = {},
): WebSocketMiniTickerMessage => ({
  e: "24hrMiniTicker",
  s: "BTCUSDT",
  c: "82516.01000000",
  o: "83882.01000000",
  h: "84200.00000000",
  l: "81900.00000000",
  v: "12500.50000000",
  q: "1031250000.00000000",
  ...overrides,
});

describe("miniTickerToTicker", () => {
  it("copies price, range and volumes", () => {
    expect(miniTickerToTicker(message())).toMatchObject({
      symbol: "BTCUSDT",
      price: "82516.01000000",
      highPrice: "84200.00000000",
      lowPrice: "81900.00000000",
      volume: "12500.50000000",
      quoteVolume: "1031250000.00000000",
    });
  });

  it("derives the 24h change from open and close, at the price's precision", () => {
    const ticker = miniTickerToTicker(message());
    expect(ticker.priceChange).toBe("-1366.00000000");
    expect(ticker.priceChangePercent).toBe("-1.628");
  });

  it("reports a gain as a positive change", () => {
    const ticker = miniTickerToTicker(message({ o: "100.00", c: "110.00" }));
    expect(ticker).toMatchObject({ priceChange: "10.00", priceChangePercent: "10.000" });
  });

  it("does not divide by zero for a pair with no opening price", () => {
    expect(miniTickerToTicker(message({ o: "0", c: "1.50" })).priceChangePercent).toBe("0.000");
  });
});
