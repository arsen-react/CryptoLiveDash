import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ticker } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { updateTickers } from "../marketSlice";
import { PriceTicker } from "./PriceTicker";

describe("PriceTicker", () => {
  it("stays hidden until live prices arrive", () => {
    renderWithProviders(<PriceTicker />);
    expect(document.querySelector(".ticker-scroll")).not.toBeInTheDocument();
  });

  it("scrolls the live prices of the top pairs, repeated for a seamless loop", () => {
    renderWithProviders(<PriceTicker />, {
      actions: [
        updateTickers([
          ticker("BTCUSDT", 60_000, { priceChangePercent: "1.25" }),
          ticker("PEPEUSDT", 0.00001),
        ]),
      ],
    });

    expect(screen.getAllByText("BTC")).toHaveLength(2);
    expect(screen.getAllByText("$60,000.00")).toHaveLength(2);
    expect(screen.getAllByText("+1.25%")).toHaveLength(2);
    expect(screen.queryByText("PEPE")).not.toBeInTheDocument();
  });
});
