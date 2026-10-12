import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriceChange } from "./PriceChange";

describe("PriceChange", () => {
  it("shows a gain in the gain colour with a plus sign", () => {
    render(<PriceChange value={2.5} />);
    expect(screen.getByText("+2.50%")).toHaveClass("text-gain");
  });

  it("shows a loss in the loss colour", () => {
    render(<PriceChange value={-1.25} />);
    expect(screen.getByText("-1.25%")).toHaveClass("text-loss");
  });

  it("can hide the sign and still colour the loss", () => {
    render(<PriceChange value={-1.25} showSign={false} />);
    expect(screen.getByText("1.25%")).toHaveClass("text-loss");
  });
});
