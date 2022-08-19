<script lang="ts">
  import {
    computePosition,
    flip,
    type Placement,
    size
  } from '@floating-ui/dom';
  import { cubicIn, cubicOut } from 'svelte/easing';
  import { scale } from 'svelte/transition';

  export let open: boolean;
  export let anchorElement: Element | null | undefined = undefined;
  export let anchorOrigin: Placement = 'bottom-start';

  let root: HTMLDivElement | null = null;

  $: if (root) {
    const anchor = anchorElement ?? root.parentElement;
    if (anchor !== null) {
      computePosition(anchor, root, {
        placement: anchorOrigin,
        middleware: [
          flip({
            fallbackPlacements: ['top-start']
          }),
          size({
            apply({ availableHeight: height, rects: { reference } }) {
              if (root) {
                const style: Partial<CSSStyleDeclaration> = {
                  minWidth: `${reference.width}px`,
                  maxHeight: `${height}px`
                };

                Object.assign(root.style, style);
              }
            }
          })
        ]
      }).then(({ placement, x, y }) => {
        if (root) {
          const origin = placement.split('-')[0];

          const style: Partial<CSSStyleDeclaration> = {
            left: `${x}px`,
            top: `${y}px`,
            transformOrigin: `${origin === 'bottom' ? 'top' : 'bottom'} left`
          };

          Object.assign(root.style, style);
        }
      });
    }
  }
</script>

{#if open}
  <div
    bind:this={root}
    in:scale={{ duration: 150, easing: cubicOut, opacity: 0, start: 0.75 }}
    out:scale={{ duration: 100, easing: cubicIn, opacity: 0, start: 0.5 }}
    class="absolute z-tooltip bg-neutral-800"
  >
    <slot />
  </div>
{/if}
