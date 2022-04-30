<script lang="ts">
  import MenuItem from './MenuItem.svelte';
  import MenuList from './MenuList.svelte';
  import Popover, { type PopoverCloseReason } from './Popover.svelte';

  type T = $$Generic<string | Record<String, any>>;

  interface $$Slots {
		default: {
			item: T,
      selected: boolean
		}
	}

  export let open: boolean;
  export let items: T[];
  export let selectedIndex: number | undefined = undefined;
  export let noOptionsText = 'No options';
  export let anchorElement: Element | null | undefined = undefined;
  export let dense = false;
  export let maxHeight: number | string | undefined = undefined;
  export let onClose: (
    (reason: PopoverCloseReason) => void
  ) | undefined = undefined;

  let list: MenuList | null = null;

  $: if (open && selectedIndex !== undefined) {
    list?.scrollToIndex?.(selectedIndex);
  }
</script>

<Popover {open} {anchorElement} {onClose}>
  <MenuList
    bind:this={list}
    items={items.length !== 0 ? items.length : 1}
    {dense}
    {maxHeight}
    let:start
    let:end
  >
    {#each items.slice(start, end) as item, i (item)}
      <slot {item} selected={selectedIndex === start + i} />
    {/each}

    {#if items.length === 0}
      <MenuItem disabled>
        <em>{noOptionsText}</em>
      </MenuItem>
    {/if}
  </MenuList>
</Popover>
