<script context="module" lang="ts">
  type Tab = {};

  export type TabsContext = {
    registerTab: (tab: Tab) => void
  };

  export const tabsContextKey = {};
</script>

<script lang="ts">
  import { onDestroy, setContext } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  export let selected: number;

  let tabs: Tab[] = [];
  const indicatorPos = tweened(0, { duration: 300, easing: cubicOut });

  setContext<TabsContext>(tabsContextKey, {
    registerTab: tab => {
      tabs = [...tabs, tab];

      onDestroy(() =>	tabs = tabs.filter(t => t !== tab));
    }
  });

  $: if (tabs.length > 0) {
    $indicatorPos = selected / tabs.length;
  }
</script>

<div class="flex justify-center">
  <div
    class="
      relative
      max-w-fit
      grid
      auto-cols-fr
      grid-flow-col
      place-content-center
    "
  >
    <slot />

    {#if tabs.length > 0}
      <div
        class="absolute bottom-0 h-0.5 bg-white pointer-events-none"
        style="
          width: calc(100% / {tabs.length});
          left: {$indicatorPos * 100}%;
        "
      />
    {/if}
  </div>
</div>
