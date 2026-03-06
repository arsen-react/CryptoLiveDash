import { useAppDispatch, useAppSelector } from "@/app/store";
import { useGetTickersQuery } from "@/features/market/marketApi";
import { setSelectedSymbol } from "@/features/market/marketSlice";
import { LastUpdated } from "@/shared/components/LastUpdated";
import { PriceChange } from "@/shared/components/PriceChange";
import type { Ticker } from "@/shared/types/market";
import { cn } from "@/shared/utils/cn";
import { TOP_SYMBOLS } from "@/shared/utils/constants";
import { formatPrice, formatVolume } from "@/shared/utils/formatters";
import { generateMockTickers } from "@/shared/utils/mockData";

export function MiniMarket() {
  const dispatch = useAppDispatch();
  const { data: tickers, isLoading, fulfilledTimeStamp } = useGetTickersQuery();
  const liveTickers = useAppSelector((state) => state.market.liveTickers);
  const selectedSymbol = useAppSelector((state) => state.market.selectedSymbol);

  const mockTickers = generateMockTickers();
  const source: Ticker[] = tickers ?? mockTickers;
  const isMock = !tickers;

  const top10 = source
    .filter((t) => TOP_SYMBOLS.includes(t.symbol))
    .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
    .slice(0, 10);

  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isLoading && <span className="text-[10px] text-accent animate-pulse">Loading...</span>}
          {isMock && !isLoading && (
            <span className="text-[10px] text-yellow-500/70">Demo data</span>
          )}
        </div>
        <LastUpdated
          timestamp={fulfilledTimeStamp ?? null}
          isMock={isMock && !isLoading}
          isLive={!isMock}
        />
      </div>

      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-muted px-1 pb-2 border-b border-border mb-1">
        <span>Pair</span>
        <span className="text-right">Price</span>
        <span className="text-right">24h</span>
        <span className="text-right hidden sm:block">Vol</span>
      </div>

      <div className="space-y-0.5">
        {top10.map((ticker) => {
          const live = liveTickers[ticker.symbol];
          const price = live?.price ?? ticker.price;
          const change = parseFloat(live?.priceChangePercent ?? ticker.priceChangePercent);
          const vol = parseFloat(live?.quoteVolume ?? ticker.quoteVolume);
          const isSelected = ticker.symbol === selectedSymbol;

          return (
            <button
              key={ticker.symbol}
              onClick={() => dispatch(setSelectedSymbol(ticker.symbol))}
              className={cn(
                "w-full grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center px-1 py-1.5 rounded transition-colors",
                isSelected ? "bg-accent/10" : "hover:bg-surface-hover",
              )}
            >
              <span className="font-medium text-left">
                {ticker.symbol.replace("USDT", "")}
                <span className="text-muted">/USDT</span>
              </span>
              <span className="font-mono text-right">${formatPrice(parseFloat(price))}</span>
              <PriceChange value={change} className="!text-xs text-right" />
              <span className="font-mono text-muted text-right hidden sm:block">
                ${formatVolume(vol)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
