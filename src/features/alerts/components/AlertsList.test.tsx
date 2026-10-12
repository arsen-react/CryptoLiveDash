import { act, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGetTickersQuery } from "@/features/market/marketApi";
import { updateTickers } from "@/features/market/marketSlice";
import { queryResult, ticker } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { addAlert } from "../alertsSlice";
import AlertsList from "./AlertsList";

vi.mock("@/features/market/marketApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/market/marketApi")>()),
  useGetTickersQuery: vi.fn(),
}));

const requestPermission = vi.fn(async () => "granted" as NotificationPermission);

const btcAbove66k = addAlert({ symbol: "BTCUSDT", targetPrice: 66_000, condition: "above" });

describe("AlertsList", () => {
  beforeEach(() => {
    vi.stubGlobal("Notification", { permission: "default", requestPermission });
    vi.mocked(useGetTickersQuery).mockReturnValue(queryResult([ticker("SOLUSDT", 150)]));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("shows how far each active alert is from its target", () => {
    renderWithProviders(<AlertsList />, {
      actions: [btcAbove66k, updateTickers([ticker("BTCUSDT", 60_000)])],
    });

    expect(screen.getByText("Active (1)")).toBeInTheDocument();
    expect(screen.getByText("10.0% away")).toBeInTheDocument();
  });

  it("pauses an alert and resumes it", async () => {
    const { user, store } = renderWithProviders(<AlertsList />, { actions: [btcAbove66k] });

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByText("Paused (1)")).toBeInTheDocument();
    expect(screen.queryByText(/^Triggered/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Resume" }));
    expect(screen.getByText("Active (1)")).toBeInTheDocument();
    expect(store.getState().alerts.alerts[0]?.active).toBe(true);
  });

  it("moves an alert to Triggered once the live price reaches it", () => {
    const { store } = renderWithProviders(<AlertsList />, { actions: [btcAbove66k] });

    act(() => {
      store.dispatch(updateTickers([ticker("BTCUSDT", 66_500)]));
    });

    expect(screen.getByText("No active alerts")).toBeInTheDocument();
    expect(screen.getByText("Triggered (1)")).toBeInTheDocument();
    expect(screen.getByText(/^Triggered [A-Z][a-z]{2} \d{1,2}, /)).toBeInTheDocument();
  });

  it("deletes alerts", async () => {
    const { user, store } = renderWithProviders(<AlertsList />, { actions: [btcAbove66k] });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(store.getState().alerts.alerts).toEqual([]);
    expect(screen.getByText("Active (0)")).toBeInTheDocument();
  });

  it("creates an alert for a coin, direction and target price", async () => {
    const { user, store } = renderWithProviders(<AlertsList />);

    await user.click(screen.getAllByRole("button", { name: "+ Create Alert" })[0] as HTMLElement);
    const dialog = within(screen.getByRole("dialog", { name: "Create Price Alert" }));
    await user.click(dialog.getByRole("button", { name: /^SOL/ }));
    await user.click(dialog.getByRole("button", { name: "Price goes below" }));
    expect(dialog.getByRole("button", { name: "Price goes below" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.type(dialog.getByLabelText("Target Price (USD)"), "120");
    await user.click(dialog.getByRole("button", { name: "Create Alert" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(store.getState().alerts.alerts).toMatchObject([
      { symbol: "SOLUSDT", condition: "below", targetPrice: 120, active: true },
    ]);
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });
});
