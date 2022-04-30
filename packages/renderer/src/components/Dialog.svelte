<script lang="ts">
  import { cubicIn, cubicOut } from 'svelte/easing';
  import { scale } from 'svelte/transition';

  import Modal, { type ModalCloseReason } from './Modal.svelte';

  export let open: boolean;
  export let fullscreen = false;
  export let fullWidth = false;
  export let maxWidth: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = false;
  export let disableEscapeKeyDown = false;
  export let onClose: ((reason: ModalCloseReason) => void) | undefined = undefined;

  function getMaxWidth() {
    switch (maxWidth) {
      case 'xs':
        return '480px';
      case 'sm':
        return '600px';
      case 'md':
        return '960px';
      case 'lg':
        return '1280px';
      case 'xl':
        return '1920px';
      default:
        return 'none';
    }
  }
</script>

<Modal
  {open}
  {disableEscapeKeyDown}
  {onClose}
>
  <div
    class="dialog"
    class:fullscreen
    style="
      width: {fullWidth ? '100%' : 'fit-content'};
      max-width: {getMaxWidth()};
    "
    in:scale="{{ duration: 225, easing: cubicOut, opacity: 0, start: 0.5 }}"
    out:scale="{{ duration: 195, easing: cubicIn, opacity: 0, start: 0.5 }}"
  >
    <slot />
  </div>
</Modal>

<style>
  .dialog {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 32px);
    padding: 1rem 1.5rem 1.5rem;
    background-color: #424242;
  }

  .fullscreen {
    width: 100%;
    height: 100%;
  }
</style>
