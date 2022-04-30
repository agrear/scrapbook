<script lang="ts">
  import Search from './Search.svelte';
  import { bookSearch, searchMode } from '/@/store';

  function getSearchableBook(book: Book) {
    const tags = [
      book.title,
      ...book.authors,
      ...book.tags
    ];

    if (book.series) {
      tags.push(book.series.name);
    }

    if (book.publisher) {
      tags.push(book.publisher);
    }

    return tags;
  }

  export let authors: Author[];
  export let books: Book[];
  export let publishers: Publisher[];
  export let series: Series[];
  export let tags: Tag[];
  export let searchResults: Book[];

  $: options = [
    ...authors.map(({ name }) => name),
    ...books.map(({ title }) => title),
    ...publishers.map(({ name }) => name),
    ...series.map(({ name }) => name),
    ...tags.map(({ name }) => name)
  ];
</script>

<Search
  bind:value={$bookSearch}
  bind:results={searchResults}
  items={books}
  {options}
  getTags={getSearchableBook}
  mode={$searchMode}
  multiple
/>
