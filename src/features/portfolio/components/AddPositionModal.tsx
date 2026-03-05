import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/shared/components/Modal";
import { CoinSearch } from "@/shared/components/CoinSearch";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { addPosition } from "../portfolioSlice";
import { formatPrice } from "@/shared/utils/formatters";

interface FormData {
  amount: number;
  buyPrice: number;
}

interface AddPositionModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddPositionModal({ open, onClose }: AddPositionModalProps) {
  const dispatch = useAppDispatch();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const liveTicker = useAppSelector(
    (state) => selectedSymbol ? state.market.liveTickers[selectedSymbol] : null,
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  function handleSelectCoin(symbol: string) {
    setSelectedSymbol(symbol);
    const ticker = liveTicker;
    if (ticker) {
      setValue("buyPrice", parseFloat(parseFloat(ticker.price).toFixed(2)));
    }
  }

  function onSubmit(data: FormData) {
    if (!selectedSymbol) return;
    dispatch(addPosition({ symbol: selectedSymbol, amount: data.amount, buyPrice: data.buyPrice }));
    reset();
    setSelectedSymbol(null);
    onClose();
  }

  function handleClose() {
    reset();
    setSelectedSymbol(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add Position">
      {!selectedSymbol ? (
        <CoinSearch onSelect={handleSelectCoin} placeholder="Search for a coin to add..." />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
            <div>
              <span className="text-sm font-semibold">
                {selectedSymbol.replace("USDT", "")}
              </span>
              <span className="text-xs text-muted ml-1">/USDT</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSymbol(null)}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              Change
            </button>
          </div>

          {liveTicker && (
            <p className="text-xs text-muted">
              Current price: <span className="text-white font-mono">${formatPrice(parseFloat(liveTicker.price))}</span>
            </p>
          )}

          <div>
            <label className="block text-xs text-muted mb-1.5">Amount</label>
            <input
              type="number"
              step="any"
              {...register("amount", { valueAsNumber: true, required: true, min: 0.000001 })}
              placeholder="0.00"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted outline-none focus:border-accent transition-colors font-mono"
            />
            {errors.amount && (
              <p className="text-xs text-loss mt-1">Enter a valid amount</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Buy Price (USD)</label>
            <input
              type="number"
              step="any"
              {...register("buyPrice", { valueAsNumber: true, required: true, min: 0.000001 })}
              placeholder="0.00"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted outline-none focus:border-accent transition-colors font-mono"
            />
            {errors.buyPrice && (
              <p className="text-xs text-loss mt-1">Enter a valid price</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm text-muted border border-border rounded-lg hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
            >
              Add Position
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
