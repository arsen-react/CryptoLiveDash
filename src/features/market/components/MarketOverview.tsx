import { useNavigate } from "react-router-dom";
import { useGetTickersQuery } from "../marketApi";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { setSelectedSymbol } from "../marketSlice";
import { PriceChange } from "@/shared/components/PriceChange";
import { LastUpdated } from "@/shared/components/LastUpdated";
import { formatPrice, formatVolume } from "@/shared/utils/formatters";
import { generateMockTickers } from "@/shared/utils/mockData";
import { TOP_SYMBOLS } from "@/shared/utils/constants";
import { cn } from "@/shared/utils/cn";
import type { Ticker } from "@/shared/types/market";

export default function MarketOverview() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: tickers, isLoading, fulfilledTimeStamp } = useGetTickersQuery();
  const liveTickers = useAppSelector((state) => state.market.liveTickers);
  const selectedSymbol = useAppSelector((state) => state.market.selectedSymbol);

  const source: Ticker[] = tickers ?? generateMockTickers();
  const isMock = !tickers;

  const filteredTickers = source
    .filter((t) => TOP_SYMBOLS.includes(t.symbol))
    .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));

  function handleRowClick(symbol: string) {
    dispatch(setSelectedSymbol(symbol));
    navigate("/");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Market Overview</h2>
          {isLoading && <span className="text-xs text-accent animate-pulse">Loading...</span>}
          {isMock && !isLoading && (
            <span className="text-xs text-yellow-500/70 bg-yellow-500/10 px-2 py-0.5 rounded">Demo data</span>
          )}
        </div>
        <LastUpdated
          timestamp={fulfilledTimeStamp ?? null}
          isMock={isMock && !isLoading}
          isLive={!isMock}
        />
      </div>

      <div className="widget-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted border-b border-border">
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Pair</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-right px-4 py-3 font-medium">24h Change</th>
              <th className="text-right px-4 py-3 font-medium hidden md:table-cell">24h High</th>
              <th className="text-right px-4 py-3 font-medium hidden md:table-cell">24h Low</th>
              <th className="text-right px-4 py-3 font-medium">Volume (USDT)</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickers.map((ticker, index) => {
              const live = liveTickers[ticker.symbol];
              const price = live?.price ?? ticker.price;
              const changePercent = parseFloat(
                live?.priceChangePercent ?? ticker.priceChangePercent,
              );
              const isSelected = ticker.symbol === selectedSymbol;

              return (
                <tr
                  key={ticker.symbol}
                  onClick={() => handleRowClick(ticker.symbol)}
                  className={cn(
                    "border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer",
                    isSelected && "bg-accent/5 border-l-2 border-l-accent",
                  )}
                >
                  <td className="px-4 py-3 text-sm text-muted">{index + 1}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">
                      {ticker.symbol.replace("USDT", "")}
                    </span>
                    <span className="text-xs text-muted ml-1">/USDT</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    ${formatPrice(parseFloat(price))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PriceChange value={changePercent} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-muted hidden md:table-cell">
                    ${formatPrice(parseFloat(live?.highPrice ?? ticker.highPrice))}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-muted hidden md:table-cell">
                    ${formatPrice(parseFloat(live?.lowPrice ?? ticker.lowPrice))}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-muted">
                    ${formatVolume(parseFloat(live?.quoteVolume ?? ticker.quoteVolume))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
