import { contextBridge, ipcRenderer as ipc } from 'electron';

const api: ScrapbookApi = {
  deleteBook: bookId => ipc.invoke('deleteBook', bookId),
  deletePage: pageId => ipc.invoke('deletePage', pageId),
  deleteTag: tagId => ipc.invoke('deleteTag', tagId),
  getAuthors: () => ipc.invoke('getAuthors'),
  getBook: bookId => ipc.invoke('getBook', bookId),
  getBooks: authorId => ipc.invoke('getBooks', authorId),
  getBooksByAuthor: authorId => ipc.invoke('getBooksByAuthor', authorId),
  getBooksBySeries: seriesId => ipc.invoke('getBooksBySeries', seriesId),
  getBooksByTag: tagId => ipc.invoke('getBooksByTag', tagId),
  getFiles: path => ipc.invoke('getFiles', path),
  getHistory: () => ipc.invoke('getHistory'),
  getImage: (pageId, options) => ipc.invoke('getImage', { pageId, options }),
  getLanguages: () => ipc.invoke('getLanguages'),
  getPages: bookId => ipc.invoke('getPages', bookId),
  getPreferences: () => ipc.invoke('getPreferences'),
  getPublishers: () => ipc.invoke('getPublishers'),
  getSeries: () => ipc.invoke('getSeries'),
  getTag: name => ipc.invoke('getTag', name),
  getTags: () => ipc.invoke('getTags'),
  getVolumes: seriesId => ipc.invoke('getVolumes', seriesId),
  insertBook: metaData => ipc.invoke('insertBook', metaData),
  insertPage: (bookId, image, number) => (
    ipc.invoke('insertPage', { bookId, image, number })
  ),
  loadImage: file => ipc.invoke('loadImage', file),
  quit: () => ipc.invoke('quit'),
  setPreferences: preferences => ipc.invoke('setPreferences', preferences),
  updateBook: (bookId, metaData) => (
    ipc.invoke('updateBook', { bookId, metaData })
  ),
  updateBookmark: (bookId, pageNumber) => (
    ipc.invoke('updateBookmark', { bookId, pageNumber })
  ),
  updateBookBrightness: (bookId, brightness) => (
    ipc.invoke('updateBookBrightness', { bookId, brightness })
  ),
  updateBookLayout: (bookId, layout) => (
    ipc.invoke('updateBookLayout', { bookId, layout })
  ),
  updateBookZoom: (bookId, zoom) => (
    ipc.invoke('updateBookZoom', { bookId, zoom })
  ),
  updateHistory: bookId => ipc.invoke('updateHistory', bookId),
  updatePageNumber: (pageId, pageNumber) => (
    ipc.invoke('updatePageNumber', { pageId, pageNumber })
  ),
  updateTag: (tagId, name) => ipc.invoke('updateTag', { tagId, name })
};

contextBridge.exposeInMainWorld('scrapbookApi', api);
