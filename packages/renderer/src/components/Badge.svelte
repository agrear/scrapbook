<script lang="ts">
  import { autoUpdate, computePosition, offset } from '@floating-ui/dom';
  import { onMount } from 'svelte';

  export let content: number | undefined = undefined;
  export let max = 99;

  let root: HTMLDivElement | null = null;
  let badge: HTMLSpanElement | null = null;

  async function update() {
    if (root !== null && badge !== null) {
      return computePosition(root, badge, {
        placement: 'left-start',
        middleware: [
          offset(({ floating }) => ({
            mainAxis: -floating.width / 2,
            crossAxis: -floating.height / 2
          }))
        ]
      }).then(({ x, y }) => {
        if (badge) {
          const style: Partial<CSSStyleDeclaration> = {
            transform: `translate(${Math.round(-x)}px, ${Math.round(y)}px)`
          };

          Object.assign(badge.style, style);
        }
      });
    }
  }

  onMount(() => {
    return autoUpdate(root!, badge!, update, {
      ancestorResize: false,
      ancestorScroll: false
    });
  });
</script>

<div
  bind:this={root}
  class="flex flex-1 min-w-0 overflow-hidden"
>
  <slot />
</div>

<span
  bind:this={badge}
  class="
    absolute
    top-0
    right-0
    inline-flex
    items-center
    justify-center
    min-w-fit
    h-6
    px-2
    py-0.5
    rounded-full
    bg-blue-800
    mdc-typography--body2
  "
  class:hidden={content === undefined}
>
  {(content ?? 0) > max ? `${max}+` : content}
</span>
