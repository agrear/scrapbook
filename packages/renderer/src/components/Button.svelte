<script lang="ts">
  import IconifyIcon from '@iconify/svelte';
  import { MDCRipple } from '@material/ripple';
  import { onDestroy, onMount } from 'svelte';

  type Color = 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';

  export let disabled = false;
  export let disableElevation = false;
  export let disableRipple = false;
  export let form: string | undefined = undefined;
  export let fullWidth = false;
  export let href: string | undefined = undefined;
  export let minWidth: string | number | undefined = undefined;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let variant: 'contained' | 'outlined' | 'text' = 'text';
  export let color: Color = 'primary';
  export let startIcon: any | undefined = undefined;
  export let endIcon: any | undefined = undefined;
  export let type: 'button' | 'reset' | 'submit' = 'button';
  export let tabIndex: number | undefined = undefined;
  export let onClick: (svelte.JSX.MouseEventHandler<HTMLButtonElement>) | undefined = undefined;

  let button: HTMLButtonElement;
  let ripple: MDCRipple | null = null;

  // TODO: Color, href

  $: if (ripple) {
    ripple.disabled = disableRipple;
  }

  onMount(() => {
    ripple = MDCRipple.attachTo(button);
  });

  onDestroy(() => {
    ripple?.destroy();
  });
</script>

<button
  bind:this={button}
  class="mdc-button"
  class:mdc-button--outlined={variant === 'outlined'}
  class:mdc-button--raised={variant === 'contained' && !disableElevation}
  class:mdc-button--unelevated={variant === 'contained' && disableElevation}
  class:mdc-button--icon-leading={startIcon}
  class:mdc-button--icon-trailing={endIcon}
  class:mdc-button--dense={size === 'small'}
  class:w-full={fullWidth}
  {disabled}
  {type}
  tabindex={tabIndex}
  {form}
  on:click={onClick}
  style="min-width: {minWidth};"
>
  <span class="mdc-button__ripple" />

  {#if startIcon}
    <i class="mdc-button__icon" aria-hidden>
      <IconifyIcon icon={startIcon} height={18} />
    </i>
  {/if}

  <span class="mdc-button__label"><slot /></span>

  {#if endIcon}
    <i class="mdc-button__icon" aria-hidden>
      <IconifyIcon icon={endIcon} height={18} />
    </i>
  {/if}
</button>

<style lang="scss">
  @use "../theme";
  @use "@material/button";

  button {
    @include button.ink-color(#fff);
    //@include button.horizontal-padding(40px);
  }

  .color-default {
    @include button.filled-accessible(#fff);
  }

  .color-primary {
    @include button.filled-accessible(theme.$primary);
  }
</style>
