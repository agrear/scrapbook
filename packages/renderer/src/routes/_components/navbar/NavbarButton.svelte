<script lang="ts">
  import IconifyIcon from '@iconify/svelte';

  export let icon: any;
  export let disabled = false;
  export let selected = false;
</script>

<button
  type="button"
  {disabled}
  tabindex={-1}
  class="flex flex-nowrap items-center bg-opacity-50"
  class:bg-gray-500={selected}
  class:bg-transparent={!selected}
  on:click
>
  <span class="flex justify-center box-border p-1" style="min-width: 36px">
    <IconifyIcon
      icon={icon}
      width={28}
      color={disabled ? 'gray' : undefined}
    />
  </span>

  {#if $$slots.default}
    <span class="flex justify-start items-baseline flex-grow px-2">
      <span class="whitespace-nowrap mdc-typography--button">
        <slot />
      </span>
    </span>
  {/if}
</button>

<style>
  button:hover:not([disabled]) {
    background-color: rgba(107, 114, 128, 0.5);
  }
</style>
