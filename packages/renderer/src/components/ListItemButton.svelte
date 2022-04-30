<script lang="ts">
  import { MDCRipple } from '@material/ripple';
  import { onDestroy, onMount } from 'svelte';

  export let activated = false;
  export let disabled = false;
  export let selected = false;
  export let role: string | undefined = undefined;
  export let onClick: ((event: MouseEvent) => void) | undefined = undefined;

  let root: HTMLLIElement | null = null;
  let ripple: MDCRipple | null = null;

  onMount(() => {
    ripple = new MDCRipple(root!);
  });

  onDestroy(() => {
    ripple?.destroy();
  });
</script>

<li
  bind:this={root}
  {role}
  {disabled}
  class="mdc-deprecated-list-item select-none"
  class:mdc-deprecated-list-item--disabled={disabled}
  class:mdc-deprecated-list-item--selected={selected}
  class:mdc-deprecated-list-item--activated={activated}
  on:click={onClick}
>
  <span class="mdc-deprecated-list-item__ripple" />

  <slot />
</li>

<style lang="scss">
  @use "../theme";
  @use "@material/list";

  li {
    @include list.deprecated-item-primary-text-ink-color(#fff);
    @include list.deprecated-item-graphic-fill-color(#fff);
  }
</style>
