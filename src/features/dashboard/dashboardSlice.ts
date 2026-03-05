import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";
import type { WidgetConfig, WidgetType } from "@/shared/types/common";
import { loadFromStorage, saveToStorage } from "@/shared/utils/storage";

const STORAGE_KEY = "cld-dashboard";

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "w-chart", type: "chart", title: "Trading Chart", position: { x: 0, y: 0 }, size: { w: 8, h: 4 }, visible: true },
  { id: "w-orderbook", type: "order-book", title: "Order Book", position: { x: 8, y: 0 }, size: { w: 4, h: 4 }, visible: true },
  { id: "w-market", type: "market-overview", title: "Market Overview", position: { x: 0, y: 4 }, size: { w: 6, h: 3 }, visible: true },
  { id: "w-watchlist", type: "watchlist", title: "Watchlist", position: { x: 6, y: 4 }, size: { w: 3, h: 3 }, visible: true },
  { id: "w-portfolio", type: "portfolio", title: "Portfolio", position: { x: 9, y: 4 }, size: { w: 3, h: 3 }, visible: true },
];

const widgetSchema = z.array(
  z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    size: z.object({ w: z.number(), h: z.number() }),
    visible: z.boolean(),
  }),
);

interface DashboardState {
  widgets: WidgetConfig[];
}

const initialState: DashboardState = {
  widgets: loadFromStorage(STORAGE_KEY, widgetSchema, DEFAULT_WIDGETS) as WidgetConfig[],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    reorderWidgets(state, action: PayloadAction<WidgetConfig[]>) {
      state.widgets = action.payload;
      saveToStorage(STORAGE_KEY, state.widgets);
    },
    toggleWidgetVisibility(state, action: PayloadAction<string>) {
      const widget = state.widgets.find((w) => w.id === action.payload);
      if (widget) {
        widget.visible = !widget.visible;
        saveToStorage(STORAGE_KEY, state.widgets);
      }
    },
    addWidget(state, action: PayloadAction<{ type: WidgetType; title: string }>) {
      const widget: WidgetConfig = {
        id: `w-${crypto.randomUUID().slice(0, 8)}`,
        type: action.payload.type,
        title: action.payload.title,
        position: { x: 0, y: 0 },
        size: { w: 4, h: 3 },
        visible: true,
      };
      state.widgets.push(widget);
      saveToStorage(STORAGE_KEY, state.widgets);
    },
    removeWidget(state, action: PayloadAction<string>) {
      state.widgets = state.widgets.filter((w) => w.id !== action.payload);
      saveToStorage(STORAGE_KEY, state.widgets);
    },
    resetLayout(state) {
      state.widgets = DEFAULT_WIDGETS;
      saveToStorage(STORAGE_KEY, state.widgets);
    },
  },
});

export const { reorderWidgets, toggleWidgetVisibility, addWidget, removeWidget, resetLayout } =
  dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
