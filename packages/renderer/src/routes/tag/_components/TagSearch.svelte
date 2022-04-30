<script lang="ts">
  import Search from '../../_components/search/Search.svelte';
  import { searchMode, tagSearch } from '/@/store';

  export let tags: Tag[];
  export let searchResults: Tag[];

  $: options = tags.map(({ name }) => name);
</script>

<Search
  bind:value={$tagSearch}
  bind:results={searchResults}
  items={tags}
  {options}
  getTags={tag => [tag.name]}
  mode={$searchMode}
  multiple
/>
