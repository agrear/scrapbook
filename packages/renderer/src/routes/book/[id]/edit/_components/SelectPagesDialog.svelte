<script lang="ts">
  import SelectPagesForm, {
    type SelectPagesFormData
  } from './SelectPagesForm.svelte';
  import Button from '/@/components/Button.svelte';
  import Dialog from '/@/components/Dialog.svelte';
  import DialogActions from '/@/components/DialogActions.svelte';
  import DialogContent from '/@/components/DialogContent.svelte';
  import DialogTitle from '/@/components/DialogTitle.svelte';

  export let open: boolean;
  export let onSelect: (metaData: SelectPagesFormData) => void;
  export let onClose: () => void;
</script>

<Dialog {open} maxWidth="xs" fullWidth>
  <DialogTitle>Page Select</DialogTitle>

  <DialogContent>
    <SelectPagesForm id="select-pages-form" onSubmit={onSelect} />
  </DialogContent>

  <DialogActions>
    <Button onClick={onClose}>
      Cancel
    </Button>

    <Button
      type="submit"
      form="select-pages-form"
      variant="contained"
      color="primary"
    >
      Select
    </Button>
  </DialogActions>
</Dialog>
