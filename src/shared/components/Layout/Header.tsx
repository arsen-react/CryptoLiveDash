import { useAppDispatch } from "@/app/store";
import { setSelectedSymbol } from "@/features/market/marketSlice";
import { CoinSearch } from "@/shared/components/CoinSearch";
import { Modal } from "@/shared/components/Modal";
import { cn } from "@/shared/utils/cn";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  connectionStatus: "connecting" | "open" | "closed" | "error";
}

export function Header({ connectionStatus }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelectCoin(symbol: string) {
    dispatch(setSelectedSymbol(symbol));
    setSearchOpen(false);
    navigate("/");
  }

  return (
    <>
      <header className="h-12 bg-surface-secondary border-b border-border flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#6366f1" />
              <path
                d="M10 20L14 12L18 16L22 10"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="22" cy="10" r="2" fill="#22c55e" />
            </svg>
            <h1 className="text-sm font-semibold tracking-tight" style={{ cursor: "pointer" }}>
              <span className="text-accent">Crypto</span>
              <span className="text-white">LiveDash</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted border border-border rounded-lg hover:border-accent/50 hover:text-white transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[10px] text-muted/60 bg-surface px-1.5 py-0.5 rounded border border-border">
              /
            </kbd>
          </button>

          <div className="flex items-center gap-2 text-xs text-muted">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                connectionStatus === "open" && "bg-gain shadow-[0_0_6px_rgba(34,197,94,0.5)]",
                connectionStatus === "connecting" && "bg-yellow-500 animate-pulse",
                connectionStatus === "closed" && "bg-muted",
                connectionStatus === "error" && "bg-loss",
              )}
            />
            <span className="hidden sm:inline">
              {connectionStatus === "open"
                ? "Live"
                : connectionStatus === "connecting"
                  ? "Connecting..."
                  : connectionStatus === "error"
                    ? "Disconnected"
                    : "Offline"}
            </span>
          </div>
        </div>
      </header>

      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Search Coin">
        <CoinSearch onSelect={handleSelectCoin} placeholder="Search by symbol..." />
      </Modal>
    </>
  );
}
