<script lang="ts">
  import ListItemButton from './ListItemButton.svelte';

  export let activated = false;
  export let disabled = false;
  export let selected = false;
  export let onClick: ((event: MouseEvent) => void) | undefined = undefined;
</script>

<ListItemButton
  {activated}
  {disabled}
  {selected}
  role="menuitem"
  {onClick}
>
  <slot />
</ListItemButton>
