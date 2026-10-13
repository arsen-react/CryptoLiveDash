import { describe, expect, it, vi } from "vitest";
import * as z from "zod/mini";
import { loadFromStorage, saveToStorage } from "./storage";

const schema = z.object({ count: z.number() });
const fallback = { count: 0 };

describe("loadFromStorage", () => {
  it("returns the fallback when the key is missing", () => {
    expect(loadFromStorage("missing", schema, fallback)).toEqual(fallback);
  });

  it("returns stored data that matches the schema", () => {
    localStorage.setItem("k", JSON.stringify({ count: 3 }));
    expect(loadFromStorage("k", schema, fallback)).toEqual({ count: 3 });
  });

  it("falls back and warns when stored data fails validation", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem("k", JSON.stringify({ count: "three" }));

    expect(loadFromStorage("k", schema, fallback)).toEqual(fallback);
    expect(warn).toHaveBeenCalledWith('[storage] Invalid data for "k", using fallback.');
  });

  it("falls back and warns when stored data is not valid JSON", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem("k", "{not json");

    expect(loadFromStorage("k", schema, fallback)).toEqual(fallback);
    expect(warn).toHaveBeenCalledWith('[storage] Failed to read "k", using fallback.');
  });
});

describe("saveToStorage", () => {
  it("writes the value as JSON", () => {
    saveToStorage("k", { count: 1 });
    expect(localStorage.getItem("k")).toBe('{"count":1}');
  });

  it("does not throw when the storage quota is exceeded", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is full", "QuotaExceededError");
    });

    expect(() => saveToStorage("k", { count: 1 })).not.toThrow();
    expect(warn).toHaveBeenCalledWith('[storage] Quota exceeded for "k". Data not saved.');
  });
});
