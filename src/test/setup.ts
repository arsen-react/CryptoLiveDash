import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  // Files that opt into the Node environment have no localStorage.
  if (typeof localStorage !== "undefined") localStorage.clear();
  vi.restoreAllMocks();
});
