import { useAppDispatch, useAppSelector } from "@/app/store";
import { setSelectedSymbol } from "@/features/market/marketSlice";
import { CoinSearch } from "@/shared/components/CoinSearch";
import { Modal } from "@/shared/components/Modal";
import { PriceChange } from "@/shared/components/PriceChange";
import { formatPrice, formatVolume } from "@/shared/utils/formatters";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToWatchlist, removeFromWatchlist } from "../watchlistSlice";

export default function Watchlist() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const items = useAppSelector((state) => state.watchlist.items);
  const liveTickers = useAppSelector((state) => state.market.liveTickers);

  function handleAddCoin(symbol: string) {
    dispatch(addToWatchlist(symbol));
    setShowAddModal(false);
  }

  function handleClickCoin(symbol: string) {
    dispatch(setSelectedSymbol(symbol));
    navigate("/");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Watchlist</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
        >
          + Add Coin
        </button>
      </div>

      {items.length === 0 ? (
        <div className="widget-card widget-body text-center text-muted py-12">
          <p className="text-sm">Your watchlist is empty</p>
          <p className="text-xs mt-1 mb-4">Search and add coins to track them here</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
          >
            + Add Coin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const ticker = liveTickers[item.symbol];
            const price = ticker ? parseFloat(ticker.price) : 0;
            const change = ticker ? parseFloat(ticker.priceChangePercent) : 0;
            const volume = ticker ? parseFloat(ticker.quoteVolume) : 0;
            const high = ticker ? parseFloat(ticker.highPrice) : 0;
            const low = ticker ? parseFloat(ticker.lowPrice) : 0;

            return (
              <div
                key={item.symbol}
                className="widget-card widget-body cursor-pointer hover:border-accent/30 transition-colors"
                onClick={() => handleClickCoin(item.symbol)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold text-sm">{item.symbol.replace("USDT", "")}</span>
                    <span className="text-xs text-muted ml-1">/USDT</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeFromWatchlist(item.symbol));
                    }}
                    className="text-xs text-muted hover:text-loss transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-mono font-semibold">${formatPrice(price)}</span>
                  <PriceChange value={change} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-muted">
                  <div>
                    <span className="block mb-0.5">24h High</span>
                    <span className="font-mono text-white">${formatPrice(high)}</span>
                  </div>
                  <div>
                    <span className="block mb-0.5">24h Low</span>
                    <span className="font-mono text-white">${formatPrice(low)}</span>
                  </div>
                  <div>
                    <span className="block mb-0.5">Volume</span>
                    <span className="font-mono text-white">${formatVolume(volume)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add to Watchlist">
        <CoinSearch onSelect={handleAddCoin} placeholder="Search for a coin..." />
      </Modal>
    </div>
  );
}
