<script lang="ts">
  import { clamp } from '@popmotion/popcorn';
  import { getContext, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import {
    animate,
    type BoundingBox2D,
    Motion,
    type Point2D,
    type Spring,
    useMotionValue
  } from 'svelte-motion';

  import { type FlipViewContext, key } from './_flipView';
  import {
    fitObjectPosition,
    fitObjectSize,
    getAlignment,
    type Size
  } from '../util';

  type T = $$Generic<Record<string, any> & Size>;

  const spring: Spring = {
    type: 'spring',
    damping: 50,
    stiffness: 300,
    mass: 1.25
  };

  // Controls the amount of speed necessary when dragging to
  // flip to the next/previous page
  const flipThreshold = 1800;

  // Distance factor for panning with scroll wheel and arrow keys
  const panDistanceFactor = 0.25;

  export let item: Promise<T>;
  export let objectFit: ObjectFit;
  export let objectPosition: ObjectPosition;
  export let zoom: number;

  export function focus() {
    root?.focus();
  }

  const parent = getContext<Writable<FlipViewContext>>(key);

  const x = useMotionValue<number>(0);
  const y = useMotionValue<number>(0);

  let root: HTMLDivElement | null = null;
  let parentSize: Size | null = null;
  let resolvedItem: T;
  let itemSize: Size;
  let size: Size;
  let position: Point2D;
  let dragConstraints: BoundingBox2D;

  function resetDrag() {
    animate(x, 0, spring);
    animate(y, 0, spring);
  }

  $: {
    if ($parent.width !== null && $parent.height !== null) {
      parentSize = { width: $parent.width, height: $parent.height };
    } else {
      parentSize = null;
    }
  }

  $: if (parentSize !== null && itemSize !== undefined) {
    // Compute item size
    const imageSize = fitObjectSize(objectFit, parentSize, itemSize);
    const updated = { width: imageSize.width * zoom, height: imageSize.height * zoom };

    if (updated.width !== size?.width || updated.height !== size?.height) {
      size = updated;
    }
  }

  $: if (parentSize !== null && size !== undefined) {
    const updated = fitObjectPosition(objectPosition, parentSize, size);
    if (updated.x !== position?.x || updated.y !== position.y) {
      position = updated;
    }
  }

  $: if (parentSize !== null && size !== undefined) {
    const [horizontal, vertical] = getAlignment(objectPosition);
    let left = 0, right = 0, top = 0, bottom = 0;

    switch (horizontal) {
      case 'left':
        left = Math.min(0, parentSize.width - size.width);
        break;
      case 'center':
        left = Math.min(0, (parentSize.width - size.width) * 0.5);
        right = Math.max(0, (size.width - parentSize.width) * 0.5);
        break;
      case 'right':
        right = Math.max(0, size.width - parentSize.width);
        break;
    }

    switch (vertical) {
      case 'top':
        top = Math.min(0, parentSize.height - size.height);
        break;
      case 'center':
        top = Math.min(0, parentSize.height - size.height) * 0.5;
        bottom = Math.max(0, size.height - parentSize.height) * 0.5;
        break;
      case 'bottom':
        bottom = Math.max(0, size.height - parentSize.height);
        break;
    }

    if (
      left !== dragConstraints?.left || right !== dragConstraints?.right ||
      top !== dragConstraints?.top || bottom !== dragConstraints?.bottom
    ) {
      dragConstraints = { left, right, top, bottom };

      // Animate position to fit inside new constraints
      if (x.get() < left) {
        animate(x, left, spring);
      } else if (x.get() > right) {
        animate(x, right, spring);
      }

      if (y.get() < top) {
        animate(y, top, spring);
      } else if (y.get() > bottom) {
        animate(y, bottom, spring);
      }
    }
  }

  onMount(async () => {
    try {
      resolvedItem = await item;

      itemSize = {
        width: resolvedItem.width,
        height: resolvedItem.height
      };
    } catch {}
  });
</script>

<Motion
  let:motion
  drag
  dragControls={$parent.dragControls}
  dragListener={false}
  {dragConstraints}
  dragTransition={{
    power: 0.2,
    timeConstant: 120
  }}
  onDragEnd={(e, { velocity }) => {
    if (velocity.x <= -flipThreshold) {
      $parent.onFlip(1);
    } else if (velocity.x >= flipThreshold) {
      $parent.onFlip(-1);
    }
  }}
  style={{ x, y }}
>
  <div
    bind:this={root}
    use:motion
    tabindex={0}
    class="outline-none"
    on:keydown={event => {
      if (parentSize === null || dragConstraints === undefined) {
        return;
      }

      const { left, right, top, bottom } = dragConstraints;

      switch (event.key) {
        case 'ArrowLeft': {
          event.stopPropagation();
          const delta = parentSize.width * panDistanceFactor;
          animate(x, clamp(left, right, x.get() + delta), spring);
          break;
        }
        case 'ArrowRight': {
          event.stopPropagation();
          const delta = parentSize.width * panDistanceFactor;
          animate(x, clamp(left, right, x.get() - delta), spring);
          break;
        }
        case 'ArrowDown': {
          event.stopPropagation();
          const delta = parentSize.height * panDistanceFactor;
          animate(y, clamp(top, bottom, y.get() - delta), spring);
          break;
        }
        case 'ArrowUp': {
          event.stopPropagation();
          const delta = parentSize.height * panDistanceFactor;
          animate(y, clamp(top, bottom, y.get() + delta), spring);
          break;
        }
        default:
          break;
      }
    }}
    on:wheel={event => {
      if (!event.ctrlKey) {
        if (parentSize !== null && dragConstraints !== undefined) {
          const { left, right, top, bottom } = dragConstraints;
          const offscreen = { width: right - left, height: bottom - top };

          // Scroll axis with larger offscreen portion
          if (offscreen.width > offscreen.height) {  // Scroll horizontally
            const delta = Math.sign(event.deltaY) * parentSize.width * panDistanceFactor;
            animate(x, clamp(left, right, x.get() - delta), spring);
          } else {  // Scroll vertically
            const delta = Math.sign(event.deltaY) * parentSize.height * panDistanceFactor;
            animate(y, clamp(top, bottom, y.get() - delta), spring);
          }
        }
      }
    }}
  >
    <slot item={resolvedItem} {position} {size} {resetDrag} />
  </div>
</Motion>
