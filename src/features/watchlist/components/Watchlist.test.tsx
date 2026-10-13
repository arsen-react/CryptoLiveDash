import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGetTickersQuery } from "@/features/market/marketApi";
import { updateTickers } from "@/features/market/marketSlice";
import { queryResult, ticker } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { addToWatchlist, removeFromWatchlist } from "../watchlistSlice";
import Watchlist from "./Watchlist";

vi.mock("@/features/market/marketApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/market/marketApi")>()),
  useGetTickersQuery: vi.fn(),
}));

const emptyList = ["BTCUSDT", "ETHUSDT", "SOLUSDT"].map((symbol) => removeFromWatchlist(symbol));

const card = (asset: string) =>
  within(screen.getByText(asset).closest(".widget-card") as HTMLElement);

describe("Watchlist", () => {
  beforeEach(() => {
    vi.mocked(useGetTickersQuery).mockReturnValue(queryResult([ticker("ADAUSDT", 0.7)]));
  });

  it("shows an empty state", () => {
    renderWithProviders(<Watchlist />, { actions: emptyList });
    expect(screen.getByText("Your watchlist is empty")).toBeInTheDocument();
  });

  it("shows live price, range and volume for each coin", () => {
    renderWithProviders(<Watchlist />, {
      actions: [
        ...emptyList,
        addToWatchlist("BTCUSDT"),
        updateTickers([
          ticker("BTCUSDT", 60_000, {
            priceChangePercent: "-1.5",
            highPrice: "61000",
            lowPrice: "59000",
            quoteVolume: "2500000000",
          }),
        ]),
      ],
    });

    expect(card("BTC").getByText("$60,000.00")).toBeInTheDocument();
    expect(card("BTC").getByText("-1.50%")).toBeInTheDocument();
    expect(card("BTC").getByText("$61,000.00")).toBeInTheDocument();
    expect(card("BTC").getByText("$59,000.00")).toBeInTheDocument();
    expect(card("BTC").getByText("$2.50B")).toBeInTheDocument();
  });

  it("opens a coin on the dashboard when its card is clicked", async () => {
    const { user, store } = renderWithProviders(<Watchlist />, { route: "/watchlist" });

    await user.click(screen.getByText("ETH"));

    expect(store.getState().market.selectedSymbol).toBe("ETHUSDT");
    expect(screen.getByTestId("current-path")).toHaveTextContent(/^\/$/);
  });

  it("removes a coin without opening it", async () => {
    const { user, store } = renderWithProviders(<Watchlist />, { route: "/watchlist" });

    await user.click(card("ETH").getByRole("button", { name: "Remove" }));

    expect(screen.queryByText("ETH")).not.toBeInTheDocument();
    expect(store.getState().market.selectedSymbol).toBe("BTCUSDT");
    expect(screen.getByTestId("current-path")).toHaveTextContent("/watchlist");
  });

  it("adds a coin from the search, once", async () => {
    const { user, store } = renderWithProviders(<Watchlist />, { actions: emptyList });

    for (let i = 0; i < 2; i++) {
      await user.click(screen.getAllByRole("button", { name: "+ Add Coin" })[0] as HTMLElement);
      const dialog = within(screen.getByRole("dialog", { name: "Add to Watchlist" }));
      await user.click(dialog.getByRole("button", { name: /^ADA/ }));
    }

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(store.getState().watchlist.items.map((item) => item.symbol)).toEqual(["ADAUSDT"]);
  });
});
