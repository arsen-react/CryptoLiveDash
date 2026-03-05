export type Status = "idle" | "loading" | "succeeded" | "failed";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  visible: boolean;
}

export type WidgetType =
  | "chart"
  | "market-overview"
  | "portfolio"
  | "watchlist"
  | "alerts"
  | "order-book";
