import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryResult } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { useGetOrderBookQuery } from "../marketApi";
import { setSelectedSymbol } from "../marketSlice";
import { OrderBook } from "./OrderBook";

vi.mock("../marketApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../marketApi")>()),
  useGetOrderBookQuery: vi.fn(),
}));

const book = {
  lastUpdateId: 1,
  asks: [
    { price: "100.50", quantity: "1.5" },
    { price: "101.00", quantity: "3" },
  ],
  bids: [
    { price: "100.00", quantity: "2" },
    { price: "99.50", quantity: "0.25" },
  ],
};

const prices = () =>
  Array.from(document.querySelectorAll(".text-loss, .text-gain")).map((el) => el.textContent);

describe("OrderBook", () => {
  beforeEach(() => {
    vi.mocked(useGetOrderBookQuery).mockReturnValue(queryResult(book));
  });

  it("lists asks from highest to lowest above the bids, with the spread between", () => {
    renderWithProviders(<OrderBook />);

    expect(prices()).toEqual(["101.00", "100.50", "100.00", "99.50"]);
    expect(screen.getByText("Spread: 0.50")).toBeInTheDocument();
    expect(screen.getByText("3.0000")).toBeInTheDocument();
  });

  it("polls the book of the selected pair every two seconds", () => {
    renderWithProviders(<OrderBook />, { actions: [setSelectedSymbol("ETHUSDT")] });

    expect(useGetOrderBookQuery).toHaveBeenLastCalledWith(
      { symbol: "ETHUSDT", limit: 15 },
      { pollingInterval: 2000 },
    );
  });

  it("falls back to a labelled demo book when the request fails", () => {
    vi.mocked(useGetOrderBookQuery).mockReturnValue(
      queryResult(undefined, { error: { status: "FETCH_ERROR" } }),
    );
    renderWithProviders(<OrderBook />);

    expect(screen.getAllByText("Demo")).toHaveLength(2);
    expect(prices()).toHaveLength(20);
  });
});
