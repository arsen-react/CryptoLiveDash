import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatPercent,
  formatPrice,
  formatTimestamp,
  formatUsd,
  formatVolume,
} from "./formatters";

describe("formatUsd", () => {
  it.each([
    [0, "0.00"],
    [0.004, "0.00"],
    [12.5, "12.50"],
    [3_000, "3,000.00"],
  ])("formats %d as %s", (value, expected) => {
    expect(formatUsd(value)).toBe(expected);
  });
});

describe("formatCurrency", () => {
  it.each([
    [1_500_000_000, "$1.50B"],
    [2_340_000, "$2.34M"],
    [12_500, "$12.50K"],
    [999.5, "$999.50"],
  ])("formats %d as %s", (value, expected) => {
    expect(formatCurrency(value)).toBe(expected);
  });

  it("switches unit exactly at each threshold", () => {
    expect(formatCurrency(1_000)).toBe("$1.00K");
    expect(formatCurrency(1_000_000)).toBe("$1.00M");
    expect(formatCurrency(1_000_000_000)).toBe("$1.00B");
  });

  it("respects the decimals argument below one thousand", () => {
    expect(formatCurrency(12.3456, 4)).toBe("$12.3456");
  });
});

describe("formatPrice", () => {
  it("groups thousands with two decimals from 1 upwards", () => {
    expect(formatPrice(64_250.5)).toBe("64,250.50");
    expect(formatPrice(1)).toBe("1.00");
  });

  it("shows four decimals for prices between one cent and one dollar", () => {
    expect(formatPrice(0.5)).toBe("0.5000");
  });

  it("shows eight decimals for sub-cent prices", () => {
    expect(formatPrice(0.00001234)).toBe("0.00001234");
  });
});

describe("formatPercent", () => {
  it("adds a plus sign to gains and keeps the minus on losses", () => {
    expect(formatPercent(3.456)).toBe("+3.46%");
    expect(formatPercent(0)).toBe("+0.00%");
    expect(formatPercent(-1.2)).toBe("-1.20%");
  });
});

describe("formatVolume", () => {
  it.each([
    [3_200_000_000, "3.20B"],
    [45_600_000, "45.60M"],
    [7_890, "7.89K"],
    [12.5, "12.50"],
  ])("formats %d as %s", (value, expected) => {
    expect(formatVolume(value)).toBe(expected);
  });
});

describe("formatTimestamp", () => {
  it("shows the month and day", () => {
    expect(formatTimestamp(Date.UTC(2024, 0, 15, 12, 0))).toContain("Jan 15");
  });
});
