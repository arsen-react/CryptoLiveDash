import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Ticker } from "@/shared/types/market";
import { DEFAULT_SYMBOL } from "@/shared/utils/constants";

interface MarketState {
  selectedSymbol: string;
  liveTickers: Record<string, Ticker>;
  wsStatus: "connecting" | "open" | "closed" | "error";
}

const initialState: MarketState = {
  selectedSymbol: DEFAULT_SYMBOL,
  liveTickers: {},
  wsStatus: "closed",
};

const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    setSelectedSymbol(state, action: PayloadAction<string>) {
      state.selectedSymbol = action.payload;
    },
    updateTicker(state, action: PayloadAction<Ticker>) {
      state.liveTickers[action.payload.symbol] = action.payload;
    },
    updateTickers(state, action: PayloadAction<Ticker[]>) {
      for (const ticker of action.payload) {
        state.liveTickers[ticker.symbol] = ticker;
      }
    },
    setWsStatus(state, action: PayloadAction<MarketState["wsStatus"]>) {
      state.wsStatus = action.payload;
    },
  },
});

export const { setSelectedSymbol, updateTicker, updateTickers, setWsStatus } =
  marketSlice.actions;
export const marketReducer = marketSlice.reducer;
