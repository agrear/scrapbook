<script context="module" lang="ts">
  const load: RoutifyLoad = async ({ route }) => {
    const { id } = route.params;

    window.scrapbookApi.updateHistory(id);

    return {
      props: {
        book: await window.scrapbookApi.getBook(id),
        pages: await window.scrapbookApi.getPages(id)
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  import { clamp } from '@popmotion/popcorn';
  import { beforeUrlChange, goto, params } from '@roxi/routify';
  import { produce } from 'immer';
  import { onMount } from 'svelte';

  import Toolbar, { ToolbarState } from './_components/Toolbar.svelte';
  import Dropzone from '/@/components/Dropzone.svelte';
  import FlipView from '/@/components/FlipView.svelte';
  import FlipViewImage from '/@/components/FlipViewImage.svelte';
  import FlipViewItem from '/@/components/FlipViewItem.svelte';
  import { droppedFiles, images } from '/@/store';
  import { similarity } from '/@/util';

  export let book: Book;
  export let pages: Page[];

  let memoizedImage: Promise<Image> | null = null;
  let pageId: string | null = null;

  function loadImage(id: string) {
    if (id !== pageId || memoizedImage === null) {
      pageId = id;
      return memoizedImage = images.get(id);
    }

    return memoizedImage;
  }

  function getDisplayTitle() {
    if (book.series !== null) {
      // Only show series if distinct enough from title
      if (similarity(book.title, book.series.name) < 0.8) {
        return `${book.series.name}: ${book.title}`;
      }
    }

    return book.title;
  }

  function preloadImages(bookmark: number, range = 3) {
    const min = Math.max(0, bookmark - range);
    const max = Math.min(bookmark + range + 1, pages.length);
    for (let i = min; i < max; ++i) {
      images.get(pages[i].id);
    }
  }

  async function updateBookmark(bookmark: number) {
    await window.scrapbookApi.updateBookmark(book.id, bookmark);

    book = produce(book, book => {
      book.bookmark = clamp(0, pages.length - 1, bookmark);
    });

    preloadImages(bookmark);
  }

  async function updateZoom(value: number) {
    const zoom = clamp(0.5, 2.0, value);
    await window.scrapbookApi.updateBookZoom(book.id, zoom);
    book = produce(book, book => {
      book.zoom = zoom;
    });
  }

  async function updateBrightness(value: number) {
    const brightness = clamp(0.25, 1.25, value);
    await window.scrapbookApi.updateBookBrightness(book.id, brightness);
    book = produce(book, book => {
      book.brightness = brightness;
    });
  }

  async function updateLayout(layout: Layout) {
    await window.scrapbookApi.updateBookLayout(book.id, layout);
    book = produce(book, book => {
      book.layout = layout;
    });
  }

  let toolbarState: ToolbarState;
  let flipViewItem: FlipViewItem<Image> | null = null;

  $: if (toolbarState === ToolbarState.Idle && flipViewItem !== null) {
    flipViewItem.focus();
  }

  $beforeUrlChange(({ route }) => {
    if (route.params.id === undefined) {
      window.scrapbookApi.updateHistory(null);
    }

    return true;
  });

  onMount(() => {
    preloadImages(book.bookmark);
  });
</script>

<div class="flex flex-col h-full">
  <Toolbar
    title={getDisplayTitle()}
    bookmark={book.bookmark}
    pages={pages.length}
    zoom={book.zoom}
    brightness={book.brightness}
    objectFit={book.layout.fit}
    objectPosition={book.layout.position}
    bind:state={toolbarState}
    onEdit={() => $goto('../edit')}
    onNavigate={updateBookmark}
    onZoomChange={updateZoom}
    onBrightnessChange={updateBrightness}
    onLayoutChange={updateLayout}
  />

  <FlipView
    items={pages}
    selectedIndex={book.bookmark}
    onFlip={updateBookmark}
    onZoom={delta => updateZoom(book.zoom + delta)}
    onResetZoom={() => updateZoom(1.0)}
    let:item
  >
    <FlipViewItem
      bind:this={flipViewItem}
      item={loadImage(item.id)}
      objectFit={book.layout.fit}
      objectPosition={book.layout.position}
      zoom={book.zoom}
      let:item={image}
      let:position
      let:size
      let:resetDrag
    >
      {#if image !== undefined && position !== undefined && size !== undefined}
        <FlipViewImage
          src={image.src}
          {position}
          {size}
          brightness={book.brightness}
          onDoubleClick={resetDrag}
        />
      {:else}
        <span
          class="fixed top-1/2 left-1/2"
          style="transform: translate(-50%, -50%);"
        >
          Loading...
        </span>
      {/if}
    </FlipViewItem>
  </FlipView>
</div>

<Dropzone
  onDrop={files => {
    $droppedFiles = files;

    $goto('/book/[id]/edit', {
      id: $params.id,
      index: String(book.bookmark + 1)
    });
  }}
/>
