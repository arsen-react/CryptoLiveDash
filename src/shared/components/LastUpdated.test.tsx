import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LastUpdated } from "./LastUpdated";

describe("LastUpdated", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("labels demo data", () => {
    render(<LastUpdated timestamp={null} isMock />);
    expect(screen.getByText("Demo data")).toBeInTheDocument();
  });

  it("renders nothing without a timestamp", () => {
    const { container } = render(<LastUpdated timestamp={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    [2_000, "just now"],
    [42_000, "42s ago"],
    [5 * 60_000, "5m ago"],
    [3 * 3_600_000, "3h ago"],
  ])("labels an update %i ms old as %s", (age, label) => {
    render(<LastUpdated timestamp={Date.now() - age} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("refreshes the label every 10 seconds", () => {
    render(<LastUpdated timestamp={Date.now()} />);
    expect(screen.getByText("just now")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText("10s ago")).toBeInTheDocument();
  });
});
