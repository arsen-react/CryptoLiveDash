import { describe, expect, it, vi } from "vitest";
import { addToWatchlist, removeFromWatchlist, watchlistReducer } from "./watchlistSlice";

const state = { items: [{ symbol: "BTCUSDT", addedAt: 1 }] };
const symbols = (s: typeof state) => s.items.map((item) => item.symbol);

describe("watchlistSlice", () => {
  it("adds a symbol only once", () => {
    const once = watchlistReducer(state, addToWatchlist("ETHUSDT"));
    const twice = watchlistReducer(once, addToWatchlist("ETHUSDT"));
    expect(symbols(twice)).toEqual(["BTCUSDT", "ETHUSDT"]);
  });

  it("removes a symbol and persists the change", () => {
    const next = watchlistReducer(state, removeFromWatchlist("BTCUSDT"));
    expect(next.items).toEqual([]);
    expect(localStorage.getItem("cld-watchlist")).toBe("[]");
  });

  it("starts with BTC, ETH and SOL when nothing is stored", async () => {
    vi.resetModules();
    const { watchlistReducer: freshReducer } = await import("./watchlistSlice");
    expect(symbols(freshReducer(undefined, { type: "init" }))).toEqual([
      "BTCUSDT",
      "ETHUSDT",
      "SOLUSDT",
    ]);
  });
});
