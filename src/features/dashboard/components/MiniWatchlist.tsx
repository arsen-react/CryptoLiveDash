import { useAppSelector, useAppDispatch } from "@/app/store";
import { setSelectedSymbol } from "@/features/market/marketSlice";
import { PriceChange } from "@/shared/components/PriceChange";
import { formatPrice } from "@/shared/utils/formatters";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

export function MiniWatchlist() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((state) => state.watchlist.items);
  const liveTickers = useAppSelector((state) => state.market.liveTickers);
  const selectedSymbol = useAppSelector((state) => state.market.selectedSymbol);

  if (items.length === 0) {
    return (
      <p className="text-xs text-muted text-center py-4">
        No coins in watchlist.{" "}
        <button onClick={() => navigate("/watchlist")} className="text-accent hover:text-accent-hover">
          Add some
        </button>
      </p>
    );
  }

  return (
    <div className="text-xs space-y-0.5">
      {items.map((item) => {
        const ticker = liveTickers[item.symbol];
        const price = ticker ? parseFloat(ticker.price) : 0;
        const change = ticker ? parseFloat(ticker.priceChangePercent) : 0;
        const isSelected = item.symbol === selectedSymbol;

        return (
          <button
            key={item.symbol}
            onClick={() => dispatch(setSelectedSymbol(item.symbol))}
            className={cn(
              "w-full flex items-center justify-between px-2 py-1.5 rounded transition-colors",
              isSelected ? "bg-accent/10 text-accent" : "hover:bg-surface-hover",
            )}
          >
            <span className="font-medium">{item.symbol.replace("USDT", "")}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono">${formatPrice(price)}</span>
              <PriceChange value={change} className="!text-xs w-16 text-right" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
