import { useAppDispatch, useAppSelector } from "@/app/store";
import { PriceChange } from "@/shared/components/PriceChange";
import { formatCurrency, formatPrice } from "@/shared/utils/formatters";
import { useState } from "react";
import { removePosition } from "../portfolioSlice";
import { AddPositionModal } from "./AddPositionModal";

export default function Portfolio() {
  const dispatch = useAppDispatch();
  const [showAddModal, setShowAddModal] = useState(false);
  const positions = useAppSelector((state) => state.portfolio.positions);
  const liveTickers = useAppSelector((state) => state.market.liveTickers);

  const enriched = positions.map((pos) => {
    const ticker = liveTickers[pos.symbol];
    const currentPrice = ticker ? parseFloat(ticker.price) : pos.buyPrice;
    const currentValue = currentPrice * pos.amount;
    const costBasis = pos.buyPrice * pos.amount;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

    return { ...pos, currentPrice, currentValue, costBasis, pnl, pnlPercent };
  });

  const totalValue = enriched.reduce((sum, p) => sum + p.currentValue, 0);
  const totalCost = enriched.reduce((sum, p) => sum + p.costBasis, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Portfolio</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
        >
          + Add Position
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="widget-card widget-body">
          <p className="text-xs text-muted mb-1">Total Value</p>
          <p className="text-2xl font-semibold font-mono">{formatCurrency(totalValue)}</p>
        </div>
        <div className="widget-card widget-body">
          <p className="text-xs text-muted mb-1">Total Cost</p>
          <p className="text-2xl font-semibold font-mono">{formatCurrency(totalCost)}</p>
        </div>
        <div className="widget-card widget-body">
          <p className="text-xs text-muted mb-1">Total P&L</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold font-mono">
              {totalPnL >= 0 ? "+" : "-"}${formatCurrency(Math.abs(totalPnL)).slice(1)}
            </p>
            <PriceChange value={totalPnLPercent} />
          </div>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="widget-card widget-body text-center text-muted py-12">
          <p className="text-sm">No positions yet</p>
          <p className="text-xs mt-1 mb-4">
            Add your first position to start tracking your portfolio
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
          >
            + Add Position
          </button>
        </div>
      ) : (
        <div className="widget-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted border-b border-border">
                <th className="text-left px-4 py-3 font-medium">Asset</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-right px-4 py-3 font-medium">Avg. Buy</th>
                <th className="text-right px-4 py-3 font-medium">Current</th>
                <th className="text-right px-4 py-3 font-medium">Value</th>
                <th className="text-right px-4 py-3 font-medium">P&L</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((pos) => (
                <tr
                  key={pos.id}
                  className="border-b border-border/50 hover:bg-surface-hover transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {pos.symbol.replace("USDT", "")}
                    <span className="text-xs text-muted ml-1">/USDT</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">{pos.amount}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-muted">
                    ${formatPrice(pos.buyPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    ${formatPrice(pos.currentPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {formatCurrency(pos.currentValue)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className={pos.pnl >= 0 ? "text-gain" : "text-loss"}>
                        {pos.pnl >= 0 ? "+" : "-"}${formatPrice(Math.abs(pos.pnl))}
                      </span>
                      <PriceChange value={pos.pnlPercent} className="!text-xs" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => dispatch(removePosition(pos.id))}
                      className="text-xs text-muted hover:text-loss transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddPositionModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
