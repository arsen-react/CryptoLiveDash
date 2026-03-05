import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";
import type { PriceAlert } from "@/shared/types/portfolio";
import { loadFromStorage, saveToStorage } from "@/shared/utils/storage";

const STORAGE_KEY = "cld-alerts";

const alertsSchema = z.array(
  z.object({
    id: z.string(),
    symbol: z.string(),
    targetPrice: z.number().positive().max(1_000_000_000),
    condition: z.enum(["above", "below"]),
    active: z.boolean(),
    createdAt: z.number(),
    triggeredAt: z.number().optional(),
  }),
);

interface AlertsState {
  alerts: PriceAlert[];
}

const initialState: AlertsState = {
  alerts: loadFromStorage(STORAGE_KEY, alertsSchema, []),
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    addAlert(
      state,
      action: PayloadAction<Pick<PriceAlert, "symbol" | "targetPrice" | "condition">>,
    ) {
      const alert: PriceAlert = {
        ...action.payload,
        id: crypto.randomUUID(),
        active: true,
        createdAt: Date.now(),
      };
      state.alerts.push(alert);
      saveToStorage(STORAGE_KEY, state.alerts);
    },
    removeAlert(state, action: PayloadAction<string>) {
      state.alerts = state.alerts.filter((a) => a.id !== action.payload);
      saveToStorage(STORAGE_KEY, state.alerts);
    },
    triggerAlert(state, action: PayloadAction<string>) {
      const alert = state.alerts.find((a) => a.id === action.payload);
      if (alert) {
        alert.active = false;
        alert.triggeredAt = Date.now();
        saveToStorage(STORAGE_KEY, state.alerts);
      }
    },
    toggleAlert(state, action: PayloadAction<string>) {
      const alert = state.alerts.find((a) => a.id === action.payload);
      if (alert) {
        alert.active = !alert.active;
        saveToStorage(STORAGE_KEY, state.alerts);
      }
    },
  },
});

export const { addAlert, removeAlert, triggerAlert, toggleAlert } = alertsSlice.actions;
export const alertsReducer = alertsSlice.reducer;
