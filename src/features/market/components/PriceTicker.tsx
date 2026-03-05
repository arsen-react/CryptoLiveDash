import { memo } from "react";
import { useAppSelector } from "@/app/store";
import { PriceChange } from "@/shared/components/PriceChange";
import { formatPrice } from "@/shared/utils/formatters";
import { TOP_SYMBOLS } from "@/shared/utils/constants";
import type { Ticker } from "@/shared/types/market";

export const PriceTicker = memo(function PriceTicker() {
  const liveTickers = useAppSelector((state) => state.market.liveTickers);

  const symbols = TOP_SYMBOLS.slice(0, 12);
  const items: Ticker[] = [];
  for (const symbol of symbols) {
    const t = liveTickers[symbol];
    if (t) items.push(t);
  }

  if (items.length === 0) return null;

  const tickerContent = items.map((ticker) => {
    const changePercent = parseFloat(ticker.priceChangePercent);
    return (
      <div key={ticker.symbol} className="flex items-center gap-2 shrink-0 px-4">
        <span className="text-xs font-medium text-white/80">
          {ticker.symbol.replace("USDT", "")}
        </span>
        <span className="text-xs font-mono text-white">
          ${formatPrice(parseFloat(ticker.price))}
        </span>
        <PriceChange value={changePercent} className="!text-xs" />
      </div>
    );
  });

  return (
    <div className="h-8 bg-surface border-b border-border flex items-center overflow-hidden relative">
      <div className="flex items-center ticker-scroll">
        {tickerContent}
        {tickerContent}
      </div>
    </div>
  );
});
