<script context="module" lang="ts">
  const load: RoutifyLoad = async () => {
    return {
      props: {
        tags: await window.scrapbookApi.getTags()
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  import { goto } from '@roxi/routify';
  import { produce } from 'immer';

  import DeleteTagDialog from './_components/DeleteTagDialog.svelte';
  import EditTagDialog from './_components/EditTagDialog.svelte';
  import TagSearch from './_components/TagSearch.svelte';
  import DataGrid, { type GridColDef } from '/@/components/DataGrid.svelte';
  import Dropzone from '/@/components/Dropzone.svelte';
  import { droppedFiles } from '/@/store';

  export let tags: Tag[];

  const columns: GridColDef<Tag>[] = [
    { field: 'name', headerName: 'Tag' },
    { field: 'count', headerName: 'Count', type: 'number' }
  ];

  let searchResults = tags;

  let deleteDialogOpen = false;
  let editDialogOpen = false;
  let selectedTag: Tag | null = null;
</script>

<div class="h-full flex justify-center p-4">
  <TagSearch bind:searchResults {tags} />

  <DataGrid
    {columns}
    rows={searchResults}
    editable
    deletable
    density="compact"
    onRowClick={row => $goto('../[id]', { id: row.id })}
    onEdit={row => {
      selectedTag = row;
      editDialogOpen = true;
    }}
    onDelete={row => {
      selectedTag = row;
      deleteDialogOpen = true;
    }}
  />
</div>

{#if selectedTag !== null}
  <EditTagDialog
    open={editDialogOpen}
    tag={selectedTag}
    {tags}
    onClose={() => {
      editDialogOpen = false;
      selectedTag = null;
    }}
    onSave={async ({ id, name }) => {
      await window.scrapbookApi.updateTag(id, name);

      const updatedTag = await window.scrapbookApi.getTag(name);
      tags = produce(tags, tags => {
        const index = tags.findIndex(tag => tag.id === id);
        if (index !== -1) {
          tags.splice(index, 1, updatedTag);
        }
      })

      editDialogOpen = false;
      selectedTag = null;
    }}
  />
{/if}

{#if selectedTag !== null}
  <DeleteTagDialog
    open={deleteDialogOpen}
    tag={selectedTag}
    onClose={() => {
      deleteDialogOpen = false;
      selectedTag = null;
    }}
    onDelete={async tag => {
      await window.scrapbookApi.deleteTag(tag.id);
      tags = tags.filter(({ id }) => id !== tag.id);

      deleteDialogOpen = false;
      selectedTag = null;
    }}
  />
{/if}

<Dropzone
  onDrop={files => {
    $droppedFiles = files;

    $goto('/book/[id]/edit', { id: 'undefined' });
  }}
/>
