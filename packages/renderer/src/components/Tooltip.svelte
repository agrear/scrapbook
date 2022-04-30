<script lang="ts">
  import {
    arrow as arrowMiddleware,
    autoUpdate,
    computePosition,
    flip,
    type Placement,
    offset as offsetMiddleware
  } from '@floating-ui/dom';
  import { afterUpdate } from 'svelte';
  import { cubicIn, cubicOut } from 'svelte/easing';
  import { scale } from 'svelte/transition';
  import Portal from 'svelte-portal/src/Portal.svelte';

  export let open: boolean;
  export let title: string;
  export let arrow = false;
  export let anchorElement: Element | null | undefined = undefined;
  export let placement: Placement = 'top';
  export let offset = 8;

  let root: HTMLDivElement | null = null;
  let arrowElement: HTMLDivElement | null = null;
  let cleanupAutoUpdate: () => void = () => {};

  function getTransformOrigin(placement: Placement) {
    switch (placement.split('-')[0]) {
      case 'top':
        return 'bottom center';
      case 'bottom':
        return 'top center';
      case 'left':
        return 'right center';
      case 'right':
        return 'left center';
    }
  }

  function applyArrowStyles(
    arrow: HTMLElement,
    placement: Placement,
    coords: Partial<{ x: number, y: number }>
  ) {
    const { x, y } = coords;

    const staticSide = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right'
    }[placement.split('-')[0]];

    Object.assign(arrow.style, {
      left: x !== undefined ? `${x}px` : '',
      top: y !== undefined ? `${y}px` : '',
      right: '',
      bottom: '',
      [staticSide!]: '-4px'
    });
  }

  afterUpdate(async () => {
    if (root !== null) {
      const anchor = anchorElement ?? root.parentElement;
      if (anchor !== null) {
        await computePosition(anchor, root, {
          placement,
          middleware: [
            flip({
              padding: 8
            }),
            offsetMiddleware({
              mainAxis: offset
            }),
            ...(arrowElement ? [
              arrowMiddleware({
                element: arrowElement
              })
            ] : [])
          ]
        }).then(({ middlewareData, placement, x, y }) => {
          if (root !== null) {
            Object.assign(root.style, {
              left: `${x}px`,
              top: `${y}px`,
              transformOrigin: getTransformOrigin(placement)
            });
          }

          if (middlewareData.arrow !== undefined && arrowElement !== null) {
            applyArrowStyles(arrowElement, placement, middlewareData.arrow);
          }
        });
      }
    }
  });
</script>

{#if open && title}
  <Portal>
    <div
      bind:this={root}
      in:scale={{ duration: 150, easing: cubicOut, opacity: 0, start: 0.75 }}
      out:scale={{ duration: 100, easing: cubicIn, opacity: 0, start: 0.5 }}
      class="absolute z-tooltip p-1 bg-neutral-700 select-none"
    >
      {title}

      {#if arrow}
        <div
          bind:this={arrowElement}
          class="absolute w-2 h-2 rotate-45 bg-neutral-700"
        />
      {/if}
    </div>
  </Portal>
{/if}
