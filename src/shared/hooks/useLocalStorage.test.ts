import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  it("starts from the stored value", () => {
    localStorage.setItem("theme", JSON.stringify("dark"));
    const { result } = renderHook(() => useLocalStorage("theme", "light"));
    expect(result.current[0]).toBe("dark");
  });

  it("uses the initial value when storage holds malformed JSON", () => {
    localStorage.setItem("theme", "{oops");
    const { result } = renderHook(() => useLocalStorage("theme", "light"));
    expect(result.current[0]).toBe("light");
  });

  it("persists updates, including functional ones", () => {
    const { result } = renderHook(() => useLocalStorage("count", 1));

    act(() => result.current[1](5));
    act(() => result.current[1]((prev) => prev + 1));

    expect(result.current[0]).toBe(6);
    expect(localStorage.getItem("count")).toBe("6");
  });
});
