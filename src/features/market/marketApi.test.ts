// @vitest-environment node
// RTK Query builds a fetch Request with an AbortSignal; jsdom's signal is rejected by
// Node's Request, so these tests run in the plain Node environment.
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { marketApi } from "./marketApi";

const makeStore = () =>
  configureStore({
    reducer: { [marketApi.reducerPath]: marketApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(marketApi.middleware),
  });

const mockFetchJson = (body: unknown) => {
  const fetchMock = vi.fn<(input: RequestInfo | URL) => Promise<Response>>(
    async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("marketApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps only USDT pairs and maps Binance ticker fields", async () => {
    mockFetchJson([
      {
        symbol: "BTCUSDT",
        lastPrice: "64000.1",
        priceChange: "100",
        priceChangePercent: "0.16",
        highPrice: "65000",
        lowPrice: "63000",
        volume: "1200",
        quoteVolume: "76800000",
      },
      {
        symbol: "ETHBTC",
        lastPrice: "0.05",
        priceChange: "0",
        priceChangePercent: "0",
        highPrice: "0.05",
        lowPrice: "0.05",
        volume: "1",
        quoteVolume: "0.05",
      },
    ]);

    const request = makeStore().dispatch(marketApi.endpoints.getTickers.initiate());
    const result = await request;
    request.unsubscribe();

    expect(result.data).toEqual([
      {
        symbol: "BTCUSDT",
        price: "64000.1",
        priceChange: "100",
        priceChangePercent: "0.16",
        highPrice: "65000",
        lowPrice: "63000",
        volume: "1200",
        quoteVolume: "76800000",
      },
    ]);
  });

  it("parses kline values into numbers", async () => {
    mockFetchJson([
      [1700000000000, "1.5", "2.0", "1.0", "1.8", "300.25", 1700000059999, "0", 0, "0", "0", "0"],
    ]);

    const request = makeStore().dispatch(
      marketApi.endpoints.getKlines.initiate({ symbol: "BTCUSDT", interval: "1m", limit: 1 }),
    );
    const result = await request;
    request.unsubscribe();

    expect(result.data).toEqual([
      {
        openTime: 1700000000000,
        open: 1.5,
        high: 2,
        low: 1,
        close: 1.8,
        volume: 300.25,
        closeTime: 1700000059999,
      },
    ]);
  });

  it("requests the order book for the symbol and maps price levels", async () => {
    const fetchMock = mockFetchJson({
      lastUpdateId: 7,
      bids: [["64000", "0.5"]],
      asks: [["64001", "1.2"]],
    });

    const request = makeStore().dispatch(
      marketApi.endpoints.getOrderBook.initiate({ symbol: "ETHUSDT", limit: 5 }),
    );
    const result = await request;
    request.unsubscribe();

    const sent = fetchMock.mock.calls[0]?.[0];
    expect(sent instanceof Request ? sent.url : String(sent)).toBe(
      "https://api.binance.com/api/v3/depth?symbol=ETHUSDT&limit=5",
    );
    expect(result.data).toEqual({
      lastUpdateId: 7,
      bids: [{ price: "64000", quantity: "0.5" }],
      asks: [{ price: "64001", quantity: "1.2" }],
    });
  });
});
