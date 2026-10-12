import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { updateTickers } from "@/features/market/marketSlice";
import { addPosition } from "@/features/portfolio/portfolioSlice";
import { removeFromWatchlist } from "@/features/watchlist/watchlistSlice";
import { ticker } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { MiniPortfolio } from "./MiniPortfolio";
import { MiniWatchlist } from "./MiniWatchlist";

describe("MiniPortfolio", () => {
  it("links to the portfolio page while it is empty", async () => {
    const { user } = renderWithProviders(<MiniPortfolio />);

    await user.click(screen.getByRole("button", { name: "Add one" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/portfolio");
  });

  it("totals the positions at live prices", () => {
    renderWithProviders(<MiniPortfolio />, {
      actions: [
        addPosition({ symbol: "BTCUSDT", amount: 1, buyPrice: 50_000 }),
        addPosition({ symbol: "ETHUSDT", amount: 10, buyPrice: 2_000 }),
        updateTickers([ticker("BTCUSDT", 55_000), ticker("ETHUSDT", 1_900)]),
      ],
    });

    expect(screen.getByText("$74.00K")).toBeInTheDocument();
    expect(screen.getByText("+5.71%")).toBeInTheDocument();
    expect(screen.getByText("+10.00%")).toBeInTheDocument();
    expect(screen.getByText("-5.00%")).toBeInTheDocument();
  });

  it("shows the first five positions and links to the rest", async () => {
    const symbols = ["BTC", "ETH", "SOL", "ADA", "XRP", "DOT"];
    const { user } = renderWithProviders(<MiniPortfolio />, {
      actions: symbols.map((s) => addPosition({ symbol: `${s}USDT`, amount: 1, buyPrice: 1 })),
    });

    expect(screen.queryByText("DOT")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View all (6)" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/portfolio");
  });
});

describe("MiniWatchlist", () => {
  it("links to the watchlist page while it is empty", async () => {
    const { user } = renderWithProviders(<MiniWatchlist />, {
      actions: ["BTCUSDT", "ETHUSDT", "SOLUSDT"].map((s) => removeFromWatchlist(s)),
    });

    await user.click(screen.getByRole("button", { name: "Add some" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/watchlist");
  });

  it("selects a coin for the chart", async () => {
    const { user, store } = renderWithProviders(<MiniWatchlist />, {
      actions: [updateTickers([ticker("SOLUSDT", 150, { priceChangePercent: "3" })])],
    });

    expect(
      screen.getByRole("button", { name: /^SOL\s*\$150\.00\s*\+3\.00%$/ }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^SOL/ }));
    expect(store.getState().market.selectedSymbol).toBe("SOLUSDT");
  });
});
