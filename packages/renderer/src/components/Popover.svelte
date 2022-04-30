<script context="module" lang="ts">
  import type { ModalCloseReason } from './Modal.svelte';

  export type PopoverCloseReason = ModalCloseReason | 'tabKeyDown';
</script>

<script lang="ts">
  import type { Placement } from '@floating-ui/dom';

  import Floater from './Floater.svelte';
  import Modal from './Modal.svelte';

  export let open: boolean;
  export let anchorElement: Element | null | undefined = undefined;
  export let anchorOrigin: Placement | undefined = undefined;
  export let onClose: (
    (reason: PopoverCloseReason) => void
  ) | undefined = undefined;
</script>

<svelte:window
  on:keydown={event => {
    if (open && event.key === 'Tab') {
      onClose?.('tabKeyDown');
    }
  }}
/>

<Modal {open} opacity={0} {onClose}>
  <Floater {open} {anchorElement} {anchorOrigin}>
    <slot />
  </Floater>
</Modal>
