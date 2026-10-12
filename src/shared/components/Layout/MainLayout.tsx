import { useAppDispatch, useAppSelector } from "@/app/store";
import { PriceTicker } from "@/features/market/components/PriceTicker";
import { setWsStatus, updateTickers } from "@/features/market/marketSlice";
import { miniTickerToTicker } from "@/features/market/miniTicker";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import type { WebSocketMiniTickerMessage } from "@/shared/types/market";
import { BINANCE_WS_URL } from "@/shared/utils/constants";
import { useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function MainLayout() {
  const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector((state) => state.market.wsStatus);

  const handleMessage = useCallback(
    (data: WebSocketMiniTickerMessage | WebSocketMiniTickerMessage[]) => {
      const messages = Array.isArray(data) ? data : [data];
      const tickers = messages.filter((m) => m.s?.endsWith("USDT")).map(miniTickerToTicker);

      if (tickers.length > 0) {
        dispatch(updateTickers(tickers));
      }
    },
    [dispatch],
  );

  // Binance retired the full "!ticker@arr" stream; the mini-ticker stream still
  // updates every second for every pair that traded.
  const { status } = useWebSocket<WebSocketMiniTickerMessage[]>({
    url: `${BINANCE_WS_URL}/!miniTicker@arr`,
    onMessage: handleMessage,
  });

  if (status !== connectionStatus) {
    dispatch(setWsStatus(status));
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header connectionStatus={status} />
      <PriceTicker />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
