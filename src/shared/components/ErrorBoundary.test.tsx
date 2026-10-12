import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

let shouldThrow = true;

function FlakyWidget() {
  if (shouldThrow) throw new Error("kaboom");
  return <p>widget ok</p>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("shows the error inside the widget instead of crashing the dashboard", () => {
    render(
      <ErrorBoundary>
        <FlakyWidget />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("kaboom")).toBeInTheDocument();
  });

  it("uses a custom fallback when one is given", () => {
    render(
      <ErrorBoundary fallback={<p>widget unavailable</p>}>
        <FlakyWidget />
      </ErrorBoundary>,
    );

    expect(screen.getByText("widget unavailable")).toBeInTheDocument();
  });

  it("renders the widget again after Try again", () => {
    render(
      <ErrorBoundary>
        <FlakyWidget />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("widget ok")).toBeInTheDocument();
  });
});
