import { useAppDispatch, useAppSelector } from "@/app/store";
import { OrderBook } from "@/features/market/components/OrderBook";
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton";
import { PriceChange } from "@/shared/components/PriceChange";
import type { WidgetConfig, WidgetType } from "@/shared/types/common";
import { formatCurrency, formatPrice } from "@/shared/utils/formatters";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { lazy, Suspense, type ReactNode } from "react";
import { moveWidget, resetLayout, toggleWidgetVisibility } from "../dashboardSlice";
import { layoutKeyboardCoordinates } from "../layoutKeyboardCoordinates";
import { MiniMarket } from "./MiniMarket";
import { MiniPortfolio } from "./MiniPortfolio";
import { MiniWatchlist } from "./MiniWatchlist";
import { WidgetWrapper } from "./WidgetWrapper";

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

const WIDGETS: Partial<Record<WidgetType, { render: () => ReactNode; bodyClassName?: string }>> = {
  chart: {
    render: () => (
      <Suspense fallback={<LoadingSkeleton lines={12} />}>
        <TradingChart />
      </Suspense>
    ),
    bodyClassName: "p-3",
  },
  "order-book": { render: () => <OrderBook />, bodyClassName: "p-2" },
  "market-overview": { render: () => <MiniMarket /> },
  watchlist: { render: () => <MiniWatchlist /> },
  portfolio: { render: () => <MiniPortfolio /> },
};

const COLUMN_SPANS: Record<number, string> = {
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  6: "xl:col-span-6",
  8: "xl:col-span-8",
  12: "xl:col-span-12",
};

const isSupported = (widget: WidgetConfig) => widget.type in WIDGETS;

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const selectedSymbol = useAppSelector((state) => state.market.selectedSymbol);
  const liveTicker = useAppSelector((state) => state.market.liveTickers[selectedSymbol]);
  const widgets = useAppSelector((state) => state.dashboard.widgets);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: layoutKeyboardCoordinates }),
  );

  const visibleWidgets = widgets.filter((w) => w.visible && isSupported(w));
  const hiddenWidgets = widgets.filter((w) => !w.visible && isSupported(w));

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      dispatch(moveWidget({ id: String(active.id), overId: String(over.id) }));
    }
  }

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
            <PriceChange value={change} className="text-base!" />
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
              <span className="text-[10px] text-yellow-500/70 bg-yellow-500/10 px-2 py-0.5 rounded-sm">
                Demo data
              </span>
            )}
          </>
        )}
        {!hasData && (
          <span className="text-sm text-muted animate-pulse">Waiting for market data...</span>
        )}

        <div className="flex items-center gap-2 flex-wrap ml-auto text-xs">
          {hiddenWidgets.map((widget) => (
            <button
              key={widget.id}
              type="button"
              onClick={() => dispatch(toggleWidgetVisibility(widget.id))}
              className="px-2.5 py-1 rounded-lg border border-dashed border-border text-muted hover:text-white hover:border-accent/50 transition-colors"
            >
              + {widget.title}
            </button>
          ))}
          <button
            type="button"
            onClick={() => dispatch(resetLayout())}
            className="px-2.5 py-1 rounded-lg text-muted hover:text-white hover:bg-surface-hover transition-colors"
          >
            Reset layout
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {visibleWidgets.map((widget) => {
              const config = WIDGETS[widget.type];
              return (
                <WidgetWrapper
                  key={widget.id}
                  id={widget.id}
                  title={widget.title}
                  onHide={() => dispatch(toggleWidgetVisibility(widget.id))}
                  className={COLUMN_SPANS[widget.size.w] ?? "xl:col-span-4"}
                  bodyClassName={config?.bodyClassName}
                  extra={
                    widget.type === "order-book" && (
                      <span className="text-xs text-muted font-mono">
                        {selectedSymbol.replace("USDT", "")}/USDT
                      </span>
                    )
                  }
                >
                  {config?.render()}
                </WidgetWrapper>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
