<script lang="ts">
  import clockIcon from '@iconify/icons-mdi/clock';
  import IconifyIcon from '@iconify/svelte';

  import Dialog from '/@/components/Dialog.svelte';
  import DialogContent from '/@/components/DialogContent.svelte';

  export let open: boolean;
  export let progress: string;
</script>

<Dialog {open}>
  <DialogContent>
    <div class="flex flex-col items-center justify-center">
      <IconifyIcon icon={clockIcon} width={64} />
      <span class="text-2xl mt-2 select-none">{progress}</span>
    </div>
  </DialogContent>
</Dialog>
