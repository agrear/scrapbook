<script lang="ts">
  import { clamp } from '@popmotion/popcorn';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import {
    animate,
    Motion,
    type PanInfo,
    type Point2D,
    type Spring,
    useMotionValue,
    type Variants
  } from 'svelte-motion';

  import {
    contextKey,
    getGridColumn,
    getGridRow,
    type ImageListContext,
    springOptions,
    type Item
  } from './ImageList.svelte';
  import Checkbox from './Checkbox.svelte';

  type T = $$Generic<Item>;

  const spring: Spring = {
    type: 'spring',
    ...springOptions
  };

  const variants: Variants = {
    initial: {
      filter: 'drop-shadow(0px 0px 0px rgba(0, 0, 0, .5))',
      scale: 1,
      transition: {
        type: 'tween',
        ease: 'circOut',
        duration: 0.2
      },
      z: 0
    },
    panning: {
      filter: 'drop-shadow(15px 15px 4px rgba(0, 0, 0, .5))',
      scale: 1.15,
      transition: spring,
      z: 100
    }
  };

  export let index: number;
  export let selected: boolean | undefined = undefined;
  export let onClick: (() => void) | undefined = undefined;
  export let onMove: ((from: number, to: number) => void) | undefined = undefined;
  export let onToggle: ((checked: boolean) => void) | undefined = undefined;

  const context = getContext<Writable<ImageListContext<T>>>(contextKey);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  let position: Point2D | undefined;
  let panning = false;
  let moved = false;
  let mounted = false;

  function getIndexAtOffset(
    index: number,
    offset: Point2D,
    columns: number,
    items: number,
    itemSize: number,
    gap: number
  ): number {
    // Snap to nearest column
    const deltaX = Math.round(offset.x / (itemSize + gap));
    const column = getGridColumn(index, columns) + deltaX;
    // Snap to nearest row
    const deltaY = Math.round(offset.y / (itemSize + gap));
    const row = getGridRow(index, columns) + deltaY;

    return clamp(0, items - 1, row * columns + column);
  }

  function onPanStart(info: PanInfo) {
    moved = true;
    panning = true;

    $context.draggedItem = {
      index,
      scrollY: $context.scrollY,
      ...position!
    };
  }

  function onPan(info: PanInfo) {
    const { draggedItem } = $context;

    if (draggedItem !== null) {
      const scroll = draggedItem.scrollY - $context.scrollY;
      x.set(draggedItem.x + info.offset.x);
      y.set(draggedItem.y + info.offset.y + scroll);

      const { columns, rows, gap, itemSize, items } = $context;
      const dragIndex = getIndexAtOffset(
        draggedItem.index,
        { x: info.offset.x, y: info.offset.y + scroll },
        columns,
        items,
        itemSize,
        gap
      );

      $context.scrollViewport(info.point);

      if (index !== dragIndex) {
        onMove?.(index, dragIndex);
      }
    }
  }

  function onPanEnd(info: PanInfo) {
    if ($context.draggedItem === null) {
      return;
    }

    panning = false;

    $context.draggedItem = null;
  }

  $: if ($context) {
    const { columns, gap, itemSize, offset } = $context;

    const column = getGridColumn(index, columns);
    const row = getGridRow(index, columns);

    position = {
      x: column * (itemSize + gap) + offset,
      y: row * (itemSize + gap)
    };
  }

  $: if (!panning && position) {
    if (mounted) {
      animate(x, position.x, spring);
      animate(y, position.y, spring);

      //if (Math.abs(x.get()) > 1000) {
      //  console.log('pos.x:', position.x, x.get());
      //}
    } else {
      x.set(position.x);
      y.set(position.y);
      mounted = true;
    }
  };
</script>

<Motion
  let:motion
  initial="initial"
  animate={panning ? 'panning' : 'initial'}
  {variants}
  onPanStart={$context.sortable ? (_event, info) => onPanStart(info) : undefined}
  onPan={$context.sortable ? (_event, info) => onPan(info) : undefined}
  onPanEnd={$context.sortable ? (_event, info) => onPanEnd(info) : undefined}
  onTapStart={(event, _info) => {
    if ($context.sortable) {
      event.stopPropagation();
    }
  }}
  onTap={event => {
    if (!moved) {
      onClick?.();
    }

    moved = false;
  }}
  style={{ x, y, width: $context.itemWidth, height: $context.itemHeight }}
>
  <div
    use:motion
    class="absolute cursor-pointer pointer-events-none"
    class:draggable={$context.sortable}
    class:panning
  >
    <slot />

    {#if selected !== undefined}
      <div
        class="absolute checkbox pointer-events-auto"
        on:pointerdown|stopPropagation={() => {}}
      >
        <Checkbox
          density={-2}
          checked={selected}
          tabIndex={-1}
          onChange={() => {
            onToggle?.(selected = !selected);
          }}
        />
      </div>
    {/if}
  </div>
</Motion>

<style lang="scss">
  .draggable {
    &:hover {
      @apply cursor-grab;
    }

    &:active {
      @apply cursor-grabbing;
    }

    &.panning:active {
      @apply cursor-move;
    }
  }

  .checkbox {
    top: -7px;
    right: -7px;
  }

  .checkbox :global(.mdc-checkbox__background) {
    @apply backdrop-blur-md;
    background-color: #20202080 !important;
  }
</style>
