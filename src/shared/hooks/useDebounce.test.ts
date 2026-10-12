import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";

const renderDebounce = () =>
  renderHook(({ value }: { value: string }) => useDebounce(value, 300), {
    initialProps: { value: "b" },
  });

describe("useDebounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns the new value only after the delay", () => {
    const { result, rerender } = renderDebounce();

    rerender({ value: "bt" });
    expect(result.current).toBe("b");

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("bt");
  });

  it("restarts the delay on every change", () => {
    const { result, rerender } = renderDebounce();

    rerender({ value: "bt" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "btc" });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("b");

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("btc");
  });
});
