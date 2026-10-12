import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { cn } from "@/shared/utils/cn";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type ReactNode } from "react";

interface WidgetWrapperProps {
  id: string;
  title: string;
  children: ReactNode;
  /** Shown in the header, before the hide button. */
  extra?: ReactNode;
  onHide?: () => void;
  className?: string;
  bodyClassName?: string;
}

/** Dashboard card that can be dragged by its handle, with the mouse or the keyboard. */
export function WidgetWrapper({
  id,
  title,
  children,
  extra,
  onHide,
  className,
  bodyClassName = "widget-body",
}: WidgetWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <section
      ref={setNodeRef}
      aria-label={title}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "widget-card min-w-0",
        isDragging && "relative z-50 opacity-80 shadow-2xl ring-1 ring-accent/40",
        className,
      )}
    >
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <button
            ref={setActivatorNodeRef}
            type="button"
            aria-label={`Move ${title}`}
            className="-ml-1 p-1 rounded text-muted hover:text-white hover:bg-surface-hover cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <circle cx="4" cy="2.5" r="1" />
              <circle cx="8" cy="2.5" r="1" />
              <circle cx="4" cy="6" r="1" />
              <circle cx="8" cy="6" r="1" />
              <circle cx="4" cy="9.5" r="1" />
              <circle cx="8" cy="9.5" r="1" />
            </svg>
          </button>
          <h3 className="widget-title">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {extra}
          {onHide && (
            <button
              type="button"
              onClick={onHide}
              aria-label={`Hide ${title}`}
              className="text-xs text-muted hover:text-white transition-colors"
            >
              Hide
            </button>
          )}
        </div>
      </div>
      <div className={bodyClassName}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </section>
  );
}
