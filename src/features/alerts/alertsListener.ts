import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "@/app/store";
import { updateTicker, updateTickers } from "@/features/market/marketSlice";
import type { Ticker } from "@/shared/types/market";
import type { PriceAlert } from "@/shared/types/portfolio";
import { formatPrice } from "@/shared/utils/formatters";
import { triggerAlert } from "./alertsSlice";

export function findTriggeredAlerts(
  alerts: readonly PriceAlert[],
  liveTickers: Record<string, Ticker>,
): { alert: PriceAlert; price: number }[] {
  return alerts.flatMap((alert) => {
    const ticker = liveTickers[alert.symbol];
    if (!alert.active || !ticker) return [];

    const price = parseFloat(ticker.price);
    const reached =
      alert.condition === "above" ? price >= alert.targetPrice : price <= alert.targetPrice;
    return reached ? [{ alert, price }] : [];
  });
}

function notify(alert: PriceAlert, price: number) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

  const asset = alert.symbol.replace("USDT", "");
  new Notification(`Price Alert: ${asset}`, {
    body: `${asset} is now ${alert.condition} $${formatPrice(alert.targetPrice)} (Current: $${formatPrice(price)})`,
    icon: "/favicon.svg",
  });
}

export const alertsListener = createListenerMiddleware();

alertsListener.startListening.withTypes<RootState, AppDispatch>()({
  matcher: isAnyOf(updateTicker, updateTickers),
  effect: (_action, api) => {
    const { alerts, market } = api.getState();

    for (const { alert, price } of findTriggeredAlerts(alerts.alerts, market.liveTickers)) {
      api.dispatch(triggerAlert(alert.id));
      notify(alert, price);
    }
  },
});
