import { describe, expect, it } from "vitest";
import {
  addWidget,
  dashboardReducer,
  removeWidget,
  reorderWidgets,
  resetLayout,
  toggleWidgetVisibility,
} from "./dashboardSlice";

const initial = () => dashboardReducer(undefined, { type: "init" });
const ids = (state: ReturnType<typeof initial>) => state.widgets.map((w) => w.id);

describe("dashboardSlice", () => {
  it("starts from the default five-widget layout", () => {
    expect(ids(initial())).toEqual([
      "w-chart",
      "w-orderbook",
      "w-market",
      "w-watchlist",
      "w-portfolio",
    ]);
  });

  it("toggles a widget's visibility", () => {
    const next = dashboardReducer(initial(), toggleWidgetVisibility("w-chart"));
    expect(next.widgets.find((w) => w.id === "w-chart")?.visible).toBe(false);
  });

  it("adds a widget with a short generated id", () => {
    const next = dashboardReducer(
      initial(),
      addWidget({ type: "watchlist", title: "Second list" }),
    );
    const added = next.widgets[next.widgets.length - 1];

    expect(added).toMatchObject({ type: "watchlist", title: "Second list", visible: true });
    expect(added?.id).toMatch(/^w-[0-9a-f]{8}$/);
  });

  it("removes a widget and persists the layout", () => {
    const next = dashboardReducer(initial(), removeWidget("w-orderbook"));
    expect(ids(next)).not.toContain("w-orderbook");
    expect(localStorage.getItem("cld-dashboard")).toContain("w-chart");
  });

  it("applies a new widget order", () => {
    const state = initial();
    const reversed = [...state.widgets].reverse();
    expect(ids(dashboardReducer(state, reorderWidgets(reversed)))[0]).toBe("w-portfolio");
  });

  it("restores the default layout", () => {
    const changed = dashboardReducer(initial(), removeWidget("w-chart"));
    expect(ids(dashboardReducer(changed, resetLayout()))).toContain("w-chart");
  });
});
