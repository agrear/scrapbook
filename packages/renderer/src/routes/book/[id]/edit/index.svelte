<script context="module" lang="ts">
  const load: RoutifyLoad = async ({ route }) => {
    const { id, author, series } = route.params;

    return {
      props: {
        authors: await window.scrapbookApi.getAuthors(),
        book: id !== 'undefined' ? await window.scrapbookApi.getBook(id) : undefined,
        pages: id !== 'undefined' ? await window.scrapbookApi.getPages(id) : [],
        languages: await window.scrapbookApi.getLanguages(),
        publishers: await window.scrapbookApi.getPublishers(),
        series: await window.scrapbookApi.getSeries(),
        tags: await window.scrapbookApi.getTags()
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  import { goto, params, url } from '@roxi/routify';
  import { produce } from 'immer';
  import { onDestroy, onMount } from 'svelte';

  import ConfirmDeleteDialog from './_components/ConfirmDeleteDialog.svelte';
  import EditBookDialog from './_components/EditBookDialog.svelte';
  import SaveProgressDialog from './_components/SaveProgressDialog.svelte';
  import SearchProgressDialog from './_components/SearchProgressDialog.svelte';
  import SelectPagesDialog from './_components/SelectPagesDialog.svelte';
  import Toolbar from './_components/Toolbar.svelte';
  import { convertDroppedFiles } from '/@/components/Dropzone.svelte';
  import ImageList, { moveItem } from '/@/components/ImageList.svelte';
  import ImageListImage from '/@/components/ImageListImage.svelte';
  import ImageListItem from '/@/components/ImageListItem.svelte';
  import { droppedFiles, thumbnails } from '/@/store';
  import {
    filterFilesByTypeImage,
    createObjectUrlFromBuffer,
    freeObjectUrl
  } from '/@/util';
  import { ResourceManager } from '/@/util/ResourceManager';

  enum State {
    AddingFiles,
    Browsing,
    Deleting,
    Editing,
    RemovingPages,
    Saving,
    Saved,
    Searching,
    SearchUnsuccessful,
    SelectingPages
  }

  type SelectablePage = (Page | FileInfo) & { selected: boolean };

  export let authors: Author[];
  export let book: Book | undefined;
  export let pages: Page[];
  export let languages: Language[];
  export let publishers: Publisher[];
  export let series: Series[];
  export let tags: Tag[];

  const authorIds: string[] = $params.author ? JSON.parse(
    decodeURIComponent($params.author)
  ) : [];
  const seriesId: string | undefined = $params.series;
  const language: string | undefined = $params.lang;

  let insertionIndex = $params.index !== undefined ? Number(
    $params.index
  ) : pages.length;

  let state = State.Browsing;
  let saveProgress = '';

  let newPages: SelectablePage[] = pages.map(page => ({
    ...page,
    selected: false
  })) ?? [];

  type FileResource = Omit<Image, 'bookId' | 'pageId'> & {
    name: string,
    path: string
  };

  const fileManager = new ResourceManager<FileResource>({
    allocate: async path => {
      const {
        data,
        type,
        ...image
      } = await window.scrapbookApi.loadImage(path);

      return {
        src: createObjectUrlFromBuffer(data, type),
        ...image
      };
    },
    free: ({ src }) => freeObjectUrl(src)
  });

  async function getResource(item: Page | FileInfo) {
    return 'id' in item ? thumbnails.get(item.id) : fileManager.get(item.path);
  }

  function getResourceId(item: Page | FileInfo) {
    return 'id' in item ? item.id : item.path;
  }

  async function onDrop(files: FileInfo[]) {
    if (files.length === 0) {
      return;  // No files were dropped
    }

    state = State.Searching;

    const newFiles: FileInfo[] = [];
    for (const file of files) {
      try {
        newFiles.push(...await window.scrapbookApi.getFiles(file.path));
      } catch (error) {
        // TODO: Display error
      }
    }

    // Filter out non-image files and duplicates
    const images = filterFilesByTypeImage(newFiles).filter(({ path }) => (
      newPages.find(page => (
        'path' in page ? page.path === path : false)
      ) === undefined
    ));

    if (images.length === 0) {
      state = State.SearchUnsuccessful;
    } else {
      state = State.AddingFiles;

      const sortedImages = images.sort((a, b) => (
        a.path.localeCompare(b.path, undefined, { numeric: true })
      )).map(file => ({
        ...file,
        selected: false
      }));

      newPages = produce(newPages, pages => {
        pages.splice(insertionIndex, 0, ...sortedImages);
      });

      insertionIndex = newPages.length;

      state = State.Browsing;
    }
  }

  async function onSave(metaData: EditBookFormData) {
    state = State.Saving;

    if (book === undefined) {  // Create new book
      let book = await window.scrapbookApi.insertBook(metaData);

      // Insert new pages
      let insertedPages = 0;
      for (const page of newPages) {
        saveProgress = `Saving pages... (${++insertedPages}/${newPages.length})`;
        const file = page as FileInfo;
        await window.scrapbookApi.insertPage(book.id, file);
      }

      // Apply default preferences
      const preferences = await window.scrapbookApi.getPreferences();
      await window.scrapbookApi.updateBookBrightness(book.id, preferences.brightness);
      await window.scrapbookApi.updateBookLayout(book.id, preferences.layout);
      await window.scrapbookApi.updateBookZoom(book.id, preferences.zoom);

      state = State.Saved;

      // history.replaceState(null, '', $url('../../../[id]', { id: book.id }));
      history.back();

      return;
    }

    await window.scrapbookApi.updateBook(book.id, metaData);

    // Delete pages no longer present
    let pagesDeleted = 0;
    const deletedPages = pages.filter(page => (
      !newPages.find(p => 'id' in p ? p.id === page.id : false)
    ));
    for (const page of deletedPages) {
      saveProgress = `
        Deleting old pages... (${++pagesDeleted}/${deletedPages.length})
      `;
      await window.scrapbookApi.deletePage(page.id);
    }

    // Insert and reorder pages
    let currentPages = await window.scrapbookApi.getPages(book.id);
    for (let i = 0; i < newPages.length; ++i) {
      saveProgress = `Updating pages... (${i + 1}/${newPages.length})`;

      let page = 'path' in newPages[i] ? null : newPages[i] as Page;
      if (page === null) {
        const file = newPages[i] as FileInfo;
        page = await window.scrapbookApi.insertPage(book.id, file, i);
        currentPages = await window.scrapbookApi.getPages(book.id);
      } else if (page.id !== currentPages[i].id) {
        await window.scrapbookApi.updatePageNumber(page.id, i);
        currentPages = await window.scrapbookApi.getPages(book.id);
      }
    }

    state = State.Saved;

    history.back();
  }

  function selectAllPages() {
    newPages = produce(newPages, pages => {
      pages.forEach(page => page.selected = true);
    });
  }

  function deselectAllPages() {
    newPages = produce(newPages, pages => {
      pages.forEach(page => page.selected = false);
    });
  }

  $: pagesSelected = newPages.filter(page => page.selected).length;

  onMount(async () => {
    await fileManager.setMaxStorage(50);

    // Fetch initial files
    await onDrop($droppedFiles);
    $droppedFiles = [];
  });

  onDestroy(async () => {
    await fileManager.dispose();
  });
</script>

<svelte:window
  on:keydown={event => {
    if (state !== State.Browsing) {
      return;
    }

    if (event.ctrlKey) {
      if (event.key === 'a') {
        event.preventDefault();

        if (pagesSelected < newPages.length) {
          selectAllPages();
        } else {
          deselectAllPages();
        }
      }
    } else if (event.key === 'Delete') {
      if (pagesSelected > 0) {
        state = State.RemovingPages;
      }
    }
  }}
/>

<div class="flex flex-col h-full">
  <Toolbar
    pages={newPages.length}
    {pagesSelected}
    onSelect={() => state = State.SelectingPages}
    onDelete={() => state = State.RemovingPages}
    onSave={book === undefined && newPages.length === 0 ? undefined : () => {
      if (newPages.length === 0) {
        state = State.Deleting;
      } else {
        state = State.Editing;
      }
    }}
  />

  <ImageList
    items={newPages}
    selectId={getResourceId}
    disabled={state !== State.Browsing}
    sortable
    onDragStart={index => {  // Spawn placeholder page
      insertionIndex = index;
      newPages = produce(newPages, pages => {
        pages.splice(index, 0, {
          id: 'undefined',
          bookId: 'undefined',
          number: -1,
          selected: false
        });
      });
    }}
    onDragOver={index => {
      if (index !== insertionIndex) {
        newPages = moveItem(newPages, insertionIndex, index);
        insertionIndex = index;
      }
    }}
    onDragEnd={() => {  // Remove placeholder page
      newPages = produce(newPages, pages => {
        const index = pages.findIndex(page => (
          'id' in page ? page.id === 'undefined' : false
        ));
        if (index !== -1) {
          pages.splice(index, 1);
        }
      });
    }}
    onDrop={async files => await onDrop(convertDroppedFiles(files))}
    let:item={page}
    let:index
  >
    {#if getResourceId(page) !== 'undefined'}
      <ImageListItem
        {index}
        selected={page.selected}
        onMove={(from, to) => {
          newPages = moveItem(newPages, from, to);
        }}
        onToggle={() => {
          newPages = produce(newPages, pages => {
            const id = getResourceId(page);
            const index = pages.findIndex(page => getResourceId(page) === id);
            if (index !== -1) {
              pages[index].selected = !pages[index].selected;
            }
          });
        }}
      >
        {#await getResource(page) then { src }}
          <ImageListImage
            {src}
            caption={'id' in page ? String(page.number + 1) : page.name}
          />
        {:catch}
          <!-- Intentionally empty -->
        {/await}
      </ImageListItem>
    {:else}
      <ImageListItem {index} />
    {/if}
  </ImageList>
</div>

<SearchProgressDialog
  open={state === State.Searching}
  noResults={state === State.SearchUnsuccessful}
  onClose={() => state = State.Searching}
/>

<EditBookDialog
  open={state === State.Editing}
  {book}
  {authors}
  {languages}
  {publishers}
  {series}
  {tags}
  {authorIds}
  {seriesId}
  {language}
  onClose={() => state = State.Browsing}
  {onSave}
/>

<SaveProgressDialog open={state === State.Saving} progress={saveProgress} />

<ConfirmDeleteDialog
  open={state === State.RemovingPages}
  message={`Delete ${pagesSelected} page${pagesSelected === 1 ? '' : 's'}?`}
  onCancel={() => state = State.Browsing}
  onConfirm={() => {
    // Remove selected pages
    newPages = newPages.filter(page => !page.selected);

    state = State.Browsing;
  }}
/>

<ConfirmDeleteDialog
  open={state === State.Deleting}
  message={`Delete ${book?.title}?`}
  onCancel={() => state = State.Deleting}
  onConfirm={async () => {
    if (book !== undefined) {
      await window.scrapbookApi.deleteBook(book.id);
      await window.scrapbookApi.updateHistory(null);
    }

    history.go(-2);
  }}
/>

<SelectPagesDialog
  open={state === State.SelectingPages}
  onClose={() => state = State.Browsing}
  onSelect={({ range }) => {
    console.log(JSON.stringify(range));

    newPages = produce(newPages, pages => {
      pages.forEach(page => page.selected = false);

      range.forEach(selector => {
        if (Array.isArray(selector)) {
          pages.slice(selector[0] - 1, selector[1] - 1).forEach(page => (
            page.selected = true
          ));
        } else if (selector <= pages.length) {
          pages[selector - 1].selected = true;
        }
      })
    });

    state = State.Browsing;
  }}
/>
