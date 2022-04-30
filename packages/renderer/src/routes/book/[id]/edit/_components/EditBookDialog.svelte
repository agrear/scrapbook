<script lang="ts">
  import EditBookForm from './EditBookForm.svelte';
  import Dialog from '/@/components/Dialog.svelte';
  import DialogContent from '/@/components/DialogContent.svelte';
  import DialogTitle from '/@/components/DialogTitle.svelte';

  export let open: boolean;
  export let book: Book | undefined;
  export let authors: Author[];
  export let languages: Language[];
  export let publishers: Publisher[];
  export let series: Series[];
  export let tags: Tag[];
  export let authorIds: string[];
  export let seriesId: string | undefined;
  export let language: string | undefined;
  export let onSave: (metaData: EditBookFormData) => void;
  export let onClose: () => void;
</script>

<Dialog {open} maxWidth="sm" fullWidth>
  <DialogTitle>{book ? 'Save' : 'Create new'} book</DialogTitle>

  <DialogContent>
    <EditBookForm
      {book}
      {authors}
      {languages}
      {publishers}
      {series}
      {tags}
      {authorIds}
      {seriesId}
      {language}
      onCancel={onClose}
      onSubmit={onSave}
    />
  </DialogContent>
</Dialog>
