<script context="module" lang="ts">
  const load: RoutifyLoad = async ({ route }) => {
    return {
      props: {
        authors: await window.scrapbookApi.getAuthors(),
        books: await window.scrapbookApi.getBooksByAuthor(route.params['id']),
        publishers: await window.scrapbookApi.getPublishers(),
        series: await window.scrapbookApi.getSeries(),
        tags: await window.scrapbookApi.getTags()
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  import { goto, params } from '@roxi/routify';

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

<div class="flex flex-col h-full">
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

    $goto('/book/[id]/edit', {
      id: 'undefined',
      author: encodeURIComponent(JSON.stringify([$params.id])),
      ...(books.length > 0 ? { lang: books[0].language.id } : {})
    });
  }}
/>
