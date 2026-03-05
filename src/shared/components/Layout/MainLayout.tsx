import { useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { PriceTicker } from "@/features/market/components/PriceTicker";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { updateTickers, setWsStatus } from "@/features/market/marketSlice";
import { BINANCE_WS_URL } from "@/shared/utils/constants";
import type { Ticker, WebSocketTickerMessage } from "@/shared/types/market";

export function MainLayout() {
  const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector((state) => state.market.wsStatus);

  const handleMessage = useCallback(
    (data: WebSocketTickerMessage | WebSocketTickerMessage[]) => {
      const messages = Array.isArray(data) ? data : [data];
      const tickers: Ticker[] = messages
        .filter((m) => m.s?.endsWith("USDT"))
        .map((m) => ({
          symbol: m.s,
          price: m.c,
          priceChange: m.p,
          priceChangePercent: m.P,
          highPrice: m.h,
          lowPrice: m.l,
          volume: m.v,
          quoteVolume: m.q,
        }));

      if (tickers.length > 0) {
        dispatch(updateTickers(tickers));
      }
    },
    [dispatch],
  );

  const { status } = useWebSocket<WebSocketTickerMessage[]>({
    url: `${BINANCE_WS_URL}/!ticker@arr`,
    onMessage: handleMessage,
  });

  // Sync WS status to Redux for Header
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
