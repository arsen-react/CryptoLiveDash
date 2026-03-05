import { useGetOrderBookQuery } from "../marketApi";
import { useAppSelector } from "@/app/store";
import { LastUpdated } from "@/shared/components/LastUpdated";
import { formatPrice } from "@/shared/utils/formatters";
import { generateMockOrderBook } from "@/shared/utils/mockData";

export function OrderBook() {
  const symbol = useAppSelector((state) => state.market.selectedSymbol);
  const { data, isLoading, error, fulfilledTimeStamp } = useGetOrderBookQuery(
    { symbol, limit: 15 },
    { pollingInterval: 2000 },
  );

  const mockData = generateMockOrderBook(symbol);
  const book = data ?? { lastUpdateId: 0, bids: mockData.bids, asks: mockData.asks };
  const isMock = !data;

  const maxBidQty = Math.max(...book.bids.map((b) => parseFloat(b.quantity)), 0.001);
  const maxAskQty = Math.max(...book.asks.map((a) => parseFloat(a.quantity)), 0.001);

  return (
    <div className="text-xs relative">
      {/* Status bar */}
      <div className="flex items-center justify-between px-2 pb-1.5 mb-1">
        <div className="flex items-center gap-2">
          {isLoading && <span className="text-[10px] text-accent animate-pulse">Updating...</span>}
          {error && isMock && (
            <span className="text-[10px] text-yellow-500/70">Demo</span>
          )}
        </div>
        <LastUpdated
          timestamp={fulfilledTimeStamp ?? null}
          isMock={isMock && !isLoading}
          isLive={!isMock}
        />
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-2 gap-0.5 text-muted px-2 py-1 border-b border-border">
        <span>Price (USDT)</span>
        <span className="text-right">Amount</span>
      </div>

      {/* Asks (sells) - reversed so lowest ask is at bottom */}
      <div className="space-y-px">
        {[...book.asks].reverse().slice(0, 10).map((ask, i) => {
          const price = parseFloat(ask.price);
          const qty = parseFloat(ask.quantity);
          const width = (qty / maxAskQty) * 100;

          return (
            <div key={i} className="relative grid grid-cols-2 px-2 py-0.5">
              <div
                className="absolute right-0 top-0 bottom-0 bg-loss/10"
                style={{ width: `${width}%` }}
              />
              <span className="font-mono text-loss relative z-10">
                {formatPrice(price)}
              </span>
              <span className="font-mono text-right relative z-10">
                {qty.toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Spread */}
      <div className="px-2 py-1.5 text-center border-y border-border text-muted">
        Spread:{" "}
        {book.asks[0] && book.bids[0]
          ? (parseFloat(book.asks[0].price) - parseFloat(book.bids[0].price)).toFixed(2)
          : "—"}
      </div>

      {/* Bids (buys) */}
      <div className="space-y-px">
        {book.bids.slice(0, 10).map((bid, i) => {
          const price = parseFloat(bid.price);
          const qty = parseFloat(bid.quantity);
          const width = (qty / maxBidQty) * 100;

          return (
            <div key={i} className="relative grid grid-cols-2 px-2 py-0.5">
              <div
                className="absolute right-0 top-0 bottom-0 bg-gain/10"
                style={{ width: `${width}%` }}
              />
              <span className="font-mono text-gain relative z-10">
                {formatPrice(price)}
              </span>
              <span className="font-mono text-right relative z-10">
                {qty.toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mock overlay */}
      {isMock && !isLoading && (
        <div className="absolute top-0 right-0 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-medium px-1.5 py-0.5 rounded-bl">
          Demo
        </div>
      )}
    </div>
  );
}
