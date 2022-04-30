<script context="module" lang="ts">
  const load: RoutifyLoad = async () => {
    return {
      props: {
        authors: await window.scrapbookApi.getAuthors()
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  import { goto } from '@roxi/routify';

  import AuthorInfoDialog from './_components/AuthorInfoDialog.svelte';
  import AuthorSearch from './_components/AuthorSearch.svelte';
  import Dropzone from '/@/components/Dropzone.svelte';
  import ImageList from '/@/components/ImageList.svelte';
  import ImageListImage from '/@/components/ImageListImage.svelte';
  import ImageListItem from '/@/components/ImageListItem.svelte';
  import { droppedFiles, thumbnails } from '/@/store';

  export let authors: Author[];

  let searchResults = authors;
  let selectedAuthor: Author | null = null;
</script>

<div class="h-full">
  <AuthorSearch bind:searchResults {authors} />

  <ImageList items={searchResults} let:item={author} let:index>
    <ImageListItem
      {index}
      onClick={() => $goto('../[id]', { id: author.id })}
    >
      {#await thumbnails.get(author.cover.id) then { src }}
        <ImageListImage
          {src}
          caption={author.name}
          badgeContent={author.books}
          onCaptionClick={() => selectedAuthor = author}
        />
      {:catch}
        <!-- Intentionally empty -->
      {/await}
    </ImageListItem>
  </ImageList>
</div>

{#if selectedAuthor !== null}
  <AuthorInfoDialog
    open={selectedAuthor !== null}
    name={selectedAuthor.name}
    tags={selectedAuthor.popularTags}
    onClose={() => selectedAuthor = null}
  />
{/if}

<Dropzone
  onDrop={files => {
    $droppedFiles = files;

    $goto('/book/[id]/edit', { id: 'undefined' });
  }}
/>
