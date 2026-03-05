import { useAppDispatch, useAppSelector } from "@/app/store";
import { cn } from "@/shared/utils/cn";
import { formatPrice, formatTimestamp } from "@/shared/utils/formatters";
import { useEffect, useState } from "react";
import { removeAlert, toggleAlert, triggerAlert } from "../alertsSlice";
import { CreateAlertModal } from "./CreateAlertModal";

export default function AlertsList() {
  const dispatch = useAppDispatch();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const liveTickers = useAppSelector((state) => state.market.liveTickers);

  // Check alerts against live prices
  useEffect(() => {
    for (const alert of alerts) {
      if (!alert.active) continue;
      const ticker = liveTickers[alert.symbol];
      if (!ticker) continue;

      const price = parseFloat(ticker.price);
      const triggered =
        (alert.condition === "above" && price >= alert.targetPrice) ||
        (alert.condition === "below" && price <= alert.targetPrice);

      if (triggered) {
        dispatch(triggerAlert(alert.id));

        if (Notification.permission === "granted") {
          new Notification(`Price Alert: ${alert.symbol.replace("USDT", "")}`, {
            body: `${alert.symbol.replace("USDT", "")} is now ${alert.condition === "above" ? "above" : "below"} $${formatPrice(alert.targetPrice)} (Current: $${formatPrice(price)})`,
            icon: "/favicon.svg",
          });
        }
      }
    }
  }, [liveTickers, alerts, dispatch]);

  const activeAlerts = alerts.filter((a) => a.active);
  const triggeredAlerts = alerts.filter((a) => !a.active);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Price Alerts</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
        >
          + Create Alert
        </button>
      </div>

      {/* Active Alerts */}
      <h3 className="text-sm font-medium text-muted mb-2">Active ({activeAlerts.length})</h3>
      {activeAlerts.length === 0 ? (
        <div className="widget-card widget-body text-center text-muted py-8 mb-6">
          <p className="text-sm">No active alerts</p>
          <p className="text-xs mt-1 mb-4">
            Create an alert to get notified when a price target is hit
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
          >
            + Create Alert
          </button>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {activeAlerts.map((alert) => {
            const ticker = liveTickers[alert.symbol];
            const currentPrice = ticker ? parseFloat(ticker.price) : 0;
            const distance =
              alert.condition === "above"
                ? ((alert.targetPrice - currentPrice) / currentPrice) * 100
                : ((currentPrice - alert.targetPrice) / currentPrice) * 100;

            return (
              <div
                key={alert.id}
                className="widget-card widget-body flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm font-medium">{alert.symbol.replace("USDT", "")}</span>
                    <span className="text-xs text-muted ml-1">/USDT</span>
                  </div>
                  <div
                    className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      alert.condition === "above" ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss",
                    )}
                  >
                    {alert.condition === "above" ? "Above" : "Below"}{" "}
                    <span className="font-mono">${formatPrice(alert.targetPrice)}</span>
                  </div>
                  {currentPrice > 0 && (
                    <div className="text-xs text-muted">
                      {distance > 0 ? `${distance.toFixed(1)}% away` : "Target reached!"}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(toggleAlert(alert.id))}
                    className="text-xs text-muted hover:text-white transition-colors px-2 py-1 border border-border rounded hover:bg-surface-hover"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => dispatch(removeAlert(alert.id))}
                    className="text-xs text-muted hover:text-loss transition-colors px-2 py-1 border border-border rounded hover:bg-surface-hover"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-muted mb-2">
            Triggered ({triggeredAlerts.length})
          </h3>
          <div className="space-y-2">
            {triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="widget-card widget-body flex items-center justify-between opacity-60"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm">{alert.symbol.replace("USDT", "")}</span>
                  <span className="text-xs text-muted">
                    {alert.condition === "above" ? "Above" : "Below"} $
                    {formatPrice(alert.targetPrice)}
                  </span>
                  {alert.triggeredAt && (
                    <span className="text-xs text-gain">
                      Triggered {formatTimestamp(alert.triggeredAt)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => dispatch(removeAlert(alert.id))}
                  className="text-xs text-muted hover:text-loss transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <CreateAlertModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
