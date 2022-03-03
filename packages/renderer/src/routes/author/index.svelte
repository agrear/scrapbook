<script context="module" lang="ts">
  const load: RoutifyLoad = async () => {
    return {
      props: {
        authors: ['Author A', 'Author B', 'Author C']
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  import { goto } from '@roxi/routify';

  import ComponentA from './_components/ComponentA.svelte';
  import Button from '/@/components/Button.svelte';

  export let authors: string[];
</script>

<div>
  <ComponentA />

  <div style="margin-bottom: 1rem;" />

  Authors:
  {#each authors as author}
    <div>
      <Button onClick={() => $goto('../[name]', { name: author })}>
        {author}
      </Button>
    </div>
  {/each}
</div>
