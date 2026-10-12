import { describe, expect, it } from "vitest";
import { addAlert, alertsReducer, removeAlert, toggleAlert, triggerAlert } from "./alertsSlice";

const withAlert = () => {
  const state = alertsReducer(
    { alerts: [] },
    addAlert({ symbol: "BTCUSDT", targetPrice: 70_000, condition: "above" }),
  );
  return { state, id: state.alerts[0]?.id ?? "" };
};

describe("alertsSlice", () => {
  it("creates new alerts as active", () => {
    const { state } = withAlert();
    expect(state.alerts[0]).toMatchObject({ symbol: "BTCUSDT", targetPrice: 70_000, active: true });
  });

  it("deactivates an alert and records when it triggered", () => {
    const { state, id } = withAlert();
    const next = alertsReducer(state, triggerAlert(id));

    expect(next.alerts[0]?.active).toBe(false);
    expect(next.alerts[0]?.triggeredAt).toEqual(expect.any(Number));
  });

  it("toggles an alert off and on", () => {
    const { state, id } = withAlert();
    const off = alertsReducer(state, toggleAlert(id));
    const on = alertsReducer(off, toggleAlert(id));

    expect(off.alerts[0]?.active).toBe(false);
    expect(on.alerts[0]?.active).toBe(true);
  });

  it("removes an alert and persists the change", () => {
    const { state, id } = withAlert();
    expect(alertsReducer(state, removeAlert(id)).alerts).toEqual([]);
    expect(localStorage.getItem("cld-alerts")).toBe("[]");
  });

  it("ignores triggering or toggling an unknown alert", () => {
    const { state } = withAlert();
    expect(alertsReducer(state, triggerAlert("missing"))).toBe(state);
    expect(alertsReducer(state, toggleAlert("missing"))).toBe(state);
  });
});
