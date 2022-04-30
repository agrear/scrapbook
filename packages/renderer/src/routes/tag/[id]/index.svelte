<script context="module" lang="ts">
  const load: RoutifyLoad = async ({ route }) => {
    const { id } = route.params;

    return {
      props: {
        authors: await window.scrapbookApi.getAuthors(),
        books: await window.scrapbookApi.getBooksByTag(id),
        publishers: await window.scrapbookApi.getPublishers(),
        series: await window.scrapbookApi.getSeries(),
        tags: await window.scrapbookApi.getTags()
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  import { goto } from '@roxi/routify';

  import BookList from '../../_components/BookList.svelte';
  import BookSearch from '../../_components/search/BookSearch.svelte';
  import Dropzone from '/@/components/Dropzone.svelte';
  import { droppedFiles } from '/@/store';

  export let authors: Author[];
  export let books: Book[];
  export let publishers: Publisher[];
  export let series: Series[];
  export let tags: Tag[];

  let searchResults = books;
</script>

<div class="relative h-full">
  <BookSearch
    bind:searchResults
    {authors}
    {books}
    {publishers}
    {series}
    {tags}
  />

  <BookList books={searchResults} />
</div>

<Dropzone
  onDrop={files => {
    $droppedFiles = files;

    $goto('/book/[id]/edit', { id: 'undefined' });
  }}
/>
