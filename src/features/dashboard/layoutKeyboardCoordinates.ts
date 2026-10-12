import type { KeyboardCoordinateGetter, UniqueIdentifier } from "@dnd-kit/core";

const STEPS: Record<string, number> = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };

interface SortableData {
  sortable?: { index: number; items: UniqueIdentifier[] };
}

/**
 * Arrow keys move the dragged widget one place earlier or later in the layout order.
 * dnd-kit's default picks the nearest widget in the arrow's direction, which on a grid of
 * mixed widths can jump to another row.
 */
export const layoutKeyboardCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
  const step = STEPS[event.code];
  const { active, over, collisionRect, droppableRects } = context;
  const sortable = (active?.data.current as SortableData | undefined)?.sortable;
  if (!step || !sortable || !collisionRect) return undefined;
  event.preventDefault();

  const from = (over?.data.current as SortableData | undefined)?.sortable?.index ?? sortable.index;
  const targetId = sortable.items[from + step];
  const target = targetId === undefined ? undefined : droppableRects.get(targetId);
  if (!target) return undefined;

  // Centre the widget on the target, so centre-based collision picks exactly that widget.
  return {
    x: target.left + target.width / 2 - collisionRect.width / 2,
    y: target.top + target.height / 2 - collisionRect.height / 2,
  };
};
