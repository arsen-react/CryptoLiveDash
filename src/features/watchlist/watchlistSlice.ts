import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";
import type { WatchlistItem } from "@/shared/types/portfolio";
import { loadFromStorage, saveToStorage } from "@/shared/utils/storage";

const STORAGE_KEY = "cld-watchlist";

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: "BTCUSDT", addedAt: Date.now() },
  { symbol: "ETHUSDT", addedAt: Date.now() },
  { symbol: "SOLUSDT", addedAt: Date.now() },
];

const watchlistSchema = z.array(
  z.object({
    symbol: z.string(),
    addedAt: z.number(),
  }),
);

interface WatchlistState {
  items: WatchlistItem[];
}

const initialState: WatchlistState = {
  items: loadFromStorage(STORAGE_KEY, watchlistSchema, DEFAULT_WATCHLIST),
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    addToWatchlist(state, action: PayloadAction<string>) {
      if (!state.items.find((i) => i.symbol === action.payload)) {
        state.items.push({ symbol: action.payload, addedAt: Date.now() });
        saveToStorage(STORAGE_KEY, state.items);
      }
    },
    removeFromWatchlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.symbol !== action.payload);
      saveToStorage(STORAGE_KEY, state.items);
    },
  },
});

export const { addToWatchlist, removeFromWatchlist } = watchlistSlice.actions;
export const watchlistReducer = watchlistSlice.reducer;
