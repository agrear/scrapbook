import type { DragControls } from 'svelte-motion';

export type FlipViewContext = {
  width: number | null,
  height: number | null,
  direction: 1 | 0 | -1,
  dragControls: DragControls,
  onFlip: (direction: 1 | -1) => void
};

export const key = {};
