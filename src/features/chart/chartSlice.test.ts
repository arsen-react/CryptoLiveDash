import { describe, expect, it } from "vitest";
import { chartReducer, setMaPeriod, setTimeframe, toggleMA, toggleVolume } from "./chartSlice";

const initial = () => chartReducer(undefined, { type: "init" });

describe("chartSlice", () => {
  it("starts on the hourly chart with volume and a 20-period moving average", () => {
    expect(initial()).toEqual({ timeframe: "1h", showVolume: true, showMA: true, maPeriod: 20 });
  });

  it("changes timeframe and moving-average period", () => {
    const next = chartReducer(chartReducer(initial(), setTimeframe("4h")), setMaPeriod(50));
    expect(next).toMatchObject({ timeframe: "4h", maPeriod: 50 });
  });

  it("toggles the volume and moving-average overlays", () => {
    const next = chartReducer(chartReducer(initial(), toggleVolume()), toggleMA());
    expect(next).toMatchObject({ showVolume: false, showMA: false });
  });
});
