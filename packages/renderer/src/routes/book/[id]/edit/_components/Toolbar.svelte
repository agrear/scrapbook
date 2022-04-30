<script lang="ts">
  import contentSaveIcon from '@iconify/icons-mdi/content-save';
  import deleteIcon from '@iconify/icons-mdi/delete';
  import fileImageIcon from '@iconify/icons-mdi/file-image';
  import selectIcon from '@iconify/icons-mdi/select';
  import IconifyIcon from '@iconify/svelte';

  import Button from '/@/components/Button.svelte';
  import Toolbar from '/@/components/Toolbar.svelte';

  export let pages: number;
  export let pagesSelected: number;
  export let onSelect: () => void;
  export let onDelete: () => void;
  export let onSave: (() => void) | undefined;
</script>

<Toolbar justifyContent="flex-end">
  <div class="flex flex-grow items-center justify-center select-none">
    {pagesSelected} page{pagesSelected === 1 ? '' : 's'} selected
  </div>

  <div class="flex items-center px-2">
    <IconifyIcon inline icon={fileImageIcon} width={24} />
    <span class="ml-1 text-xl select-none">{pages}</span>
  </div>

  <Button startIcon={selectIcon} tabIndex={-1} onClick={onSelect}>
    Select
  </Button>

  {#if pagesSelected > 0}
    <Button
      startIcon={deleteIcon}
      disabled={pagesSelected === 0}
      tabIndex={-1}
      onClick={onDelete}
    >
      Delete
    </Button>
  {/if}

  <Button
    startIcon={contentSaveIcon}
    disabled={onSave === undefined}
    tabIndex={-1}
    onClick={onSave}
  >
    Save
  </Button>
</Toolbar>
