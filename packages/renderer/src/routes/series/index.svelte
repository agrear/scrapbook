<script context="module" lang="ts">
  const load: RoutifyLoad = async () => {
    return {
      props: {
        series: await window.scrapbookApi.getSeries(),
        tags: await window.scrapbookApi.getTags()
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  import { goto } from '@roxi/routify';

  import SeriesInfoDialog from './_components/SeriesInfoDialog.svelte';
  import SeriesSearch from './_components/SeriesSearch.svelte';
  import Dropzone from '/@/components/Dropzone.svelte';
  import ImageList from '/@/components/ImageList.svelte';
  import ImageListImage from '/@/components/ImageListImage.svelte';
  import ImageListItem from '/@/components/ImageListItem.svelte';
  import { droppedFiles, thumbnails } from '/@/store';

  export let series: Series[];
  export let tags: Tag[];

  let selectedSeries: Series | null = null;
  let searchResults = series;
</script>

<div class="h-full">
  <SeriesSearch bind:searchResults {series} {tags} />

  <ImageList items={searchResults} let:item let:index>
    <ImageListItem
      {index}
      onClick={() => $goto('../[id]', { id: item.id })}
    >
      {#await thumbnails.get(item.cover.id) then { src }}
        <ImageListImage
          {src}
          caption={item.name}
          badgeContent={item.volumes}
          onCaptionClick={() => selectedSeries = item}
        />
      {:catch}
        <!-- Intentionally empty -->
      {/await}
    </ImageListItem>
  </ImageList>
</div>

{#if selectedSeries !== null}
  <SeriesInfoDialog
    open={selectedSeries !== null}
    name={selectedSeries.name}
    tags={selectedSeries.tags}
    onClose={() => selectedSeries = null}
  />
{/if}

<Dropzone
  onDrop={files => {
    $droppedFiles = files;

    $goto('/book/[id]/edit', { id: 'undefined' });
  }}
/>
