<script context="module" lang="ts">
  import type { MotionValue, Point2D } from 'svelte-motion';

  export type ImageListContext<T> = {
    columns: number,
    draggedItem: {
      index: number,
      scrollY: number,
      x: number,
      y: number
    } | null,
    gap: number,
    itemHeight: MotionValue<number>,
    itemSize: number,
    itemWidth: MotionValue<number>,
    items: number,
    offset: number,
    rows: number,
    scrollY: number,
    scrollViewport: (point: Point2D) => void,
    sortable: boolean
  };

  export type Item = { [x: string]: any };

  export const contextKey = {};

  export const springOptions = {
    damping: 30,
    mass: 1.5,
    stiffness: 300
  };

  export function getGridColumn(index: number, columns: number) {
    return index % columns;
  }

  export function getGridRow(index: number, columns: number) {
    return Math.trunc(index / columns);
  }

  export function moveItem<T>(items: T[], from: number, to: number) {
    return produce(items, items => {
      items.splice(to, 0, items.splice(from, 1)[0]);
    });
  }
</script>

<script lang="ts">
  import { clamp, snap } from '@popmotion/popcorn';
  import { produce } from 'immer';
  import { onMount, setContext } from 'svelte';
  import { get, writable } from 'svelte/store';
  import {
    animate,
    Motion,
    useDragControls,
    useMotionValue,
    useSpring
  } from 'svelte-motion';

  import { measureElement } from '/@/util';

  type T = $$Generic<Item>;

  const viewportPanThreshold = 80;
  const scrollFactor = 100;

  export let items: T[];
  export let selectId: (item: T) => string = item => item.id;
  export let minItemSize = 175;
  export let itemSizeStep = 25;
  export let itemSize = minItemSize;
  export let gap = 40;
  export let margin = 10;
  export let disabled = false;
  export let sortable = false;
  export let start = -1;
  export let end = -1;

  export let onDragStart: ((index: number) => void) | undefined = undefined;
  export let onDragOver: ((index: number) => void) | undefined = undefined;
  export let onDragEnd: (() => void) | undefined = undefined;
  export let onDrop: ((files: FileList) => void) | undefined = undefined;

  const context = writable<ImageListContext<T>>({
    columns: 0,
    draggedItem: null,
    gap,
    itemHeight: useSpring(itemSize, springOptions),
    itemSize,
    itemWidth: useSpring(itemSize, springOptions),
    items: items.length,
    offset: 0,
    rows: 0,
    scrollY: 0,
    scrollViewport,
    sortable
  });

  setContext(contextKey, context);

  const dragControls = useDragControls();
  const y = useMotionValue(0);
  let dragConstraints = { top: 0, bottom: 0 };

  let viewport: HTMLDivElement | null = null;
  let gridWidth = 0;
  let gridHeight = 0;

  let columns = 0;
  let rows = 0;
  let offset = 0;

  let dragEntered = false;

  function updateOffsets() {
    if (viewport === null) {
      return;
    }

    const { offsetHeight } = viewport;

    // TODO: Validate and improve
    start = Math.max(
      0,
      Math.floor(-y.get() / (itemSize + gap)) * columns - margin
    );

    end = Math.min(
      Math.ceil(
        (-y.get() + offsetHeight) / (itemSize + gap)
      ) * columns + 1 + margin,
      items.length
    );
  }

  function scrollViewport(point: Point2D) {
    if (viewport === null) {
      return;
    }

    const { clientHeight } = viewport;
    const { top } = viewport.getBoundingClientRect();
    const pointY = point.y - top;

    // Move viewport if cursor is at edge
    if (pointY < viewportPanThreshold) {  // Move up
      const magnitude = Math.abs(pointY - viewportPanThreshold);
      y.set(Math.min(y.get() + Math.sqrt(magnitude), 0));
    } else if (pointY > clientHeight - viewportPanThreshold) {  // Move down
      const magnitude = pointY - clientHeight + viewportPanThreshold;
      y.set(Math.max(dragConstraints.top, y.get() - Math.sqrt(magnitude)));
    }
  }

  function getIndexAtPointer(pointer: Point2D): number {
    if (viewport === null) {
      return -1;
    }

    const { top, left } = viewport.getBoundingClientRect();

    // Snap to nearest column
    const column = Math.round((pointer.x - left) / (itemSize + gap) - 0.5);

    const row = Math.round(  // Snap to nearest row
      (pointer.y - top - y.get()) / (itemSize + gap) - 0.5
    );

    return clamp(0, items.length - 1, row * columns + column);
  }

  $: snapItemSize = snap(itemSizeStep);

  $: {
    $context.items = items.length;
    updateOffsets();
  }

  $: columns = 1 + Math.max(
    0,
    Math.floor((gridWidth - itemSize) / (itemSize + gap))
  );

  $: rows = Math.ceil(items.length / columns);

  $: {
    gridHeight = rows * itemSize + (rows - 1) * gap;

    updateOffsets();
  }

  $: offset = (gridWidth - (columns * itemSize + (columns - 1) * gap)) / 2;

  $: {
    $context.itemSize = itemSize;
    $context.itemWidth.set(itemSize);
    $context.itemHeight.set(itemSize);
  }

  $: $context.columns = columns;

  $: $context.rows = rows;

  $: $context.offset = offset;

  $: $context.gap = gap;

  $: {
    dragConstraints = {
      top: Math.min(
        0,
        (viewport ? measureElement(viewport).height : gridHeight) - gridHeight
      ),
      bottom: 0
    };

    // Make sure we don't exceed scroll
    if (y.get() < dragConstraints.top) {
      animate(y, dragConstraints.top);
    }
  }

  onMount(() => {
    updateOffsets();

    return y.onChange(value => {
      $context.scrollY = value;
      updateOffsets();
    });
  });
</script>

<svelte:window
  on:keydown={event => {
    if (disabled || $context.draggedItem !== null) {
      return;
    }

    if (event.ctrlKey) {
      if (event.key === 'Control') {
      } else if (event.key === '+') {  // Zoom in
        itemSize = Math.min(itemSize + itemSizeStep, gridWidth);
      } else if (event.key === '-') {  // Zoom out
        itemSize = Math.max(minItemSize, itemSize - itemSizeStep);
      }
    }
  }}
  on:wheel={event => {
    if (disabled) {
      return;
    }

    if (event.ctrlKey) {
      if ($context.draggedItem === null) {
        const delta = (event.deltaY / -100) * itemSizeStep;
        itemSize = clamp(
          minItemSize,
          gridWidth,
          snapItemSize(itemSize + delta)
        );
      }
    } else {
      const delta = (event.deltaY / 100) * scrollFactor;
      y.set(clamp(dragConstraints.top, 0, y.get() - delta));
      //animate(y, clamp(dragConstraints.top, 0, y.get() - delta));
    }
  }}
/>

<div
  bind:this={viewport}
  class="
    flex
    items-stretch
    justify-center
    h-full
    p-6
    overflow-hidden
    outline-none
    select-none
  "
  on:dragenter|preventDefault={event => {
    // Check if element is dragged from outside of viewport
    if (!dragEntered && (event.relatedTarget === null || (
      event.relatedTarget instanceof Node && !viewport?.contains(event.relatedTarget)
    ))) {
      dragEntered = true;
      onDragStart?.(getIndexAtPointer({
        x: event.clientX,
        y: event.clientY
      }));
    }
  }}
  on:dragleave|preventDefault={event => {
    // Check if element is dragged outside of viewport
    if (event.relatedTarget === null || (
      event.relatedTarget instanceof Node && !viewport?.contains(event.relatedTarget)
    )) {
      dragEntered = false;
      onDragEnd?.();
    }
  }}
  on:dragover|preventDefault={event => {
    onDragOver?.(getIndexAtPointer({
      x: event.clientX,
      y: event.clientY
    }));

    scrollViewport({
      x: event.clientX,
      y: event.clientY
    });
  }}
  on:drop|preventDefault={event => {
    dragEntered = false;
    onDragEnd?.();

    if (event.dataTransfer !== null) {
      onDrop?.(event.dataTransfer.files);
    }
  }}
  on:pointerdown={event => dragControls.start(event)}
>
  <Motion
    let:motion
    drag="y"
    {dragConstraints}
    {dragControls}
    dragListener={false}
    style={{ y }}
  >
    <div
      use:motion
      bind:clientWidth={gridWidth}
      class="flex-grow max-w-screen-xl preserve-3d"
      style="height: {gridHeight}px;"
    >
      {#each items.slice(start, end) as item, i (selectId(item))}
        <slot {item} index={start + i} />
      {/each}
    </div>
  </Motion>
</div>

<style lang="scss">
  .preserve-3d {
    transform-style: preserve-3d;
  }
</style>
