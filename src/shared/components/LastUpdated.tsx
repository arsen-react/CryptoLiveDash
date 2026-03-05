import { useState, useEffect } from "react";
import { cn } from "@/shared/utils/cn";

interface LastUpdatedProps {
  timestamp: number | null;
  isLive?: boolean;
  isMock?: boolean;
  className?: string;
}

export function LastUpdated({ timestamp, isLive, isMock, className }: LastUpdatedProps) {
  const [, forceUpdate] = useState(0);

  // Re-render every 10s to update relative time
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 10_000);
    return () => clearInterval(interval);
  }, []);

  if (isMock) {
    return (
      <span className={cn("text-[10px] text-yellow-500/70 font-medium", className)}>
        Demo data
      </span>
    );
  }

  if (!timestamp) return null;

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  let label: string;
  if (seconds < 5) label = "just now";
  else if (seconds < 60) label = `${seconds}s ago`;
  else if (seconds < 3600) label = `${Math.floor(seconds / 60)}m ago`;
  else label = `${Math.floor(seconds / 3600)}h ago`;

  return (
    <span className={cn("text-[10px] text-muted/60", className)}>
      {isLive && (
        <span className="inline-block w-1 h-1 rounded-full bg-gain mr-1 align-middle" />
      )}
      {label}
    </span>
  );
}
