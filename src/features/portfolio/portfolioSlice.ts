import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";
import type { Position } from "@/shared/types/portfolio";
import { loadFromStorage, saveToStorage } from "@/shared/utils/storage";

const STORAGE_KEY = "cld-portfolio";

const positionSchema = z.array(
  z.object({
    id: z.string(),
    symbol: z.string(),
    amount: z.number().positive().max(1_000_000_000),
    buyPrice: z.number().positive().max(1_000_000_000),
    addedAt: z.number(),
  }),
);

interface PortfolioState {
  positions: Position[];
}

const initialState: PortfolioState = {
  positions: loadFromStorage(STORAGE_KEY, positionSchema, []),
};

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    addPosition(state, action: PayloadAction<Omit<Position, "id" | "addedAt">>) {
      const position: Position = {
        ...action.payload,
        id: crypto.randomUUID(),
        addedAt: Date.now(),
      };
      state.positions.push(position);
      saveToStorage(STORAGE_KEY, state.positions);
    },
    removePosition(state, action: PayloadAction<string>) {
      state.positions = state.positions.filter((p) => p.id !== action.payload);
      saveToStorage(STORAGE_KEY, state.positions);
    },
    updatePosition(
      state,
      action: PayloadAction<{ id: string; amount?: number; buyPrice?: number }>,
    ) {
      const pos = state.positions.find((p) => p.id === action.payload.id);
      if (pos) {
        if (action.payload.amount !== undefined) pos.amount = action.payload.amount;
        if (action.payload.buyPrice !== undefined) pos.buyPrice = action.payload.buyPrice;
        saveToStorage(STORAGE_KEY, state.positions);
      }
    },
  },
});

export const { addPosition, removePosition, updatePosition } = portfolioSlice.actions;
export const portfolioReducer = portfolioSlice.reducer;
