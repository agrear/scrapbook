<script lang="ts">
  import alertIcon from '@iconify/icons-mdi/alert';
  import IconifyIcon from '@iconify/svelte';

  import Button from '/@/components/Button.svelte';
  import Dialog from '/@/components/Dialog.svelte';
  import DialogActions from '/@/components/DialogActions.svelte';
  import DialogContent from '/@/components/DialogContent.svelte';

  export let open: boolean;
  export let message: string;
  export let onCancel: () => void;
  export let onConfirm: () => void;
</script>

<Dialog {open} onClose={onCancel}>
  <DialogContent>
    <div class="flex flex-col items-center justify-center">
      <IconifyIcon icon={alertIcon} width={64} />
      <span class="text-2xl mt-2 select-none">{message}</span>
    </div>
  </DialogContent>

  <DialogActions>
    <Button onClick={onCancel}>
      Cancel
    </Button>

    <Button variant="contained" color="primary" onClick={onConfirm}>
      Delete
    </Button>
  </DialogActions>
</Dialog>
