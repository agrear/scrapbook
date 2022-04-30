<script lang="ts">
  import { goto } from '@roxi/routify';

  import BookInfoDialog from './BookInfoDialog.svelte';
  import ImageList from '/@/components/ImageList.svelte';
  import ImageListImage from '/@/components/ImageListImage.svelte';
  import ImageListItem from '/@/components/ImageListItem.svelte';
  import { thumbnails } from '/@/store';

  export let books: Book[];

  function onCoverClick(bookId: string) {
    $goto('/book/[id]', { id: bookId });
  }

  let selectedBook: Book | null = null;
</script>

<div class="h-full">
  <ImageList items={books} let:item={book} let:index>
    <ImageListItem
      {index}
      onClick={() => onCoverClick(book.id)}
    >
      {#await thumbnails.get(book.cover.id) then { src }}
        <ImageListImage
          {src}
          caption={book.title}
          onCaptionClick={() => selectedBook = book}
        />
      {:catch}
        <!-- Intentionally empty -->
      {/await}
    </ImageListItem>
  </ImageList>
</div>

{#if selectedBook !== null}
  <BookInfoDialog
    open={selectedBook !== null}
    title={selectedBook.title}
    authors={selectedBook.authors}
    description={selectedBook.description}
    tags={selectedBook.tags}
    series={selectedBook.series}
    publisher={selectedBook.publisher}
    onClose={() => selectedBook = null}
  />
{/if}
