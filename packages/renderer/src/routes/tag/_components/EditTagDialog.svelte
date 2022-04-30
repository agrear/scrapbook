<script lang="ts">
  import EditTagForm, { type EditTagFormData } from './EditTagForm.svelte';
  import Button from '/@/components/Button.svelte';
  import Dialog from '/@/components/Dialog.svelte';
  import DialogActions from '/@/components/DialogActions.svelte';
  import DialogContent from '/@/components/DialogContent.svelte';
  import DialogTitle from '/@/components/DialogTitle.svelte';

  export let open: boolean;
  export let tag: Tag;
  export let tags: Tag[];
  export let onSave: (formData: EditTagFormData) => void;
  export let onClose: () => void;
</script>

<Dialog {open} maxWidth="xs" fullWidth>
  <DialogTitle>Edit tag</DialogTitle>

  <DialogContent>
    <EditTagForm
      id="edit-tag-form"
      {tag}
      {tags}
      onSubmit={onSave}
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={onClose}>
      Cancel
    </Button>

    <Button
      type="submit"
      form="edit-tag-form"
      variant="contained"
      color="primary"
    >
      Save
    </Button>
  </DialogActions>
</Dialog>
