import { act, fireEvent, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGetTickersQuery } from "@/features/market/marketApi";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { BINANCE_WS_URL } from "@/shared/utils/constants";
import { miniTicker, queryResult, ticker } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { Header } from "./Header";
import { MainLayout } from "./MainLayout";
import { Sidebar } from "./Sidebar";

vi.mock("@/shared/hooks/useWebSocket", () => ({ useWebSocket: vi.fn() }));
vi.mock("@/features/market/marketApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/market/marketApi")>()),
  useGetTickersQuery: vi.fn(),
}));

const lastSocket = () => {
  const call = vi.mocked(useWebSocket).mock.lastCall;
  if (!call) throw new Error("useWebSocket was not called");
  return call[0];
};

const renderLayout = () =>
  renderWithProviders(
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<p>Page content</p>} />
      </Route>
    </Routes>,
  );

describe("MainLayout", () => {
  beforeEach(() => {
    vi.mocked(useWebSocket).mockReturnValue({ status: "open", reconnectCount: 0 });
    vi.mocked(useGetTickersQuery).mockReturnValue(queryResult([]));
  });

  it("subscribes to the all-market mini-ticker stream and renders the page", () => {
    renderLayout();

    expect(lastSocket().url).toBe(`${BINANCE_WS_URL}/!miniTicker@arr`);
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("stores live USDT prices from the stream and shows them in the ticker", () => {
    const { store } = renderLayout();

    act(() =>
      lastSocket().onMessage([miniTicker("BTCUSDT", 61_000, 60_000), miniTicker("ETHBTC", 0.05)]),
    );

    expect(Object.keys(store.getState().market.liveTickers)).toEqual(["BTCUSDT"]);
    expect(store.getState().market.liveTickers.BTCUSDT?.priceChangePercent).toBe("1.667");
    expect(screen.getAllByText("$61,000.00")).toHaveLength(2);
  });

  it("accepts single messages and skips updates with no USDT pair", () => {
    const { store } = renderLayout();
    const onStoreChange = vi.fn();
    store.subscribe(onStoreChange);

    act(() => lastSocket().onMessage([miniTicker("ETHBTC", 0.05)]));
    expect(onStoreChange).not.toHaveBeenCalled();

    act(() => lastSocket().onMessage(miniTicker("SOLUSDT", 150)));
    expect(Object.keys(store.getState().market.liveTickers)).toEqual(["SOLUSDT"]);
  });

  it.each([
    ["open", "Live"],
    ["connecting", "Connecting..."],
    ["error", "Disconnected"],
    ["closed", "Offline"],
  ] as const)("reports a %s connection as %s", (status, label) => {
    vi.mocked(useWebSocket).mockReturnValue({ status, reconnectCount: 0 });
    const { store } = renderLayout();

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(store.getState().market.wsStatus).toBe(status);
  });
});

describe("Header", () => {
  beforeEach(() => {
    vi.mocked(useGetTickersQuery).mockReturnValue(queryResult([ticker("SOLUSDT", 150)]));
  });

  it("opens the coin search with the / key", () => {
    renderWithProviders(<Header connectionStatus="open" />);

    fireEvent.keyDown(document.body, { key: "/" });
    expect(screen.getByRole("dialog", { name: "Search Coin" })).toBeInTheDocument();
  });

  it("ignores / while the user is typing in a field", () => {
    renderWithProviders(
      <>
        <input aria-label="Notes" />
        <Header connectionStatus="open" />
      </>,
    );

    fireEvent.keyDown(screen.getByRole("textbox", { name: "Notes" }), { key: "/" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the chosen coin on the dashboard", async () => {
    const { user, store } = renderWithProviders(<Header connectionStatus="open" />, {
      route: "/portfolio",
    });

    await user.click(screen.getByRole("button", { name: /Search/ }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: /^SOL/ }));

    expect(store.getState().market.selectedSymbol).toBe("SOLUSDT");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("current-path")).toHaveTextContent(/^\/$/);
  });
});

describe("Sidebar", () => {
  it("links to every section and marks the current one", () => {
    renderWithProviders(<Sidebar />, { route: "/watchlist" });

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/market",
      "/portfolio",
      "/watchlist",
      "/alerts",
    ]);
    expect(screen.getByRole("link", { name: "Watchlist" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Market" })).not.toHaveAttribute("aria-current");
  });
});
