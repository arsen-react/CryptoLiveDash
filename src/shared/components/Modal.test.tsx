import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

const renderModal = (onClose = vi.fn(), open = true) => {
  render(
    <Modal open={open} onClose={onClose} title="Add alert">
      <p>body</p>
    </Modal>,
  );
  return onClose;
};

describe("Modal", () => {
  it("renders nothing while closed", () => {
    renderModal(vi.fn(), false);
    expect(screen.queryByText("Add alert")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    const onClose = renderModal();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a click on the backdrop but not inside the dialog", () => {
    const onClose = renderModal();

    fireEvent.click(screen.getByText("body"));
    expect(onClose).not.toHaveBeenCalled();

    const backdrop = screen.getByText("Add alert").closest(".fixed");
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from the × button", () => {
    const onClose = renderModal();
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
