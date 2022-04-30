<script lang="ts">
  import Search from '../../_components/search/Search.svelte';
  import { authorSearch, searchMode } from '/@/store';

  export let authors: Author[];
  export let searchResults: Author[];

  $: options = authors.map(({ id, name }) => name);
</script>

<Search
  bind:value={$authorSearch}
  bind:results={searchResults}
  items={authors}
  {options}
  getTags={author => [author.name]}
  mode={$searchMode}
  multiple
/>
