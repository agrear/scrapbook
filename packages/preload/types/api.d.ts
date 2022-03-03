interface ScrapbookApi {
  quit: () => Promise<void>
}

declare interface Window {
  scrapbookApi: Readonly<ScrapbookApi>
}
