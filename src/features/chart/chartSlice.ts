import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Timeframe } from "@/shared/types/market";

interface ChartState {
  timeframe: Timeframe;
  showVolume: boolean;
  showMA: boolean;
  maPeriod: number;
}

const initialState: ChartState = {
  timeframe: "1h",
  showVolume: true,
  showMA: true,
  maPeriod: 20,
};

const chartSlice = createSlice({
  name: "chart",
  initialState,
  reducers: {
    setTimeframe(state, action: PayloadAction<Timeframe>) {
      state.timeframe = action.payload;
    },
    toggleVolume(state) {
      state.showVolume = !state.showVolume;
    },
    toggleMA(state) {
      state.showMA = !state.showMA;
    },
    setMaPeriod(state, action: PayloadAction<number>) {
      state.maPeriod = action.payload;
    },
  },
});

export const { setTimeframe, toggleVolume, toggleMA, setMaPeriod } =
  chartSlice.actions;
export const chartReducer = chartSlice.reducer;
