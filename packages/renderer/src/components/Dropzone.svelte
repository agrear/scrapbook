<script context="module" lang="ts">
  interface ElectronFile extends File {
    path: string;
  }

  export function convertDroppedFiles(files: FileList): FileInfo[] {
    return Array.from(files).map(file => ({
      name: file.name,
      path: (file as ElectronFile).path,
      size: file.size,
      type: file.type
    }));
  }
</script>

<script lang="ts">
  import arrowCollapseDownIcon from '@iconify/icons-mdi/arrow-collapse-down';
  import IconifyIcon from '@iconify/svelte';

  export let onDrop: ((files: FileInfo[]) => void) | undefined = undefined;

  let target: EventTarget | null = null;
  let dragging = false;

  function handleDrop(event: DragEvent & {
    currentTarget: EventTarget & Window;
  }) {
    target = null;

    if (event.dataTransfer !== null && onDrop) {
      onDrop(convertDroppedFiles(event.dataTransfer.files));
    }
  }
</script>

<svelte:window
  on:dragenter|preventDefault={event => {
    target = event.target;
  }}
  on:dragleave={event => {
    if (target === event.target){
      event.preventDefault();
      target = null;
    }
  }}
  on:dragover|preventDefault={() => {}}
  on:drop|preventDefault={handleDrop}
/>

{#if target !== null}
  <div
    class="
      absolute
      inset-0
      flex
      flex-col
      items-center
      justify-center
      pointer-events-none
      select-none
      bg-black
      bg-opacity-60
    "
  >
    <IconifyIcon icon={arrowCollapseDownIcon} width={64} />
    <span class="text-2xl mt-2">Drop files or folders</span>
  </div>
{/if}
