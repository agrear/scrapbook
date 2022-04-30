<script lang="ts">
  import Fuse from 'fuse.js';

  import type { SearchMode } from './SearchMode';
  import SearchBar from './SearchBar.svelte';
  import Autocomplete from '/@/components/Autocomplete.svelte';

  type T = $$Generic;

  const searchOptions: Fuse.IFuseOptions<{
    item: T,
    tags: string
  }> = {
    keys: ['tags'],
    findAllMatches: true,
    useExtendedSearch: true
  };

  const separator = ',';

  function stripExclamationMark(str: string) {
    return str.slice(0, 1) === '!' ? str.slice(1) : str;
  }

  function parseValue(value: string, cursor: number) {
    // Extract search term based on currently selected entry
    const start = value.substring(0, cursor).lastIndexOf(separator);
    const end = value.indexOf(separator, cursor);

    return stripExclamationMark(
      value.substring(
        start !== -1 ? start + separator.length : 0,
        end !== -1 ? end : undefined
      ).trimStart()
    );
  }

  function parseTags(value: string) {
    return value.split(separator).map(str => (
      stripExclamationMark(str.trimStart())
    )).filter(Boolean);
  };

  function selectOption(option: string, value: string, cursor: number) {
    // Replace currently selected entry
    const start = value.substring(0, cursor).lastIndexOf(separator, cursor);
    let end = value.indexOf(separator, cursor);
    end = end !== -1 ? end + separator.length : value.length;

    const before = value.substring(start + separator.length, end).trimStart();

    return [
      value.substring(0, start),
      `${before.slice(0, 1) === '!' ? '!' : ''}${option}`,
      value.substring(end).trim()
    ].filter(Boolean).join(separator + ' ');
  };

  export let value = '';
  export let items: T[];
  export let results: T[];
  export let options: string[];
  export let mode: SearchMode;
  export let multiple = false;
  export let getTags: (item: T) => string[];

  let searchBarOpen: boolean;
  let search: Autocomplete<string> | null = null;

  $: indexedItems = items.map(item => ({
    item,
    tags: getTags(item).join(' ')
  }));

  $: fuse = new Fuse(indexedItems, searchOptions);

  $: if (searchBarOpen) {
    const searchTerms = value.split(',').map(str => {
      const inverted = str.trimStart().slice(0, 1) === '!';

      return {
        inverted,
        term: stripExclamationMark(str.trim())
      };
    }).filter(({ term }) => Boolean(term));

    if (searchTerms.length > 0) {
      const pattern: Fuse.Expression = {
        $and: searchTerms.map(({ inverted, term }) => ({
          tags: `${inverted ? '!' : '\''}"${term}"`
        }))
      };

      results = fuse.search(pattern).map(({ item }) => item.item);
    } else {
      results = items;
    }
  }

  $: if (!searchBarOpen) {
    results = items;
  }

  $: if (search) {
    search.focus();
  }
</script>

<SearchBar
  {mode}
  on:open={() => {
    searchBarOpen = true;
    search?.focus();
  }}
  on:close={() => searchBarOpen = false}
>
  <Autocomplete
    bind:this={search}
    bind:value
    {options}
    {multiple}
    {searchOptions}
    placeholder="Search"
    border={0}
    selectOnFocus
    freeSolo
    {parseValue}
    {parseTags}
    {selectOption}
  />
</SearchBar>
