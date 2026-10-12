import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGetTickersQuery } from "@/features/market/marketApi";
import { queryResult, ticker } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { CoinSearch } from "./CoinSearch";

vi.mock("@/features/market/marketApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/market/marketApi")>()),
  useGetTickersQuery: vi.fn(),
}));

const tickers = [
  ticker("ETHUSDT", 3000, { quoteVolume: "500" }),
  ticker("BTCUSDT", 60000, { quoteVolume: "900" }),
  ticker("SOLUSDT", 150, { quoteVolume: "100" }),
];

const optionNames = () =>
  within(screen.getByRole("textbox").parentElement as HTMLElement)
    .getAllByRole("button")
    .map((button) => button.textContent?.split("/")[0]);

describe("CoinSearch", () => {
  beforeEach(() => {
    vi.mocked(useGetTickersQuery).mockReturnValue(queryResult(tickers));
  });

  it("lists coins by 24h volume", () => {
    renderWithProviders(<CoinSearch onSelect={vi.fn()} />);
    expect(optionNames()).toEqual(["BTC", "ETH", "SOL"]);
  });

  it("filters by symbol as you type", async () => {
    const { user } = renderWithProviders(<CoinSearch onSelect={vi.fn()} />);

    await user.type(screen.getByRole("textbox", { name: "Search coins" }), "so");
    await vi.waitFor(() => expect(optionNames()).toEqual(["SOL"]));
  });

  it("says when nothing matches", async () => {
    const { user } = renderWithProviders(<CoinSearch onSelect={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "xyz");
    expect(await screen.findByText("No coins found")).toBeInTheDocument();
  });

  it("reports the chosen symbol and clears the query", async () => {
    const onSelect = vi.fn();
    const { user } = renderWithProviders(<CoinSearch onSelect={onSelect} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "eth");
    await user.click(await screen.findByRole("button", { name: /^ETH/ }));

    expect(onSelect).toHaveBeenCalledWith("ETHUSDT");
    expect(input).toHaveValue("");
  });

  it("falls back to demo coins when the API has no data", () => {
    vi.mocked(useGetTickersQuery).mockReturnValue(queryResult(undefined));
    renderWithProviders(<CoinSearch onSelect={vi.fn()} />);

    expect(optionNames()).toHaveLength(20);
  });
});
