<script lang="ts">
  import alertIcon from '@iconify/icons-mdi/alert';
  import clockOutlineIcon from '@iconify/icons-mdi/clock-outline';
  import IconifyIcon from '@iconify/svelte';

  import Button from '/@/components/Button.svelte';
  import Dialog from '/@/components/Dialog.svelte';
  import DialogActions from '/@/components/DialogActions.svelte';
  import DialogContent from '/@/components/DialogContent.svelte';

  export let open: boolean;
  export let noResults: boolean;
  export let onClose: () => void;
</script>

<Dialog {open} {onClose}>
  {#if noResults}
    <DialogContent>
      <div class="flex flex-col items-center justify-center select-none">
        <IconifyIcon icon={alertIcon} width={64} />
        <span class="text-2xl mt-2 select-none">
          No new images found
        </span>
      </div>
    </DialogContent>

    <DialogActions>
      <Button color="primary" variant="contained" onClick={onClose}>
        OK
      </Button>
    </DialogActions>
  {:else}
    <DialogContent>
      <div class="flex flex-col items-center justify-center select-none">
        <IconifyIcon icon={clockOutlineIcon} width={64} />
        <span class="text-2xl mt-2">Searching files...</span>
      </div>
    </DialogContent>
  {/if}
</Dialog>
