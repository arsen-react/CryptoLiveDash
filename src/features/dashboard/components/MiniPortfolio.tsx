import { useAppSelector } from "@/app/store";
import { PriceChange } from "@/shared/components/PriceChange";
import { formatCurrency } from "@/shared/utils/formatters";
import { useNavigate } from "react-router-dom";

export function MiniPortfolio() {
  const navigate = useNavigate();
  const positions = useAppSelector((state) => state.portfolio.positions);
  const liveTickers = useAppSelector((state) => state.market.liveTickers);

  const enriched = positions.map((pos) => {
    const ticker = liveTickers[pos.symbol];
    const currentPrice = ticker ? parseFloat(ticker.price) : pos.buyPrice;
    const currentValue = currentPrice * pos.amount;
    const costBasis = pos.buyPrice * pos.amount;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { ...pos, currentValue, pnl, pnlPercent };
  });

  const totalValue = enriched.reduce((sum, p) => sum + p.currentValue, 0);
  const totalPnL = enriched.reduce((sum, p) => sum + p.pnl, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.amount, 0);
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <div className="text-xs">
      {/* Summary */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
        <div>
          <p className="text-muted mb-0.5">Total Value</p>
          <p className="text-lg font-semibold font-mono">{formatCurrency(totalValue)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted mb-0.5">P&L</p>
          <PriceChange value={totalPnLPercent} className="!text-sm" />
        </div>
      </div>

      {positions.length === 0 ? (
        <p className="text-muted text-center py-4">
          No positions yet.{" "}
          <button onClick={() => navigate("/portfolio")} className="text-accent hover:text-accent-hover">
            Add one
          </button>
        </p>
      ) : (
        <div className="space-y-2">
          {enriched.slice(0, 5).map((pos) => (
            <div key={pos.id} className="flex items-center justify-between py-1">
              <span className="font-medium">{pos.symbol.replace("USDT", "")}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-muted">{formatCurrency(pos.currentValue)}</span>
                <PriceChange value={pos.pnlPercent} className="!text-xs w-16 text-right" />
              </div>
            </div>
          ))}
          {positions.length > 5 && (
            <button
              onClick={() => navigate("/portfolio")}
              className="text-accent hover:text-accent-hover w-full text-center pt-1"
            >
              View all ({positions.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
