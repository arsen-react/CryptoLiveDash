import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "@/app/store";
import { updateTicker, updateTickers } from "@/features/market/marketSlice";
import type { PriceAlert } from "@/shared/types/portfolio";
import { ticker } from "@/test/fixtures";
import { findTriggeredAlerts } from "./alertsListener";
import { addAlert, toggleAlert } from "./alertsSlice";

class FakeNotification {
  static permission: NotificationPermission = "granted";
  static sent: { title: string; body?: string }[] = [];

  constructor(title: string, options?: NotificationOptions) {
    FakeNotification.sent.push({ title, body: options?.body });
  }
}

const storeWithAlert = (condition: PriceAlert["condition"], targetPrice: number) => {
  const store = makeStore();
  store.dispatch(addAlert({ symbol: "BTCUSDT", targetPrice, condition }));
  return store;
};

describe("alertsListener", () => {
  beforeEach(() => {
    FakeNotification.permission = "granted";
    FakeNotification.sent = [];
    vi.stubGlobal("Notification", FakeNotification);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("triggers an alert when a live price reaches it, with no page mounted", () => {
    const store = storeWithAlert("above", 70_000);

    store.dispatch(updateTickers([ticker("BTCUSDT", 69_999)]));
    expect(store.getState().alerts.alerts[0]?.active).toBe(true);

    store.dispatch(updateTicker(ticker("BTCUSDT", 70_000)));
    expect(store.getState().alerts.alerts[0]).toMatchObject({
      active: false,
      triggeredAt: expect.any(Number),
    });
  });

  it("sends one browser notification per triggered alert", () => {
    const store = storeWithAlert("below", 60_000);

    store.dispatch(updateTickers([ticker("BTCUSDT", 59_500)]));
    store.dispatch(updateTickers([ticker("BTCUSDT", 59_000)]));

    expect(FakeNotification.sent).toEqual([
      { title: "Price Alert: BTC", body: "BTC is now below $60,000.00 (Current: $59,500.00)" },
    ]);
  });

  it("triggers without notifying when notifications are not allowed", () => {
    FakeNotification.permission = "denied";
    const store = storeWithAlert("above", 1);

    store.dispatch(updateTickers([ticker("BTCUSDT", 2)]));

    expect(store.getState().alerts.alerts[0]?.active).toBe(false);
    expect(FakeNotification.sent).toEqual([]);
  });

  it("works in browsers without the Notification API", () => {
    vi.stubGlobal("Notification", undefined);
    const store = storeWithAlert("above", 1);

    expect(() => store.dispatch(updateTickers([ticker("BTCUSDT", 2)]))).not.toThrow();
    expect(store.getState().alerts.alerts[0]?.active).toBe(false);
  });

  it("leaves paused alerts alone", () => {
    const store = storeWithAlert("above", 1);
    store.dispatch(toggleAlert(store.getState().alerts.alerts[0]?.id ?? ""));

    store.dispatch(updateTickers([ticker("BTCUSDT", 2)]));

    expect(store.getState().alerts.alerts[0]?.triggeredAt).toBeUndefined();
  });
});

describe("findTriggeredAlerts", () => {
  const alert = (condition: PriceAlert["condition"], targetPrice: number, active = true) => ({
    id: `${condition}-${targetPrice}`,
    symbol: "ETHUSDT",
    targetPrice,
    condition,
    active,
    createdAt: 0,
  });

  it("matches alerts whose target the price has reached in their direction", () => {
    const alerts = [alert("above", 3_000), alert("above", 3_200), alert("below", 3_100)];
    const found = findTriggeredAlerts(alerts, { ETHUSDT: ticker("ETHUSDT", 3_100) });

    expect(found.map(({ alert: { id } }) => id)).toEqual(["above-3000", "below-3100"]);
    expect(found[0]?.price).toBe(3_100);
  });

  it("skips inactive alerts and pairs without a live price", () => {
    expect(
      findTriggeredAlerts([alert("above", 1, false)], { ETHUSDT: ticker("ETHUSDT", 5) }),
    ).toEqual([]);
    expect(findTriggeredAlerts([alert("above", 1)], {})).toEqual([]);
  });
});
