import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins only the classes whose condition is true", () => {
    expect(cn("a", { b: false, c: true })).toBe("a c");
  });

  it("lets a later Tailwind class win a conflict", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4");
  });
});
