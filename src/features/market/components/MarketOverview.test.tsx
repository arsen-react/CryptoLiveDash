import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryResult, ticker } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { useGetTickersQuery } from "../marketApi";
import { updateTickers } from "../marketSlice";
import MarketOverview from "./MarketOverview";

vi.mock("../marketApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../marketApi")>()),
  useGetTickersQuery: vi.fn(),
}));

const pairs = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[1]?.textContent);

describe("MarketOverview", () => {
  beforeEach(() => {
    vi.mocked(useGetTickersQuery).mockReturnValue(
      queryResult([
        ticker("DOGEUSDT", 0.16, { quoteVolume: "100" }),
        ticker("BTCUSDT", 60_000, { quoteVolume: "900" }),
        ticker("PEPEUSDT", 0.00001, { quoteVolume: "99999" }),
        ticker("ETHUSDT", 3_000, { quoteVolume: "500" }),
      ]),
    );
  });

  it("ranks the top pairs by 24h volume and leaves out the rest", () => {
    renderWithProviders(<MarketOverview />);
    expect(pairs()).toEqual(["BTC/USDT", "ETH/USDT", "DOGE/USDT"]);
  });

  it("shows live prices over the REST snapshot", () => {
    renderWithProviders(<MarketOverview />, {
      actions: [updateTickers([ticker("BTCUSDT", 61_250.5, { priceChangePercent: "2.5" })])],
    });
    const btc = within(screen.getByText("BTC").closest("tr") as HTMLElement);

    expect(btc.getByText("$61,250.50")).toBeInTheDocument();
    expect(btc.getByText("+2.50%")).toBeInTheDocument();
  });

  it("opens a pair on the dashboard", async () => {
    const { user, store } = renderWithProviders(<MarketOverview />, { route: "/market" });

    await user.click(screen.getByText("ETH"));

    expect(store.getState().market.selectedSymbol).toBe("ETHUSDT");
    expect(screen.getByTestId("current-path")).toHaveTextContent(/^\/$/);
  });

  it("opens a pair from the keyboard", async () => {
    const { user, store } = renderWithProviders(<MarketOverview />, { route: "/market" });

    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");

    expect(store.getState().market.selectedSymbol).toBe("ETHUSDT");
    expect(screen.getByTestId("current-path")).toHaveTextContent(/^\/$/);
  });

  it("labels demo data when the API is unavailable", () => {
    vi.mocked(useGetTickersQuery).mockReturnValue(queryResult(undefined));
    renderWithProviders(<MarketOverview />);

    expect(screen.getAllByText("Demo data").length).toBeGreaterThan(0);
    expect(pairs()).toHaveLength(20);
  });

  it("shows a loading state", () => {
    vi.mocked(useGetTickersQuery).mockReturnValue(queryResult(undefined, { isLoading: true }));
    renderWithProviders(<MarketOverview />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Demo data")).not.toBeInTheDocument();
  });
});
