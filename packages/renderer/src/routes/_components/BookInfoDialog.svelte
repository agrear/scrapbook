<script lang="ts">
  import { goto } from '@roxi/routify';

  import Chip from '/@/components/Chip.svelte';
  import ChipSet from '/@/components/ChipSet.svelte';
  import Dialog from '/@/components/Dialog.svelte';

  export let open: boolean;
  export let title: Book['title'];
  export let authors: Book['authors'];
  export let description: Book['description'];
  export let tags: Book['tags'];
  export let series: Book['series'];
  export let publisher: Book['publisher'];
  export let onClose: () => void;
</script>

<Dialog {open} maxWidth="xs" fullWidth {onClose}>
  <div class="flex flex-col gap-2">
    <span class="mdc-typography--headline4">
      {title}
    </span>

    {#if series}
      <span class="mdc-typography--caption">
        {series.name}
      </span>
    {/if}

    <span class="mdc-typography--headline6">
      {authors.join(', ')}
      {#if publisher}
        ({publisher})
      {/if}
    </span>

    {#if tags.length > 0}
      <ChipSet>
        {#each tags.sort((a, b) => a.localeCompare(b)) as tag}
          <Chip
            id={tag}
            on:click={async () => {
              $goto('/tag/[id]', {
                id: (await window.scrapbookApi.getTag(tag)).id
              });
            }}
          >
            {tag}
          </Chip>
        {/each}
      </ChipSet>
    {/if}

    {#if description}
      <p class="mt-4 mdc-typography--body">
        {description}
      </p>
    {/if}
  </div>
</Dialog>
