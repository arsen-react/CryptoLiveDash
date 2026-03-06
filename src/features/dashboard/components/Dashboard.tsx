import { useAppSelector } from "@/app/store";
import { OrderBook } from "@/features/market/components/OrderBook";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton";
import { PriceChange } from "@/shared/components/PriceChange";
import { formatCurrency, formatPrice } from "@/shared/utils/formatters";
import { lazy, Suspense } from "react";
import { MiniMarket } from "./MiniMarket";
import { MiniPortfolio } from "./MiniPortfolio";
import { MiniWatchlist } from "./MiniWatchlist";

const TradingChart = lazy(() => import("@/features/chart/components/TradingChart"));

const MOCK_STATS: Record<
  string,
  { price: number; change: number; high: number; low: number; vol: number }
> = {
  BTCUSDT: { price: 87432.5, change: 2.34, high: 88100, low: 85900, vol: 2_340_000_000 },
  ETHUSDT: { price: 3245.8, change: 1.87, high: 3310, low: 3180, vol: 890_000_000 },
  BNBUSDT: { price: 612.4, change: -0.54, high: 625, low: 605, vol: 320_000_000 },
  SOLUSDT: { price: 178.3, change: 3.12, high: 182, low: 172, vol: 560_000_000 },
};

export default function Dashboard() {
  const selectedSymbol = useAppSelector((state) => state.market.selectedSymbol);
  const liveTicker = useAppSelector((state) => state.market.liveTickers[selectedSymbol]);

  const fallback = MOCK_STATS[selectedSymbol];
  const price = liveTicker ? parseFloat(liveTicker.price) : (fallback?.price ?? 0);
  const change = liveTicker ? parseFloat(liveTicker.priceChangePercent) : (fallback?.change ?? 0);
  const high = liveTicker ? parseFloat(liveTicker.highPrice) : (fallback?.high ?? 0);
  const low = liveTicker ? parseFloat(liveTicker.lowPrice) : (fallback?.low ?? 0);
  const vol = liveTicker ? parseFloat(liveTicker.quoteVolume) : (fallback?.vol ?? 0);
  const hasData = liveTicker || fallback;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 flex-wrap">
        <div>
          <span className="text-lg font-semibold">{selectedSymbol.replace("USDT", "")}</span>
          <span className="text-sm text-muted ml-1">/USDT</span>
        </div>
        {hasData && (
          <>
            <span className="text-2xl font-mono font-bold">${formatPrice(price)}</span>
            <PriceChange value={change} className="!text-base" />
            <div className="hidden md:flex items-center gap-4 text-xs text-muted">
              <div>
                <span className="block">24h High</span>
                <span className="text-white font-mono">${formatPrice(high)}</span>
              </div>
              <div>
                <span className="block">24h Low</span>
                <span className="text-white font-mono">${formatPrice(low)}</span>
              </div>
              <div>
                <span className="block">24h Volume</span>
                <span className="text-white font-mono">{formatCurrency(vol)}</span>
              </div>
            </div>
            {!liveTicker && (
              <span className="text-[10px] text-yellow-500/70 bg-yellow-500/10 px-2 py-0.5 rounded">
                Demo data
              </span>
            )}
          </>
        )}
        {!hasData && (
          <span className="text-sm text-muted animate-pulse">Waiting for market data...</span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4 min-w-0">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton lines={12} />}>
              <TradingChart />
            </Suspense>
          </ErrorBoundary>

          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Top Markets</h3>
            </div>
            <div className="widget-body">
              <ErrorBoundary>
                <MiniMarket />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Order Book</h3>
              <span className="text-xs text-muted font-mono">
                {selectedSymbol.replace("USDT", "")}/USDT
              </span>
            </div>
            <div className="p-2">
              <ErrorBoundary>
                <OrderBook />
              </ErrorBoundary>
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Watchlist</h3>
            </div>
            <div className="widget-body">
              <ErrorBoundary>
                <MiniWatchlist />
              </ErrorBoundary>
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Portfolio</h3>
            </div>
            <div className="widget-body">
              <ErrorBoundary>
                <MiniPortfolio />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
