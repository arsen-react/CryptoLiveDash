import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useGetKlinesQuery,
  useGetOrderBookQuery,
  useGetTickersQuery,
} from "@/features/market/marketApi";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { queryResult } from "@/test/fixtures";
import { App } from "./App";
import { routes } from "./routes";
import { makeStore } from "./store";

vi.mock("@/shared/hooks/useWebSocket", () => ({ useWebSocket: vi.fn() }));
vi.mock("@/features/market/marketApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/market/marketApi")>()),
  useGetTickersQuery: vi.fn(),
  useGetKlinesQuery: vi.fn(),
  useGetOrderBookQuery: vi.fn(),
}));
vi.mock("lightweight-charts", () => {
  const series = () => ({
    setData() {},
    update() {},
    applyOptions() {},
    priceScale: () => ({ applyOptions() {} }),
  });
  return {
    ColorType: { Solid: "solid" },
    createChart: () => ({
      addCandlestickSeries: series,
      addHistogramSeries: series,
      applyOptions() {},
      remove() {},
      timeScale: () => ({ fitContent() {} }),
    }),
  };
});

describe("routes", () => {
  beforeEach(() => {
    vi.mocked(useWebSocket).mockReturnValue({ status: "open", reconnectCount: 0 });
    vi.mocked(useGetTickersQuery).mockReturnValue(queryResult(undefined));
    vi.mocked(useGetKlinesQuery).mockReturnValue(queryResult(undefined));
    vi.mocked(useGetOrderBookQuery).mockReturnValue(queryResult(undefined));
  });

  it.each([
    ["/", "Trading Chart"],
    ["/market", "Market Overview"],
    ["/portfolio", "Portfolio"],
    ["/watchlist", "Watchlist"],
    ["/alerts", "Price Alerts"],
  ])("loads the %s page inside the layout", async (path, heading) => {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    render(
      <Provider store={makeStore()}>
        <RouterProvider router={router} />
      </Provider>,
    );

    expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveTextContent("CryptoLiveDash");
  });

  it("boots the whole app on the dashboard", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Trading Chart" })).toBeInTheDocument();
  });
});
