import { cn } from "@/shared/utils/cn";
import { formatPercent } from "@/shared/utils/formatters";

interface PriceChangeProps {
  value: number;
  className?: string;
  showSign?: boolean;
}

export function PriceChange({ value, className, showSign = true }: PriceChangeProps) {
  const isPositive = value >= 0;

  return (
    <span
      className={cn(
        "font-mono text-sm font-medium",
        isPositive ? "text-gain" : "text-loss",
        className,
      )}
    >
      {showSign ? formatPercent(value) : `${Math.abs(value).toFixed(2)}%`}
    </span>
  );
}
