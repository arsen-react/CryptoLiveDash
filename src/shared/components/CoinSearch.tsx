import { useGetTickersQuery } from "@/features/market/marketApi";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { formatPrice } from "@/shared/utils/formatters";
import { generateMockTickers } from "@/shared/utils/mockData";
import { useMemo, useState } from "react";
import { PriceChange } from "./PriceChange";

interface CoinSearchProps {
  onSelect: (symbol: string) => void;
  placeholder?: string;
}

export function CoinSearch({ onSelect, placeholder = "Search coin..." }: CoinSearchProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const { data: tickers } = useGetTickersQuery();

  const filtered = useMemo(() => {
    const source = tickers ?? generateMockTickers();
    const q = debouncedQuery.toUpperCase();
    return source
      .filter((t) => t.symbol.includes(q) || t.symbol.replace("USDT", "").includes(q))
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 20);
  }, [tickers, debouncedQuery]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted outline-none focus:border-accent transition-colors"
      />
      <div className="mt-2 max-h-64 overflow-y-auto space-y-0.5">
        {filtered.map((ticker) => (
          <button
            key={ticker.symbol}
            onClick={() => {
              onSelect(ticker.symbol);
              setQuery("");
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{ticker.symbol.replace("USDT", "")}</span>
              <span className="text-xs text-muted">/USDT</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono">${formatPrice(parseFloat(ticker.price))}</span>
              <PriceChange value={parseFloat(ticker.priceChangePercent)} className="!text-xs" />
            </div>
          </button>
        ))}
        {filtered.length === 0 && query && (
          <p className="text-xs text-muted text-center py-4">No coins found</p>
        )}
      </div>
    </div>
  );
}
