import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGetKlinesQuery } from "@/features/market/marketApi";
import { setSelectedSymbol } from "@/features/market/marketSlice";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { BINANCE_WS_URL } from "@/shared/utils/constants";
import { kline, queryResult } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { setTimeframe, toggleVolume } from "../chartSlice";
import TradingChart from "./TradingChart";

const chart = vi.hoisted(() => {
  const makeSeries = () => ({
    setData: vi.fn(),
    update: vi.fn(),
    applyOptions: vi.fn(),
    priceScale: vi.fn(() => ({ applyOptions: vi.fn() })),
  });
  const candles = makeSeries();
  const volume = makeSeries();
  const fitContent = vi.fn();
  const api = {
    addSeries: vi.fn((definition: string) => (definition === "Candlestick" ? candles : volume)),
    applyOptions: vi.fn(),
    remove: vi.fn(),
    timeScale: vi.fn(() => ({ fitContent })),
  };
  return { api, candles, volume, fitContent, createChart: vi.fn(() => api) };
});

vi.mock("lightweight-charts", () => ({
  CandlestickSeries: "Candlestick",
  HistogramSeries: "Histogram",
  ColorType: { Solid: "solid" },
  createChart: chart.createChart,
}));
vi.mock("@/shared/hooks/useWebSocket", () => ({ useWebSocket: vi.fn() }));
vi.mock("@/features/market/marketApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/market/marketApi")>()),
  useGetKlinesQuery: vi.fn(),
}));

const HOUR = 3_600_000;
const T0 = 1_700_000_000_000;
const klines = [kline(T0, 100, 105, 10), kline(T0 + HOUR, 105, 92, 20)];

const lastSocket = () => {
  const call = vi.mocked(useWebSocket).mock.lastCall;
  if (!call) throw new Error("useWebSocket was not called");
  return call[0];
};

describe("TradingChart", () => {
  beforeEach(() => {
    vi.mocked(useWebSocket).mockReturnValue({ status: "open", reconnectCount: 0 });
    vi.mocked(useGetKlinesQuery).mockReturnValue(queryResult(klines));
  });

  it("draws candles and volume bars, coloured by direction", () => {
    renderWithProviders(<TradingChart />);

    expect(chart.createChart).toHaveBeenCalledTimes(1);
    expect(chart.api.addSeries).toHaveBeenCalledWith(
      "Candlestick",
      expect.objectContaining({ upColor: "#22c55e", downColor: "#ef4444" }),
    );
    expect(chart.api.addSeries).toHaveBeenCalledWith(
      "Histogram",
      expect.objectContaining({ priceFormat: { type: "volume" }, priceScaleId: "" }),
    );
    expect(chart.candles.setData).toHaveBeenLastCalledWith([
      { time: T0 / 1000, open: 100, high: 106, low: 99, close: 105 },
      { time: (T0 + HOUR) / 1000, open: 105, high: 106, low: 91, close: 92 },
    ]);
    expect(chart.volume.setData).toHaveBeenLastCalledWith([
      { time: T0 / 1000, value: 10, color: "#22c55e33" },
      { time: (T0 + HOUR) / 1000, value: 20, color: "#ef444433" },
    ]);
    expect(chart.fitContent).toHaveBeenCalled();
    expect(screen.queryByText(/Binance API unavailable/)).not.toBeInTheDocument();
  });

  it("loads and streams the selected pair at the selected timeframe", () => {
    renderWithProviders(<TradingChart />, {
      actions: [setSelectedSymbol("ETHUSDT"), setTimeframe("4h")],
    });

    expect(useGetKlinesQuery).toHaveBeenLastCalledWith({ symbol: "ETHUSDT", interval: "4h" });
    expect(lastSocket().url).toBe(`${BINANCE_WS_URL}/ethusdt@kline_4h`);
  });

  it("updates the latest candle from the live stream", () => {
    renderWithProviders(<TradingChart />);

    act(() =>
      lastSocket().onMessage({
        e: "kline",
        s: "BTCUSDT",
        k: {
          t: T0 + HOUR,
          T: T0 + 2 * HOUR - 1,
          s: "BTCUSDT",
          i: "1h",
          o: "92",
          c: "95",
          h: "96",
          l: "90",
          v: "25",
        },
      }),
    );

    expect(chart.candles.update).toHaveBeenCalledWith({
      time: (T0 + HOUR) / 1000,
      open: 92,
      high: 96,
      low: 90,
      close: 95,
    });
    expect(chart.volume.update).toHaveBeenCalledWith({
      time: (T0 + HOUR) / 1000,
      value: 25,
      color: "#22c55e33",
    });
  });

  it("hides the volume bars when volume is turned off", () => {
    renderWithProviders(<TradingChart />, { actions: [toggleVolume()] });
    expect(chart.volume.applyOptions).toHaveBeenLastCalledWith({ visible: false });
  });

  it("falls back to labelled demo candles when the API fails", () => {
    vi.mocked(useGetKlinesQuery).mockReturnValue(
      queryResult(undefined, { error: { status: "FETCH_ERROR" } }),
    );
    renderWithProviders(<TradingChart />);

    expect(screen.getByText("Demo data — Binance API unavailable")).toBeInTheDocument();
    expect(screen.getByText("Using demo data")).toBeInTheDocument();
    expect(chart.candles.setData.mock.lastCall?.[0]).toHaveLength(200);
  });

  it("shows when the live stream last updated, per pair", () => {
    vi.mocked(useGetKlinesQuery).mockReturnValue(
      queryResult(undefined, { error: { status: "FETCH_ERROR" } }),
    );
    const { store } = renderWithProviders(<TradingChart />);
    expect(screen.getByText("Demo data")).toBeInTheDocument();

    act(() =>
      lastSocket().onMessage({
        e: "kline",
        s: "BTCUSDT",
        k: {
          t: T0,
          T: T0 + HOUR - 1,
          s: "BTCUSDT",
          i: "1h",
          o: "1",
          c: "2",
          h: "2",
          l: "1",
          v: "5",
        },
      }),
    );
    expect(screen.queryByText("Demo data")).not.toBeInTheDocument();
    expect(screen.getByText("just now")).toBeInTheDocument();

    act(() => {
      store.dispatch(setSelectedSymbol("ETHUSDT"));
    });
    expect(screen.getByText("Demo data")).toBeInTheDocument();
  });

  it("sizes itself to its container and is removed when unmounted", () => {
    const { unmount } = renderWithProviders(<TradingChart />);
    expect(chart.createChart).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({ autoSize: true }),
    );

    unmount();
    expect(chart.api.remove).toHaveBeenCalledTimes(1);
  });

  it("switches timeframe from the selector", async () => {
    const { user, store } = renderWithProviders(<TradingChart />);
    const fourHours = screen.getByRole("button", { name: "4H" });
    expect(fourHours).toHaveAttribute("aria-pressed", "false");

    await user.click(fourHours);

    expect(store.getState().chart.timeframe).toBe("4h");
    expect(fourHours).toHaveAttribute("aria-pressed", "true");
    expect(lastSocket().url).toBe(`${BINANCE_WS_URL}/btcusdt@kline_4h`);
  });
});
