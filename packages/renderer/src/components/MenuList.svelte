<script lang="ts">
  import List from './List.svelte';

  interface $$Slots {
		default: {
			start: number,
      end: number
		}
	}

  export let items: number;
  export let dense = false;
  export let maxHeight: number | string | undefined = undefined;

  export function scrollToIndex(index: number) {
    root?.scrollToIndex(index);
  }

  let root: List | null = null;
</script>

<List
  bind:this={root}
  {items}
  {dense}
  {maxHeight}
  let:start
  let:end
  on:pointerdown
>
  <slot {start} {end} />
</List>
