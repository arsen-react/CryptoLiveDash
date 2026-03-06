import { cn } from "@/shared/utils/cn";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse space-y-3 p-4", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn("h-4 bg-surface-tertiary rounded", i === lines - 1 && "w-3/4")}
        />
      ))}
    </div>
  );
}
