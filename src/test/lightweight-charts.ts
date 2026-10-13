// Stand-in for lightweight-charts in tests that render the chart but do not inspect it:
// jsdom has no canvas. Use with vi.mock("lightweight-charts", () => import("@/test/lightweight-charts")).
const series = () => ({
  setData() {},
  update() {},
  applyOptions() {},
  priceScale: () => ({ applyOptions() {} }),
});

export const CandlestickSeries = "Candlestick";
export const HistogramSeries = "Histogram";
export const ColorType = { Solid: "solid" };

export const createChart = () => ({
  addSeries: series,
  applyOptions() {},
  remove() {},
  timeScale: () => ({ fitContent() {} }),
});
