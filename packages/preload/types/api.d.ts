type AppHistory = {
  bookId: string | null
};

type Author = {
  id: string,
  name: string,
  books: number,
  cover: Page,
  popularTags: string[]
};

type Book = {
  id: string,
  bookmark: number,
  brightness: number,
  layout: Layout,
  zoom: number,
  cover: Page
} & MetaData;

type EditBookFormData = Omit<MetaData, 'created' | 'language' | 'series'> & {
  language: {
    id: string
  },
  series: {
    name: string,
    volume: number
  } | null
};

type FileInfo = {
  name: string,
  path: string,
  size: number,
  type: string
};

type Image = {
  pageId: string,
  bookId: string,
  src: string,
  width: number,
  height: number,
  size: number
};

type ImageOptions = {
  thumbnail: boolean
};

type ImageFile = {
  data: Buffer,
  width: number,
  height: number
} & FileInfo;

type Language = {
  id: string,
  name: string,
  type: 'living' | 'historical' | 'extinct' | 'ancient' | 'constructed' | 'special',
  scope: 'individual' | 'macrolanguage' | 'special'
};

type Layout = {
  fit: ObjectFit,
  position: ObjectPosition
};

type MetaData = {
  created: Date,
  title: string,
  authors: string[],
  description: string | null,
  published: Date | null,
  publisher: string | null,
  language: {
    id: string,
    name: string
  },
  series: {
    id: string,
    name: string,
    volume: Volume
  } | null,
  tags: string[]
};

type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

type ObjectPosition = 'left top' | 'left center' | 'left bottom' |
  'center top' | 'center center' | 'center bottom' |
  'right top' | 'right center' | 'right bottom';

type Page = {
  id: string,
  bookId: string,
  number: number
};

type Preferences = {
  brightness: number,
  layout: Layout,
  window: {
    maximized: boolean,
    state: WindowState,
    size: {
      width: number,
      height: number
    }
  },
  zoom: number
};

type Publisher = {
  id: string,
  name: string
};

type Series = {
  id: string,
  name: string,
  volumes: number,
  cover: Page,
  tags: string[]
};

type Tag = {
  id: string,
  name: string,
  count: number
};

type Volume = {
  seriesId: string,
  bookId: string,
  number: number
};

type WindowState = 'borderless' |  'fullscreen' |  'windowed';

interface ScrapbookApi {
  deleteBook: (bookId: string) => Promise<void>,
  deletePage: (pageId: string) => Promise<void>,
  deleteTag: (tagId: string) => Promise<void>,
  getAuthors: () => Promise<Author[]>,
  getBook: (bookId: string) => Promise<Book>,
  getBooks: (authorId?: string) => Promise<Book[]>,
  getBooksByAuthor: (authorId: string) => Promise<Book[]>,
  getBooksBySeries: (seriesId: string) => Promise<Book[]>,
  getBooksByTag: (tagId: string) => Promise<Book[]>,
  getFiles: (path: string) => Promise<FileInfo[]>,
  getHistory: () => Promise<AppHistory>,
  getImage: (pageId: string, options?: ImageOptions) => (
    Promise<ImageFile & { bookId: string, pageId: string }>
  ),
  getLanguages: () => Promise<Language[]>,
  getPages: (bookId: string) => Promise<Page[]>,
  getPreferences: () => Promise<Preferences>,
  getPublishers: () => Promise<Publisher[]>,
  getSeries: () => Promise<Series[]>,
  getTag: (name: string) => Promise<Tag>,
  getTags: () => Promise<Tag[]>,
  getVolumes: (seriesId: string) => Promise<Volume[]>,
  insertBook: (metaData: BookEditFormData) => Promise<Book>,
  insertPage: (
    bookId: string,
    image: FileInfo,
    number: number | undefined = undefined
  ) => Promise<Page>,
  loadImage: (file: string) => Promise<ImageFile>,
  quit: () => Promise<void>,
  setPreferences: (preferences: Partial<Preferences>) => Promise<void>,
  updateBook: (bookId: string, metaData: BookEditFormData) => Promise<void>,
  updateBookmark: (bookId: string, pageNumber: number) => Promise<void>,
  updateBookBrightness: (bookId: string, brightness: number) => Promise<void>,
  updateBookLayout: (bookId: string, layout: Layout) => Promise<void>,
  updateBookZoom: (bookId: string, zoom: number) => Promise<void>,
  updateHistory: (bookId: string | null) => Promise<void>,
  updatePageNumber: (pageId: string, pageNumber: number) => Promise<void>,
  updateTag: (tagId: string, name: string) => Promise<void>
}

declare interface Window {
  scrapbookApi: Readonly<ScrapbookApi>
}
