import { act, screen, waitFor } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useGetKlinesQuery,
  useGetOrderBookQuery,
  useGetTickersQuery,
} from "@/features/market/marketApi";
import { setSelectedSymbol, updateTickers } from "@/features/market/marketSlice";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { queryResult, ticker } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { moveWidget, toggleWidgetVisibility } from "../dashboardSlice";
import Dashboard from "./Dashboard";

vi.mock("@/shared/hooks/useWebSocket", () => ({ useWebSocket: vi.fn() }));
vi.mock("@/features/market/marketApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/market/marketApi")>()),
  useGetTickersQuery: vi.fn(),
  useGetKlinesQuery: vi.fn(),
  useGetOrderBookQuery: vi.fn(),
}));
vi.mock("lightweight-charts", () => import("@/test/lightweight-charts"));

const DEFAULT_ORDER = ["Trading Chart", "Order Book", "Market Overview", "Watchlist", "Portfolio"];

const widgetOrder = () =>
  screen.getAllByRole("region").map((section) => section.getAttribute("aria-label"));

/**
 * jsdom has no layout. Give each widget the box it has in the browser at 1440px: chart and
 * order book on the first row, the three smaller widgets on the second.
 */
const GRID: Record<string, [left: number, top: number, width: number, height: number]> = {
  "Trading Chart": [0, 0, 888, 480],
  "Order Book": [904, 0, 440, 480],
  "Market Overview": [0, 496, 666, 300],
  Watchlist: [682, 496, 321, 300],
  Portfolio: [1019, 496, 325, 300],
};

function layOutDefaultGrid() {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const label = this.closest("section")?.getAttribute("aria-label") ?? "";
    const [left, top, width, height] = GRID[label] ?? [0, 0, 0, 0];
    return {
      x: left,
      y: top,
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      toJSON: () => ({}),
    };
  });
}

async function keyboardDrag(user: ReturnType<typeof userEvent.setup>, title: string, keys: string) {
  screen.getByRole("button", { name: `Move ${title}` }).focus();
  await user.keyboard("[Space]");
  await user.keyboard(keys);
  await user.keyboard("[Space]");
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.mocked(useWebSocket).mockReturnValue({ status: "open", reconnectCount: 0 });
    vi.mocked(useGetTickersQuery).mockReturnValue(queryResult(undefined));
    vi.mocked(useGetKlinesQuery).mockReturnValue(queryResult(undefined));
    vi.mocked(useGetOrderBookQuery).mockReturnValue(queryResult(undefined));
  });

  it("lays out the widgets in the saved order", () => {
    renderWithProviders(<Dashboard />, {
      actions: [moveWidget({ id: "w-portfolio", overId: "w-chart" })],
    });

    expect(widgetOrder()).toEqual([
      "Portfolio",
      "Trading Chart",
      "Order Book",
      "Market Overview",
      "Watchlist",
    ]);
  });

  it("gives every widget a keyboard-operable drag handle", () => {
    renderWithProviders(<Dashboard />);

    for (const title of DEFAULT_ORDER) {
      expect(screen.getByRole("button", { name: `Move ${title}` })).toHaveAttribute(
        "aria-roledescription",
        "sortable",
      );
    }
  });

  it("moves a widget one place earlier with an arrow key, even across rows of mixed widths", async () => {
    layOutDefaultGrid();
    const { user, store } = renderWithProviders(<Dashboard />);

    await keyboardDrag(user, "Order Book", "[ArrowLeft]");

    await waitFor(() => expect(widgetOrder().slice(0, 2)).toEqual(["Order Book", "Trading Chart"]));
    expect(store.getState().dashboard.widgets[0]?.id).toBe("w-orderbook");
    expect(localStorage.getItem("cld-dashboard")).toMatch(/^\[\{"id":"w-orderbook"/);
  });

  it("moves a widget one place later per arrow key", async () => {
    layOutDefaultGrid();
    const { user } = renderWithProviders(<Dashboard />);

    await keyboardDrag(user, "Trading Chart", "[ArrowRight][ArrowDown]");

    await waitFor(() =>
      expect(widgetOrder()).toEqual([
        "Order Book",
        "Market Overview",
        "Trading Chart",
        "Watchlist",
        "Portfolio",
      ]),
    );
  });

  it("hides a widget and brings it back", async () => {
    const { user } = renderWithProviders(<Dashboard />);

    await user.click(screen.getByRole("button", { name: "Hide Order Book" }));
    expect(widgetOrder()).not.toContain("Order Book");

    await user.click(screen.getByRole("button", { name: "+ Order Book" }));
    expect(widgetOrder()).toEqual(DEFAULT_ORDER);
  });

  it("resets the layout", async () => {
    const { user } = renderWithProviders(<Dashboard />, {
      actions: [
        moveWidget({ id: "w-watchlist", overId: "w-chart" }),
        toggleWidgetVisibility("w-portfolio"),
      ],
    });

    await user.click(screen.getByRole("button", { name: "Reset layout" }));

    expect(widgetOrder()).toEqual(DEFAULT_ORDER);
    expect(screen.queryByRole("button", { name: /^\+ / })).not.toBeInTheDocument();
  });

  it("shows the selected pair's live price, with demo stats until it arrives", () => {
    const { store } = renderWithProviders(<Dashboard />);
    const headlinePrice = (text: string) => screen.queryByText(text, { selector: ".text-2xl" });
    expect(headlinePrice("$87,432.50")).toBeInTheDocument();

    act(() => {
      store.dispatch(updateTickers([ticker("BTCUSDT", 91_000)]));
    });

    expect(headlinePrice("$91,000.00")).toBeInTheDocument();
  });

  it("waits for market data on a pair without demo stats", () => {
    renderWithProviders(<Dashboard />, { actions: [setSelectedSymbol("NEARUSDT")] });
    expect(screen.getByText("Waiting for market data...")).toBeInTheDocument();
  });
});
