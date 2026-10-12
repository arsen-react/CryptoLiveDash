import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGetTickersQuery } from "@/features/market/marketApi";
import { updateTickers } from "@/features/market/marketSlice";
import { queryResult, ticker } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { addPosition } from "../portfolioSlice";
import Portfolio from "./Portfolio";

vi.mock("@/features/market/marketApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/market/marketApi")>()),
  useGetTickersQuery: vi.fn(),
}));

const row = (asset: string) => within(screen.getByText(asset).closest("tr") as HTMLElement);

const totals = (label: string) =>
  (screen.getByText(label).parentElement as HTMLElement).textContent?.replace(label, "");

describe("Portfolio", () => {
  beforeEach(() => {
    vi.mocked(useGetTickersQuery).mockReturnValue(
      queryResult([ticker("SOLUSDT", 150), ticker("BTCUSDT", 66000)]),
    );
  });

  it("invites the user to add a first position", () => {
    renderWithProviders(<Portfolio />);

    expect(screen.getByText("No positions yet")).toBeInTheDocument();
    expect(totals("Total Value")).toBe("$0.00");
  });

  it("values positions at the live price, or at the buy price until one arrives", () => {
    renderWithProviders(<Portfolio />, {
      actions: [
        addPosition({ symbol: "BTCUSDT", amount: 0.5, buyPrice: 60_000 }),
        addPosition({ symbol: "ETHUSDT", amount: 2, buyPrice: 3_000 }),
        updateTickers([ticker("BTCUSDT", 66_000)]),
      ],
    });

    expect(row("BTC").getByText("$66,000.00")).toBeInTheDocument();
    expect(row("BTC").getByText("$33.00K")).toBeInTheDocument();
    expect(row("BTC").getByText("+$3,000.00")).toBeInTheDocument();
    expect(row("BTC").getByText("+10.00%")).toBeInTheDocument();
    expect(row("ETH").getByText("$6.00K")).toBeInTheDocument();
    expect(row("ETH").getByText("+0.00%")).toBeInTheDocument();

    expect(totals("Total Value")).toBe("$39.00K");
    expect(totals("Total Cost")).toBe("$36.00K");
    expect(totals("Total P&L")).toBe("+$3.00K+8.33%");
  });

  it("removes a position", async () => {
    const { user, store } = renderWithProviders(<Portfolio />, {
      actions: [addPosition({ symbol: "BTCUSDT", amount: 1, buyPrice: 60_000 })],
    });

    await user.click(row("BTC").getByRole("button", { name: "Remove" }));

    expect(screen.queryByText("BTC")).not.toBeInTheDocument();
    expect(store.getState().portfolio.positions).toEqual([]);
  });

  it("adds a position picked from the coin search", async () => {
    const { user, store } = renderWithProviders(<Portfolio />);

    await user.click(screen.getAllByRole("button", { name: "+ Add Position" })[0] as HTMLElement);
    const dialog = within(screen.getByRole("dialog", { name: "Add Position" }));
    await user.click(dialog.getByRole("button", { name: /^SOL/ }));
    await user.type(dialog.getByLabelText("Amount"), "3");
    await user.clear(dialog.getByLabelText("Buy Price (USD)"));
    await user.type(dialog.getByLabelText("Buy Price (USD)"), "140");
    await user.click(dialog.getByRole("button", { name: "Add Position" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(row("SOL").getByText("$420.00")).toBeInTheDocument();
    expect(store.getState().portfolio.positions).toMatchObject([
      { symbol: "SOLUSDT", amount: 3, buyPrice: 140 },
    ]);
  });

  it("keeps the form open until the amount and price are valid", async () => {
    const { user, store } = renderWithProviders(<Portfolio />);

    await user.click(screen.getAllByRole("button", { name: "+ Add Position" })[0] as HTMLElement);
    const dialog = within(screen.getByRole("dialog", { name: "Add Position" }));
    await user.click(dialog.getByRole("button", { name: /^SOL/ }));
    await user.click(dialog.getByRole("button", { name: "Add Position" }));

    expect(await dialog.findByText("Enter a valid amount")).toBeInTheDocument();
    expect(dialog.getByText("Enter a valid price")).toBeInTheDocument();
    expect(store.getState().portfolio.positions).toEqual([]);
  });
});
