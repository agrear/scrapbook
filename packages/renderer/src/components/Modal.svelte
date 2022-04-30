<script context="module" lang="ts">
  export type ModalCloseReason = 'escapeKeyDown' | 'backdropClick';
</script>

<script lang="ts">
  import { linear } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import Portal from 'svelte-portal/src/Portal.svelte';

  export let open: boolean;
  export let disableEscapeKeyDown = false;
  export let opacity = 0.4;
  export let onClose: (
    (reason: ModalCloseReason) => void
  ) | undefined = undefined;

  let root: HTMLDivElement | null = null;
</script>

<svelte:window
  on:keydown={event => {
    if (open) {
      if (event.key === 'Escape' && !disableEscapeKeyDown) {
        onClose?.('escapeKeyDown');
      }
    }
  }}
/>

{#if open}
  <Portal>
    <div
      bind:this={root}
      class="fixed inset-0 z-modal bg-black"
      style="--tw-bg-opacity: {opacity};"
      in:fade={{ duration: 225, easing: linear }}
      out:fade={{ duration: 195, easing: linear }}
      on:click={event => {
        if (event.target === root) {
          onClose?.('backdropClick');
        }
      }}
    >
      <slot />
    </div>
  </Portal>
{/if}
