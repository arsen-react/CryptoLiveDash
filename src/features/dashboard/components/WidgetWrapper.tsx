import { type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/shared/utils/cn";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

interface WidgetWrapperProps {
  id: string;
  title: string;
  children: ReactNode;
  onRemove?: () => void;
}

export function WidgetWrapper({ id, title, children, onRemove }: WidgetWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "widget-card",
        isDragging && "opacity-50 z-50 shadow-2xl",
      )}
    >
      <div className="widget-header" {...attributes} {...listeners}>
        <h3 className="widget-title cursor-grab active:cursor-grabbing">{title}</h3>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-muted hover:text-loss transition-colors"
          >
            Remove
          </button>
        )}
      </div>
      <div className="widget-body">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
