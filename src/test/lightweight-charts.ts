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
