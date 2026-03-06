import { useAppDispatch, useAppSelector } from "@/app/store";
import { CoinSearch } from "@/shared/components/CoinSearch";
import { Modal } from "@/shared/components/Modal";
import { cn } from "@/shared/utils/cn";
import { formatPrice } from "@/shared/utils/formatters";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { addAlert } from "../alertsSlice";

interface FormData {
  targetPrice: number;
}

interface CreateAlertModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAlertModal({ open, onClose }: CreateAlertModalProps) {
  const dispatch = useAppDispatch();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [condition, setCondition] = useState<"above" | "below">("above");
  const liveTicker = useAppSelector((state) =>
    selectedSymbol ? state.market.liveTickers[selectedSymbol] : null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  function onSubmit(data: FormData) {
    if (!selectedSymbol) return;
    dispatch(addAlert({ symbol: selectedSymbol, targetPrice: data.targetPrice, condition }));

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

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
    <Modal open={open} onClose={handleClose} title="Create Price Alert">
      {!selectedSymbol ? (
        <CoinSearch onSelect={setSelectedSymbol} placeholder="Search for a coin..." />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
            <div>
              <span className="text-sm font-semibold">{selectedSymbol.replace("USDT", "")}</span>
              <span className="text-xs text-muted ml-1">/USDT</span>
              {liveTicker && (
                <span className="text-xs text-muted ml-2">
                  Current:{" "}
                  <span className="text-white font-mono">
                    ${formatPrice(parseFloat(liveTicker.price))}
                  </span>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedSymbol(null)}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              Change
            </button>
          </div>

          <div>
            <label className="block text-xs text-muted mb-2">Condition</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition("above")}
                className={cn(
                  "px-3 py-2 text-sm rounded-lg border transition-colors",
                  condition === "above"
                    ? "border-gain bg-gain/10 text-gain"
                    : "border-border text-muted hover:text-white",
                )}
              >
                Price goes above
              </button>
              <button
                type="button"
                onClick={() => setCondition("below")}
                className={cn(
                  "px-3 py-2 text-sm rounded-lg border transition-colors",
                  condition === "below"
                    ? "border-loss bg-loss/10 text-loss"
                    : "border-border text-muted hover:text-white",
                )}
              >
                Price goes below
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Target Price (USD)</label>
            <input
              type="number"
              step="any"
              {...register("targetPrice", { valueAsNumber: true, required: true, min: 0.000001 })}
              placeholder="0.00"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted outline-none focus:border-accent transition-colors font-mono"
            />
            {errors.targetPrice && <p className="text-xs text-loss mt-1">Enter a valid price</p>}
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
              Create Alert
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
