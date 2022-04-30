<script lang="ts">
  import Icon from '@iconify/svelte';
  import type { IconifyIcon } from '@iconify/svelte/dist/iconify';
  import { MDCRipple } from '@material/ripple';
  import { onMount } from 'svelte';

  type Color = 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

  export let color: Color = 'default';
  export let disabled = false;
  export let disableRipple = false;
  export let href: string | undefined = undefined;
  export let icon: IconifyIcon;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let type: string = 'button';
  export let onClick: (() => void) | undefined = undefined;

  let button: HTMLButtonElement;
  let ripple: MDCRipple | null = null;

  function getIconSize() {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 32;
      case 'large':
        return 40;
      default:
        throw new Error('Unknown size');
    }
  }

  $: if (ripple) {
    ripple.disabled = disableRipple;
  }

  onMount(() => {
    if (button !== null) {
      ripple = MDCRipple.attachTo(button);
      ripple.unbounded = true;

      return () => ripple?.destroy();
    }
  });
</script>

<button
  bind:this={button}
  class="mdc-icon-button"
  class:color-default={color === 'default'}
  class:color-primary={color === 'primary'}
  class:color-error={color === 'error'}
  class:small={size === 'small'}
  class:medium={size === 'medium'}
  class:large={size === 'large'}
  {disabled}
  {type}
  on:click={onClick}
>
  <div class="mdc-icon-button__ripple" />

  <Icon
    {icon}
    style="width: {getIconSize()}px; height: {getIconSize()}px"
  />
</button>

<style lang="scss">
  @use "../theme";
  @use "@material/icon-button";

  .color-default {
    @include icon-button.ink-color(#fff);
  }

  .color-primary {
    @include icon-button.ink-color(theme.$primary);
  }

  .color-error {
    @include icon-button.ink-color(theme.$error);
  }

  .small {
    @include icon-button.size(24px);
  }

  .medium {
    @include icon-button.size(40px);
    padding: 4px;
  }

  .large {
    @include icon-button.size(52px);
    padding: 6px;
  }
</style>
