export interface Position {
  id: string;
  symbol: string;
  amount: number;
  buyPrice: number;
  addedAt: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercent: number;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  active: boolean;
  createdAt: number;
  triggeredAt?: number;
}
