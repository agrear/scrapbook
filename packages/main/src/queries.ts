import type { Database } from 'better-sqlite3';
import { ipcMain as ipc } from 'electron';

import { createId, createThumbnail, loadImage, toDate, toUTC } from './util';

export function registerQueries(db: Database): void {
  const deleteBook = db.prepare('DELETE FROM book WHERE id = ?');

  const deleteBookAuthor = db.prepare(`
    DELETE FROM book_author WHERE book_id = @bookId AND author_id = @authorId
  `);

  const deleteBookPublisher = db.prepare(`
    DELETE FROM book_publisher WHERE book_id = ?
  `);

  const deleteBookTag = db.prepare(`
    DELETE FROM book_tag WHERE book_id = @bookId AND tag_id = @tagId
  `);

  const deletePage = db.prepare('DELETE FROM page WHERE id = ?');

  const deleteTag = db.prepare('DELETE FROM tag WHERE id = ?');

  const deleteVolume = db.prepare('DELETE FROM volume WHERE book_id = ?');

  const insertAuthor = db.prepare(`
    INSERT INTO author (id, name) VALUES (?, ?)
  `);

  const insertBook = db.prepare(`
    INSERT INTO book (
      id,
      title,
      description,
      published
    ) VALUES (
      @id,
      @title,
      @description,
      @published
    )
  `);

  const insertPage = db.prepare(`
    INSERT INTO page (
      id,
      book_id,
      number,
      image_type,
      image_width,
      image_height,
      image_data
    ) VALUES (
      @id,
      @bookId,
      @number,
      @imageType,
      @imageWidth,
      @imageHeight,
      @imageData
    )
  `);

  const insertPublisher = db.prepare(`
    INSERT INTO publisher (id, name) VALUES (?, ?)
  `);

  const insertSeries = db.prepare(`
    INSERT INTO series (id, name) VALUES (?, ?)
  `);

  const insertTag = db.prepare('INSERT INTO tag (id, name) VALUES (?, ?)');

  const selectAuthorIdByName = db.prepare(`
    SELECT id FROM author WHERE name = ?
  `).pluck();

  const selectAuthors = db.prepare(`
    SELECT
      author.id,
      author.name,
      COUNT(*) AS book_count,
      (
        SELECT page.id FROM page
        WHERE page.book_id = book_author.book_id AND number = 0
      ) AS cover_page_id,
      book_id AS cover_page_book_id,
      (
        SELECT GROUP_CONCAT(tag_name) FROM (
          SELECT ba.author_id, tag.name AS tag_name FROM book_tag
          JOIN book_author AS ba ON ba.book_id = book_tag.book_id
          JOIN tag ON tag.id = book_tag.tag_id
          WHERE ba.author_id = book_author.author_id
          GROUP BY tag.id
          ORDER BY count(book_tag.tag_id) DESC, tag.name
          LIMIT 8
        )
        GROUP BY author_id
      ) AS popular_tags
    FROM book_author
    JOIN author ON author.id = author_id
    GROUP BY author.id
    ORDER BY author.name
  `);

  /*
  SELECT tag.name FROM book_tag
  JOIN book_author ON book_author.book_id = book_tag.book_id
  JOIN tag ON tag.id = book_tag.tag_id
  GROUP BY author.id, book_tag.tag_id
  ORDER BY count(book_tag.tag_id) DESC, tag.name
  LIMIT 10
  */

  const selectBook = db.prepare(`
    SELECT
      book.id,
      created,
      title,
      description,
      published,
      bookmark,
      brightness,
      page_fit,
      page_position,
      zoom,
      (
        SELECT GROUP_CONCAT(author.name) FROM book_author
        JOIN author ON author.id = book_author.author_id
        WHERE book_author.book_id = book.id
      ) AS authors,
      (
        SELECT GROUP_CONCAT(tag.name) FROM book_tag
        JOIN tag ON tag.id = book_tag.tag_id
        WHERE book_tag.book_id = book.id
      ) AS tags,
      publisher.name AS publisher_name,
      language.id AS language_id,
      language.name AS language_name,
      series.id AS series_id,
      series.name AS series_name,
      volume.number AS volume_number,
      (
        SELECT id FROM page
        WHERE book_id = book.id AND number = 0
      ) AS cover_page_id
    FROM book
    LEFT JOIN book_publisher ON book_publisher.book_id = book.id
    LEFT JOIN publisher ON publisher.id = book_publisher.publisher_id
    LEFT JOIN volume ON volume.book_id = book.id
    LEFT JOIN series ON series.id = volume.series_id
    JOIN book_language ON book_language.book_id = book.id
    JOIN language ON language.id = book_language.language_id
    WHERE book.id = ?
  `);

  const selectBookAuthor = db.prepare(`
    SELECT author.name FROM book_author
    JOIN author ON author.id = author_id
    WHERE book_id = ?
  `).raw();

  const selectBookTags = db.prepare(`
    SELECT tag.name FROM book_tag
    JOIN tag ON tag.id = tag_id
    WHERE book_id = ?
  `).raw();

  const selectBooks = db.prepare(`
    SELECT
      book.id,
      created,
      title,
      description,
      published,
      bookmark,
      brightness,
      page_fit,
      page_position,
      zoom,
      (
        SELECT GROUP_CONCAT(author.name) FROM book_author
        JOIN author ON author.id = book_author.author_id
        WHERE book_author.book_id = book.id
      ) AS authors,
      (
        SELECT GROUP_CONCAT(tag.name) FROM book_tag
        JOIN tag ON tag.id = book_tag.tag_id
        WHERE book_tag.book_id = book.id
      ) AS tags,
      publisher.name AS publisher_name,
      language.id AS language_id,
      language.name AS language_name,
      series.id AS series_id,
      series.name AS series_name,
      volume.number AS volume_number,
      (
        SELECT id FROM page
        WHERE book_id = book.id AND number = 0
      ) AS cover_page_id
    FROM book
    LEFT JOIN book_publisher ON book_publisher.book_id = book.id
    LEFT JOIN publisher ON publisher.id = book_publisher.publisher_id
    LEFT JOIN volume ON volume.book_id = book.id
    LEFT JOIN series ON series.id = volume.series_id
    JOIN book_language ON book_language.book_id = book.id
    JOIN language ON language.id = book_language.language_id
    ORDER BY created DESC
  `);

  const selectBooksByAuthor = db.prepare(`
    SELECT
      book.id,
      created,
      title,
      description,
      published,
      bookmark,
      brightness,
      page_fit,
      page_position,
      zoom,
      (
        SELECT GROUP_CONCAT(author.name) FROM book_author
        JOIN author ON author.id = book_author.author_id
        WHERE book_author.book_id = book.id
      ) AS authors,
      (
        SELECT GROUP_CONCAT(tag.name) FROM book_tag
        JOIN tag ON tag.id = book_tag.tag_id
        WHERE book_tag.book_id = book.id
      ) AS tags,
      publisher.name AS publisher_name,
      language.id AS language_id,
      language.name AS language_name,
      series.id AS series_id,
      series.name AS series_name,
      volume.number AS volume_number,
      (
        SELECT id FROM page
        WHERE book_id = book.id AND number = 0
      ) AS cover_page_id
    FROM book_author
    JOIN book ON book.id = book_author.book_id
    LEFT JOIN book_publisher ON book_publisher.book_id = book.id
    LEFT JOIN publisher ON publisher.id = book_publisher.publisher_id
    LEFT JOIN volume ON volume.book_id = book.id
    LEFT JOIN series ON series.id = volume.series_id
    JOIN book_language ON book_language.book_id = book.id
    JOIN language ON language.id = book_language.language_id
    WHERE book_author.author_id = ?
  `);

  const selectBooksBySeries = db.prepare(`
    SELECT
      book.id,
      created,
      title,
      description,
      published,
      bookmark,
      brightness,
      page_fit,
      page_position,
      zoom,
      (
        SELECT GROUP_CONCAT(author.name) FROM book_author
        JOIN author ON author.id = book_author.author_id
        WHERE book_author.book_id = book.id
      ) AS authors,
      (
        SELECT GROUP_CONCAT(tag.name) FROM book_tag
        JOIN tag ON tag.id = book_tag.tag_id
        WHERE book_tag.book_id = book.id
      ) AS tags,
      publisher.name AS publisher_name,
      language.id AS language_id,
      language.name AS language_name,
      series.id AS series_id,
      series.name AS series_name,
      volume.number AS volume_number,
      (
        SELECT id FROM page
        WHERE book_id = book.id AND number = 0
      ) AS cover_page_id
    FROM volume
    JOIN book ON book.id = volume.book_id
    LEFT JOIN book_publisher ON book_publisher.book_id = book.id
    LEFT JOIN publisher ON publisher.id = book_publisher.publisher_id
    LEFT JOIN series ON series.id = volume.series_id
    JOIN book_language ON book_language.book_id = book.id
    JOIN language ON language.id = book_language.language_id
    WHERE volume.series_id = ?
    ORDER BY volume.number ASC
  `);

  const selectBooksByTag = db.prepare(`
    SELECT
      book.id,
      created,
      title,
      description,
      published,
      bookmark,
      brightness,
      page_fit,
      page_position,
      zoom,
      (
        SELECT GROUP_CONCAT(author.name) FROM book_author
        JOIN author ON author.id = book_author.author_id
        WHERE book_author.book_id = book.id
      ) AS authors,
      (
        SELECT GROUP_CONCAT(tag.name) FROM book_tag
        JOIN tag ON tag.id = book_tag.tag_id
        WHERE book_tag.book_id = book.id
      ) AS tags,
      publisher.name AS publisher_name,
      language.id AS language_id,
      language.name AS language_name,
      series.id AS series_id,
      series.name AS series_name,
      volume.number AS volume_number,
      (
        SELECT id FROM page
        WHERE book_id = book.id AND number = 0
      ) AS cover_page_id
    FROM book_tag
    JOIN book ON book.id = book_tag.book_id
    LEFT JOIN book_publisher ON book_publisher.book_id = book.id
    LEFT JOIN publisher ON publisher.id = book_publisher.publisher_id
    LEFT JOIN volume ON volume.book_id = book.id
    LEFT JOIN series ON series.id = volume.series_id
    JOIN book_language ON book_language.book_id = book.id
    JOIN language ON language.id = book_language.language_id
    WHERE book_tag.tag_id = ?
  `);

  const selectImage = db.prepare(`
    SELECT
      book_id,
      id AS page_id,
      image_type,
      image_data,
      image_width,
      image_height,
      length(image_data) AS image_size
    FROM page WHERE id = ?
  `);

  const selectLanguages = db.prepare(`
    SELECT id, name, type, scope FROM language
    WHERE
      type IN ('living', 'special') AND
      scope IN ('individual', 'macrolanguage', 'special')
    ORDER BY name
  `);

  const selectNextPageNumber = db.prepare(`
    SELECT IFNULL(MAX(number) + 1, 0) FROM page WHERE book_id = ?
  `).pluck();

  const selectPage = db.prepare(`
    SELECT id, book_id, number FROM page WHERE id = ?
  `);

  const selectPages = db.prepare(`
    SELECT id, book_id, number FROM page WHERE book_id = ? ORDER BY number ASC
  `);

  const selectPublisherIdByName = db.prepare(`
    SELECT id FROM publisher WHERE name = ?
  `).pluck();

  const selectPublishers = db.prepare('SELECT id, name FROM publisher');

  const selectSeries = db.prepare(`
    SELECT
      series.id,
      series.name,
      (
        SELECT COUNT(*) FROM volume AS v
        WHERE v.series_id = volume.series_id
      ) AS volumes,
      first_volume.id AS cover_page_id,
      first_volume.book_id AS cover_page_book_id,
      (
        SELECT GROUP_CONCAT(DISTINCT tag.name) FROM book_tag
        JOIN tag ON tag.id = tag_id
        JOIN volume AS v ON v.book_id = book_tag.book_id
        WHERE v.series_id = volume.series_id
      ) AS tags
    FROM volume
    JOIN series ON series.id = volume.series_id
    JOIN (
      SELECT page.id, page.book_id, volume.series_id FROM page
      JOIN volume ON volume.book_id = page.book_id
      WHERE page.number = 0
      GROUP BY volume.book_id HAVING volume.number = MIN(volume.number)
    ) first_volume ON
      first_volume.series_id = series.id AND
      first_volume.book_id = volume.book_id
    GROUP BY series.id ORDER BY series.name
  `);

  const selectSeriesIdByName = db.prepare(`
    SELECT id FROM series WHERE name = ?
  `).pluck();

  const selectTagByName = db.prepare(`
    SELECT tag.id, tag.name, COUNT(*) AS book_count FROM book_tag
    JOIN tag ON tag.id = tag_id
    WHERE tag.name = ?
    GROUP BY tag.id
  `);

  const selectTagIdByName = db.prepare(`
    SELECT id FROM tag WHERE name = ?`
  ).pluck();

  const selectTags = db.prepare(`
    SELECT tag.id, tag.name, COUNT(*) AS book_count FROM book_tag
    JOIN tag ON tag.id = tag_id
    GROUP BY tag.id
    ORDER BY tag.name
  `);

  const selectVolumes = db.prepare(`
    SELECT series_id, book_id, number FROM volume
    JOIN series ON series.id = series_id
    WHERE series_id = ?
  `);

  const updateBookmark = db.prepare(`
    UPDATE book SET bookmark = @pageNumber WHERE id = @bookId
  `);

  const updateBook = db.prepare(`
    UPDATE book
    SET title = @title, description = @description, published = @published
    WHERE id = @bookId
  `);

  const updateBookBrightness = db.prepare(`
    UPDATE book SET brightness = @brightness WHERE id = @bookId
  `);

  const updateBookLayout = db.prepare(`
    UPDATE book SET page_fit = @fit, page_position = @position
    WHERE id = @bookId
  `);

  const updateBookZoom = db.prepare(`
    UPDATE book SET zoom = @zoom WHERE id = @bookId
  `);

  const updatePageNumber = db.prepare(`
    UPDATE page SET number = @number WHERE id = @pageId
  `);

  const updatePageNumbersHigher = db.prepare(`
    UPDATE page
    SET number = number - 1
    WHERE book_id = @bookId AND number > @oldNumber AND number <= @number
  `);

  const updatePageNumbersLower = db.prepare(`
    UPDATE page
    SET number = number + 1
    WHERE book_id = @bookId AND number >= @number AND number < @oldNumber
  `);

  const updateTag = db.prepare(`
    UPDATE tag SET name = @name WHERE id = @tagId
  `);

  const upsertBookAuthor = db.prepare(`
    INSERT INTO book_author (book_id, author_id) VALUES (?, ?)
    ON CONFLICT DO NOTHING
  `);

  const upsertBookLanguage = db.prepare(`
    INSERT INTO book_language (book_id, language_id) VALUES (?, ?)
    ON CONFLICT DO NOTHING
  `);

  const upsertBookPublisher = db.prepare(`
    INSERT INTO book_publisher (book_id, publisher_id) VALUES (?, ?)
    ON CONFLICT DO NOTHING
  `);

  const upsertBookTag = db.prepare(`
    INSERT INTO book_tag (book_id, tag_id) VALUES (?, ?)
    ON CONFLICT DO NOTHING
  `);

  const upsertVolume = db.prepare(`
    INSERT INTO volume (
      series_id,
      book_id,
      number
    ) VALUES (
      @seriesId,
      @bookId,
      @number
    )
    ON CONFLICT (book_id) DO UPDATE SET number = EXCLUDED.number
  `);

  const upsertBookAuthors = (bookId: string, authors: string[]) => {
    authors.forEach(author => {
      let authorId = selectAuthorIdByName.get(author);
      if (authorId === undefined) {  // Insert new author
        authorId = createId();
        insertAuthor.run(authorId, author);
      }

      upsertBookAuthor.run(bookId, authorId);
    });
  };

  const upsertBookVolume = (bookId: string, series: string, volume: number) => {
    let seriesId = selectSeriesIdByName.get(series);
    if (seriesId === undefined) {  // Create new series
      seriesId = createId();
      insertSeries.run(seriesId, series);
    }

    upsertVolume.run({ seriesId, bookId, number: volume });
  };

  const upsertBookTags = (bookId: string, tags: string[]) => {
    tags.forEach(tag => {
      let tagId = selectTagIdByName.get(tag);
      if (tagId === undefined) {  // Insert new tag
        tagId = createId();
        insertTag.run(tagId, tag);
      }

      upsertBookTag.run(bookId, tagId);
    });
  };

  const upsertPublisher = (bookId: string, publisher: string) => {
    let publisherId = selectPublisherIdByName.get(publisher);
    if (publisherId === undefined) {  // Insert new tag
      publisherId = createId();
      insertPublisher.run(publisherId, publisher);
    }

    upsertBookPublisher.run(bookId, publisherId);
  };

  function formatAuthor({
    id,
    name,
    book_count,
    cover_page_id,
    cover_page_book_id,
    popular_tags
  }: {
    id: string,
    name: string,
    book_count: number,
    cover_page_id: string,
    cover_page_book_id: string,
    popular_tags: string | null
  }): Author {
    return {
      id,
      name,
      books: book_count,
      cover: {
        id: cover_page_id,
        bookId: cover_page_book_id,
        number: 0
      },
      popularTags: popular_tags?.split(',') ?? []
    };
  }

  function formatBook({
    id,
    title,
    description,
    published,
    bookmark,
    created,
    brightness,
    page_fit,
    page_position,
    zoom,
    authors,
    tags,
    publisher_name,
    language_id,
    language_name,
    series_id,
    series_name,
    volume_number,
    cover_page_id
  }: {
    id: string,
    title: string,
    description: string | null,
    published: number | null,
    bookmark: number,
    created: number,
    brightness: number,
    page_fit: ObjectFit,
    page_position: ObjectPosition,
    zoom: number,
    authors: string,
    tags: string | null,
    publisher_name: string | null,
    language_id: string,
    language_name: string,
    series_id: string | null,
    series_name: string | null,
    volume_number: number | null,
    cover_page_id: string
  }): Book {
    return {
      id,
      title,
      description,
      created: toDate(created),
      bookmark,
      published: published !== null ? toDate(published) : null,
      publisher: publisher_name,
      language: {
        id: language_id,
        name: language_name
      },
      brightness,
      layout: {
        fit: page_fit,
        position: page_position
      },
      zoom,
      series: (
        series_id !== null && series_name !== null && volume_number !== null
      ) ? {
        id: series_id,
        name: series_name,
        volume: {
          seriesId: series_id,
          bookId: id,
          number: volume_number
        }
      } : null,
      authors: authors.split(','),
      tags: tags?.split(',') ?? [],
      cover: {
        id: cover_page_id,
        bookId: id,
        number: 0
      }
    };
  }

  function formatBookAuthors(authors: string[][]) {
    return authors.flat();
  }

  function formatBookTags(tags: string[][]) {
    return tags.flat();
  }

  function formatImage({
    book_id,
    page_id,
    image_type,
    image_data,
    image_width,
    image_height,
    image_size
  }: {
    book_id: string,
    page_id: string,
    image_type: string,
    image_data: Buffer,
    image_width: number,
    image_height: number,
    image_size: number
  }): Omit<ImageFile, 'name' | 'path'> & { bookId: string, pageId: string } {
    return {
      bookId: book_id,
      pageId: page_id,
      type: image_type,
      data: Buffer.from(image_data),
      width: image_width,
      height: image_height,
      size: image_size
    };
  }

  function formatPage({
    id,
    book_id,
    number
  }: {
    id: string,
    book_id: string,
    number: number
  }) {
    return {
      id,
      bookId: book_id,
      number
    };
  }

  function formatSeries({
    id,
    name,
    volumes,
    cover_page_id,
    cover_page_book_id,
    tags
  }: {
    id: string,
    name: string,
    volumes: number,
    cover_page_id: string,
    cover_page_book_id: string,
    tags: string | null
  }): Series {
    return {
      id,
      name,
      volumes,
      cover: {
        id: cover_page_id,
        bookId: cover_page_book_id,
        number: 0
      },
      tags: tags?.split(',')?.sort((a, b) => a.localeCompare(b)) ?? []
    };
  }

  function formatTag({
    id,
    name,
    book_count
  }: {
    id: string,
    name: string,
    book_count: number
  }): Tag {
    return {
      id,
      name,
      count: book_count
    };
  }

  function formatVolume({
    series_id,
    book_id,
    number
  }: {
    series_id: string,
    book_id: string,
    number: number
  }): Volume {
    return {
      seriesId: series_id,
      bookId: book_id,
      number
    };
  }

  ipc.handle('deleteBook', (_event, bookId: string) => deleteBook.run(bookId));

  ipc.handle('deletePage', (_event, pageId: string) => deletePage.run(pageId));

  ipc.handle('deleteTag', (_event, tagId: string) => deleteTag.run(tagId));

  ipc.handle('getAuthors', () => selectAuthors.all().map(formatAuthor));

  ipc.handle('getBook', (_event, bookId: string) => (
    formatBook(selectBook.get(bookId))
  ));

  ipc.handle('getBooks', () => selectBooks.all().map(formatBook));

  ipc.handle('getBooksByAuthor', (_event, authorId: string) => (
    selectBooksByAuthor.all(authorId).map(formatBook)
  ));

  ipc.handle('getBooksBySeries', (_event, seriesId: string) => (
    selectBooksBySeries.all(seriesId).map(formatBook)
  ));

  ipc.handle('getBooksByTag', (_event, tagId: string) => (
    selectBooksByTag.all(tagId).map(formatBook)
  ));

  ipc.handle('getImage', async (
    _event, {
      pageId,
      options = { thumbnail: false }
    }: {
      pageId: string,
      options: ImageOptions
    }) => {
    const image = formatImage(selectImage.get(pageId));

    if (options.thumbnail) {
      Object.assign(image, await createThumbnail(image.data));
    }

    return image;
  });

  ipc.handle('getLanguages', () => selectLanguages.all());

  ipc.handle('getPages', (_event, bookId: string) => (
    selectPages.all(bookId).map(formatPage)
  ));

  ipc.handle('getPublishers', () => selectPublishers.all());

  ipc.handle('getSeries', () => selectSeries.all().map(formatSeries));

  ipc.handle('getTag', (_event, name: string) => (
    formatTag(selectTagByName.get(name))
  ));

  ipc.handle('getTags', () => selectTags.all().map(formatTag));

  ipc.handle('getVolumes', (_event, seriesId: string) => (
    selectVolumes.all(seriesId).map(formatVolume)
  ));

  ipc.handle('insertBook', db.transaction(
    (_event, metaData: EditBookFormData) => {
      const bookId = createId();

      const {
        authors,
        published,
        publisher,
        language,
        series,
        tags,
        ...meta
      } = metaData;

      insertBook.run({
        id: bookId,
        published: published !== null ? toUTC(published) : null,
        ...meta
      });

      upsertBookAuthors(bookId, authors);

      if (series !== null) {
        upsertBookVolume(bookId, series.name, series.volume);
      }

      if (publisher !== null) {
        upsertPublisher(bookId, publisher);
      }

      upsertBookLanguage.run(bookId, language.id);

      upsertBookTags(bookId, tags);

      return formatBook(selectBook.get(bookId));
    })
  );

  ipc.handle('insertPage', async (
    _event,
    {
      bookId,
      image,
      number
    }: {
      bookId: string,
      image: FileInfo,
      number: number | undefined
    }
  ) => {
    const pageId = createId();
    const { data, type, height, width } = await loadImage(image.path);

    insertPage.run({
      id: pageId,
      bookId,
      number: number ?? selectNextPageNumber.get(bookId),
      imageType: type,
      imageWidth: width,
      imageHeight: height,
      imageData: data
    });

    return formatPage(selectPage.get(pageId));
  });

  ipc.handle('updateBook', db.transaction((
    _event, {
      bookId,
      metaData
    }: {
      bookId: string,
      metaData: EditBookFormData
    }
  ) => {
    const {
      authors,
      published,
      publisher,
      language,
      series,
      tags,
      ...meta
    } = metaData;

    updateBook.run({
      bookId,
      published: published ? toUTC(published) : null,
      ...meta
    });

    // Update authors
    const newAuthors = new Set(authors);
    const oldAuthors = new Set(formatBookAuthors(selectBookAuthor.all(bookId)));

    [...oldAuthors].filter(x => !newAuthors.has(x)).forEach(author => {
      deleteBookAuthor.run({
        bookId,
        authorId: selectAuthorIdByName.get(author)
      });
    });

    upsertBookAuthors(bookId, [...newAuthors].filter(x => !oldAuthors.has(x)));

    // Update series
    if (series !== null) {
      upsertBookVolume(bookId, series.name, series.volume);
    } else {
      deleteVolume.run(bookId);
    }

    // Update publisher
    if (publisher !== null) {
      upsertPublisher(bookId, publisher);
    } else {
      deleteBookPublisher.run(bookId);
    }

    upsertBookLanguage.run(bookId, language.id);

    // Update tags
    const newTags = new Set(tags);
    const oldTags = new Set(formatBookTags(selectBookTags.all(bookId)));

    [...oldTags].filter(x => !newTags.has(x)).forEach(tag => {
      deleteBookTag.run({ bookId, tagId: selectTagIdByName.get(tag) });
    });

    upsertBookTags(bookId, [...newTags].filter(x => !oldTags.has(x)));
  }));

  ipc.handle('updateBookmark', (
    _event,
    { bookId, pageNumber }: { bookId: string, pageNumber: number }
  ) => {
    updateBookmark.run({ bookId, pageNumber });
  });

  ipc.handle('updateBookBrightness', (
    _event, { bookId, brightness }: { bookId: string, brightness: number }
  ) => {
    updateBookBrightness.run({ bookId, brightness });
  });

  ipc.handle('updateBookLayout', (
    _event, { bookId, layout }: { bookId: string, layout: Layout }
  ) => {
    updateBookLayout.run({
      bookId,
      ...layout
    });
  });

  ipc.handle('updateBookZoom', (
    _event, { bookId, zoom }: { bookId: string, zoom: number }
  ) => {
    updateBookZoom.run({ bookId, zoom });
  });

  ipc.handle('updatePageNumber',
    db.transaction((
      _event,
      { pageId, pageNumber }: { pageId: string, pageNumber: number
    }) => {
      const { bookId, number: oldNumber } = formatPage(selectPage.get(pageId));

      // Shift page numbers accordingly
      if (pageNumber < oldNumber) {
        updatePageNumbersLower.run({ bookId, oldNumber, number: pageNumber });
      } else if (pageNumber > oldNumber) {
        updatePageNumbersHigher.run({ bookId, oldNumber, number: pageNumber });
      }

      updatePageNumber.run({ pageId, number: pageNumber });
    })
  );

  ipc.handle('updateTag', (
    _event,
    { tagId, name }: { tagId: string, name: string }
  ) => {
    updateTag.run({ tagId, name });
  });
}
