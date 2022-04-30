<script lang="ts">
  import { goto } from '@roxi/routify';

  import Chip from '/@/components/Chip.svelte';
  import ChipSet from '/@/components/ChipSet.svelte';
  import Dialog from '/@/components/Dialog.svelte';

  export let open: boolean;
  export let name: Author['name'];
  export let tags: Author['popularTags'];
  export let onClose: () => void;
</script>

<Dialog {open} maxWidth="xs" fullWidth {onClose}>
  <div class="flex flex-col gap-2">
    <span class="mdc-typography--headline4">
      {name}
    </span>

    {#if tags.length > 0}
      <ChipSet>
        {#each tags as tag}
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
  </div>
</Dialog>
