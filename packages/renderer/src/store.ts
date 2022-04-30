import { readable, writable } from 'svelte/store';

import { createObjectUrlFromBuffer, freeObjectUrl } from './util';
import { ResourceManager } from './util/ResourceManager';
import { SearchMode } from './routes/_components/search/SearchMode';

export const searchMode = writable<SearchMode>(SearchMode.Simple);
export const authorSearch = writable('');
export const bookSearch = writable('');
export const seriesSearch = writable('');
export const tagSearch = writable('');

export const droppedFiles = writable<FileInfo[]>([]);

export const images = (() => {
  const resourceManager = new ResourceManager<Image>({
    allocate: async pageId => {
      const {
        data,
        type,
        ...image
      } = await window.scrapbookApi.getImage(pageId);

      return {
        src: createObjectUrlFromBuffer(data, type),
        ...image
      };
    },
    free: ({ src }) => freeObjectUrl(src)
  });

  resourceManager.setMaxStorage(10);

  const { subscribe } = readable(resourceManager);

  return {
    subscribe,
    get: (id: string) => resourceManager.get(id)
  };
})();

export const thumbnails = (() => {
  const resourceManager = new ResourceManager<Image>({
    allocate: async pageId => {
      const {
        data,
        type,
        ...image
      } = await window.scrapbookApi.getImage(pageId, { thumbnail: true });

      return {
        src: createObjectUrlFromBuffer(data, type),
        ...image
      };
    },
    free: ({ src }) => freeObjectUrl(src),
    maxStorage: 50
  });

  const { subscribe } = readable(resourceManager);

  return {
    subscribe,
    get: (id: string) => resourceManager.get(id)
  };
})();
