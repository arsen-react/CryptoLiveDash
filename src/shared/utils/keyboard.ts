import type { KeyboardEvent } from "react";

export function onEnterOrSpace(action: () => void) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };
}
