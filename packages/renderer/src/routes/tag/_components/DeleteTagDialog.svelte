<script lang="ts">
  import Button from '/@/components/Button.svelte';
  import Dialog from '/@/components/Dialog.svelte';
  import DialogActions from '/@/components/DialogActions.svelte';
  import DialogContent from '/@/components/DialogContent.svelte';
  import DialogTitle from '/@/components/DialogTitle.svelte';

  export let open = false;
  export let tag: Tag;
  export let onDelete: (tag: Tag) => void;
  export let onClose: () => void;
</script>

<Dialog
  {open}
  maxWidth="xs"
  fullWidth
  {onClose}
>
  <DialogTitle>Delete tag</DialogTitle>

  <DialogContent>
    Are you sure you want to delete the <em>{tag.name}</em> tag,
    removing it from {tag.count} books?
  </DialogContent>

  <DialogActions>
    <Button onClick={onClose}>
      Cancel
    </Button>

    <Button
      variant="contained"
      color="primary"
      onClick={() => onDelete(tag)}
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>
