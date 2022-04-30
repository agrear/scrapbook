<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import {
    AnimatePresence,
    Motion,
    useDragControls,
    type Variants
  } from 'svelte-motion';

  import { type FlipViewContext, key } from './_flipView';

  type T = $$Generic<Record<string, any>>;

  type VariantProps = {
    direction: number,
    width: number
  };

  const variants: Variants = {
    initial: ({ direction, width }: VariantProps) => ({
      x: direction === 0 ? 0 : (direction > 0 ? width : -width)
    }),
    enter: ({ direction }: VariantProps) => ({
      x: 0,
      transition: {
        x: {
          type: 'tween',
          ease: 'easeInOut',
          duration: direction === 0 ? 0 : 0.4
        }
      }
    }),
    exit: ({ direction, width }: VariantProps) => ({
      x: direction < 0 ? width : -width,
      transition: {
        x: {
          type: 'tween',
          ease: 'easeInOut',
          duration: 0.4
        }
      }
    })
  };

  export let items: T[];
  export let selectedIndex: number;
  export let selectId: (item: T) => string = item => item.id;
  export let onFlip: (index: number) => void;
  export let onZoom: ((delta: number) => void) | undefined = undefined;
  export let onResetZoom: (() => void) | undefined = undefined;

  let previousIndex = selectedIndex;

  const flipView = writable<FlipViewContext>({
    width: null,
    height: null,
    direction: 0,
    dragControls: useDragControls(),
    onFlip: direction => {
      const index = selectedIndex + direction;

      if (index >= 0 && index < items.length) {
        onFlip(index);
      }
    }
  });

  setContext(key, flipView);

  function startDrag(event: PointerEvent) {
    $flipView.dragControls.start(event);
  }

  $: {
    const direction = Math.sign(selectedIndex - previousIndex);
    $flipView.direction = direction as 1 | 0 | -1;
    previousIndex = selectedIndex;
  }
</script>

<svelte:window
  on:keydown={event => {
    if (event.ctrlKey) {
      switch (event.key) {
        case '+':  // Zoom in
          event.stopPropagation();
          onZoom?.(0.05);
          break;
        case '-':  // Zoom out
          event.stopPropagation();
          onZoom?.(-0.05);
          break;
        case '0':  // Reset zoom
          event.stopPropagation();
          onResetZoom?.();
          break;
        case 'Control':
          event.stopPropagation();
          break;
        default:
          break;
      }
    } else {
      switch (event.key) {
        case 'Home':
          event.stopPropagation();
          if (selectedIndex !== 0) {
            onFlip(0);
          }
          break;
        case 'End':
          event.stopPropagation();
          if (selectedIndex !== items.length - 1) {
            onFlip(items.length - 1);
          }
          break;
        case 'PageDown':
          event.stopPropagation();
          $flipView.onFlip(-1);
          break;
        case 'PageUp':
          event.stopPropagation();
          $flipView.onFlip(1);
          break;
        default:
          break;
        }
      }
    }
  }
  on:wheel={event => {
    if (event.ctrlKey) {
      const delta = (event.deltaY / -100) * 0.05;
      onZoom?.(delta);
    }
  }}
/>

<div
  bind:clientWidth={$flipView.width}
  bind:clientHeight={$flipView.height}
  on:pointerdown={startDrag}
  class="relative w-full h-full select-none"
>
  <AnimatePresence
    custom={{
      direction: $flipView.direction,
      width: $flipView.width * 1.5
    }}
    list={[{
      key: selectId(items[selectedIndex]),
      item: items[selectedIndex]
    }]}
    let:item
  >
    <Motion
      let:motion
      {variants}
      initial="initial"
      animate="enter"
      exit="exit"
      custom={{
        direction: $flipView.direction,
        width: $flipView.width
      }}
    >
      <div use:motion class="absolute inset-0 overflow-hidden">
        <slot item={item.item} />
      </div>
    </Motion>
  </AnimatePresence>
</div>
