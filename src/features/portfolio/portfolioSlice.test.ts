import { describe, expect, it, vi } from "vitest";
import { addPosition, portfolioReducer, removePosition, updatePosition } from "./portfolioSlice";

const empty = { positions: [] };
const btc = { symbol: "BTCUSDT", amount: 0.5, buyPrice: 60_000 };

const withOne = () => {
  const state = portfolioReducer(empty, addPosition(btc));
  return { state, id: state.positions[0]?.id ?? "" };
};

describe("portfolioSlice", () => {
  it("adds a position with a generated id and timestamp, and persists it", () => {
    const { state, id } = withOne();

    expect(state.positions).toHaveLength(1);
    expect(state.positions[0]).toMatchObject(btc);
    expect(id).not.toBe("");
    expect(state.positions[0]?.addedAt).toEqual(expect.any(Number));
    expect(JSON.parse(localStorage.getItem("cld-portfolio") ?? "[]")).toHaveLength(1);
  });

  it("updates only the fields it is given", () => {
    const { state, id } = withOne();
    const next = portfolioReducer(state, updatePosition({ id, amount: 2 }));
    expect(next.positions[0]).toMatchObject({ amount: 2, buyPrice: 60_000 });
  });

  it("ignores updates for an unknown id", () => {
    const { state } = withOne();
    expect(portfolioReducer(state, updatePosition({ id: "unknown", amount: 9 }))).toBe(state);
  });

  it("removes a position and persists the change", () => {
    const { state, id } = withOne();
    const next = portfolioReducer(state, removePosition(id));

    expect(next.positions).toEqual([]);
    expect(localStorage.getItem("cld-portfolio")).toBe("[]");
  });

  it("rejects tampered positions in storage on start-up", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(
      "cld-portfolio",
      JSON.stringify([{ id: "1", symbol: "BTCUSDT", amount: -5, buyPrice: 1, addedAt: 0 }]),
    );
    vi.resetModules();

    const { portfolioReducer: freshReducer } = await import("./portfolioSlice");
    expect(freshReducer(undefined, { type: "init" }).positions).toEqual([]);
  });
});
