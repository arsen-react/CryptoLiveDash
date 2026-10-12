import { useAppDispatch, useAppSelector } from "@/app/store";
import { setTimeframe } from "../chartSlice";
import { TIMEFRAMES } from "@/shared/utils/constants";
import type { Timeframe } from "@/shared/types/market";
import { cn } from "@/shared/utils/cn";

export function TimeframeSelector() {
  const dispatch = useAppDispatch();
  const activeTimeframe = useAppSelector((state) => state.chart.timeframe);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          onClick={() => dispatch(setTimeframe(tf.value as Timeframe))}
          aria-pressed={activeTimeframe === tf.value}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded transition-colors",
            activeTimeframe === tf.value
              ? "bg-accent text-white"
              : "text-muted hover:text-white hover:bg-surface-hover",
          )}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
