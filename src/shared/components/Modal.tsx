import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "bg-surface-secondary border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in",
          className,
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 id={titleId} className="text-sm font-semibold">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-white transition-colors text-lg leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
