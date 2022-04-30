<script lang="ts">
  import Search from '../../_components/search/Search.svelte';
  import { searchMode, seriesSearch } from '/@/store';

  export let series: Series[];
  export let tags: Tag[];
  export let searchResults: Series[];

  $: options = [
    ...series.map(({ name }) => name),
    ...tags.map(({ name }) => name)
  ];
</script>

<Search
  bind:value={$seriesSearch}
  bind:results={searchResults}
  items={series}
  {options}
  getTags={series => [series.name, ...series.tags]}
  mode={$searchMode}
  multiple
/>
