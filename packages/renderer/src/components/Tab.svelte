<script lang="ts">
  import { MDCRipple } from '@material/ripple';
  import { getContext, onDestroy,  onMount } from 'svelte';

  import { type TabsContext, tabsContextKey } from './Tabs.svelte';

  export let label: string;
  export let href: string;
  export let disabled = false;

  const { registerTab } = getContext<TabsContext>(tabsContextKey);

  const tab = {};

  registerTab(tab);

  let root: HTMLAnchorElement | null = null;
  let ripple: MDCRipple | null = null;

  onMount(() => ripple = new MDCRipple(root!));

  onDestroy(() => ripple?.destroy());
</script>

<a bind:this={root} {href} {disabled} class="mdc-button">
  <span class="mdc-button__ripple" />
  <span class="mdc-button__label">{label}</span>
</a>

<style lang="scss">
  @use "../theme";
  @use "@material/button";

  a {
    @include button.ink-color(white);
  }
</style>
