import sqlite3 from 'better-sqlite3';
import type { Database, Options } from 'better-sqlite3';
import { iso6393 } from 'iso-639-3';

export function createDatabase(filename: string, options?: Options): Database {
  const db = sqlite3(filename, options);

  db.pragma('cache_size = -16384000');

  createTables(db);
  createTriggers(db);
  migrate(db);

  return db;
}

const bookColumns = `
  id TEXT NOT NULL PRIMARY KEY,
  created INTEGER DEFAULT (strftime('%s', CURRENT_TIMESTAMP)),
  modified INTEGER DEFAULT (strftime('%s', CURRENT_TIMESTAMP)),
  title TEXT NOT NULL,
  description TEXT,
  published INTEGER,
  bookmark INTEGER NOT NULL DEFAULT -1,
  brightness REAL NOT NULL DEFAULT 1.0,
  page_fit TEXT NOT NULL DEFAULT 'contain',
  page_position TEXT NOT NULL DEFAULT 'center center',
  zoom REAL NOT NULL DEFAULT 1.0,
  CONSTRAINT book_ck_bookmark_is_valid CHECK (bookmark >= -1),
  CONSTRAINT book_ck_brightness_is_valid CHECK (brightness BETWEEN 0.25 AND 1.25),
  CONSTRAINT book_ck_page_fit_is_valid CHECK (page_fit IN (
    'contain', 'cover', 'fill', 'none', 'scale-down'
  )),
  CONSTRAINT book_ck_page_position_is_valid CHECK (page_position IN (
    'left top', 'center top', 'right top',
    'left center', 'center center', 'right center',
    'left bottom', 'center bottom', 'right bottom'
  )),
  CONSTRAINT book_ck_zoom_is_valid CHECK (zoom BETWEEN 0.5 AND 2.0)
`;

function createTables(db: Database) {
  db.prepare(`CREATE TABLE IF NOT EXISTS book (${bookColumns})`).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS author (
      id TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS book_author (
      book_id TEXT NOT NULL REFERENCES book (id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES author (id) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS series (
      id TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS volume (
      book_id TEXT NOT NULL UNIQUE REFERENCES book (id) ON DELETE CASCADE,
      series_id TEXT NOT NULL REFERENCES series (id) ON DELETE CASCADE,
      number INTEGER NOT NULL,
      CONSTRAINT volume_ck_number_is_non_negative CHECK (number >= 0)
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS tag (
      id TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS book_tag (
      book_id TEXT NOT NULL REFERENCES book (id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tag (id) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS publisher (
      id TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS book_publisher (
      book_id TEXT NOT NULL UNIQUE REFERENCES book (id) ON DELETE CASCADE,
      publisher_id TEXT NOT NULL REFERENCES publisher (id) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS language (
      id TEXT NOT NULL PRIMARY KEY,  -- ISO 639-3
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      scope TEXT NOT NULL,
      CONSTRAINT language_type_is_valid CHECK (
        type IN (
          'living',
          'historical',
          'extinct',
          'ancient',
          'constructed',
          'special'
        )
      ),
      CONSTRAINT language_scope_is_valid CHECK (
        scope IN ('individual', 'macrolanguage', 'special')
      )
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS book_language (
      book_id TEXT NOT NULL UNIQUE REFERENCES book (id) ON DELETE CASCADE,
      language_id TEXT NOT NULL REFERENCES language (id) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS page (
      id TEXT NOT NULL PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES book (id) ON DELETE CASCADE,
      number INTEGER NOT NULL,
      image_type TEXT NOT NULL,
      image_width INTEGER NOT NULL,
      image_height INTEGER NOT NULL,
      image_data BLOB NOT NULL,
      CONSTRAINT page_ck_number_is_non_negative CHECK (number >= 0),
      CONSTRAINT page_ck_image_width_is_positive CHECK (image_width > 0),
      CONSTRAINT page_ck_image_height_is_positive CHECK (image_height > 0)
    )
  `).run();
}

function createTriggers(db: Database) {
  // Delete author if no references from books left
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS book_author_trg_deleted
    AFTER DELETE ON book_author
    WHEN (SELECT COUNT(*) FROM book_author WHERE author_id = OLD.author_id) == 0
    BEGIN
      DELETE FROM author WHERE id = OLD.author_id;
    END
  `).run();

  // Delete publisher if no references from books left
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS book_publisher_trg_deleted
    AFTER DELETE ON book_publisher
    WHEN (
      SELECT COUNT(*) FROM book_publisher
      WHERE publisher_id = OLD.publisher_id
    ) == 0
    BEGIN
      DELETE FROM publisher WHERE id = OLD.publisher_id;
    END
  `).run();

  // Delete tag if no references from books left
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS book_tag_trg_deleted
    AFTER DELETE ON book_tag
    WHEN (SELECT COUNT(*) FROM book_tag WHERE tag_id = OLD.tag_id) == 0
    BEGIN
      DELETE FROM tag WHERE id = OLD.tag_id;
    END
  `).run();

  // Set bookmark to previous page if smaller or equal to deleted page,
  // or to -1 if no pages are left
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS page_trg_delete
    BEFORE DELETE ON page
    WHEN (
      (SELECT bookmark FROM book WHERE id = OLD.book_id) > 0 AND
      OLD.number <= (SELECT bookmark FROM book WHERE id = OLD.book_id)
    ) OR (
      (SELECT bookmark FROM book WHERE id = OLD.book_id) == 0 AND
      (SELECT COUNT(*) FROM page WHERE book_id = OLD.book_id) == 1
    )
    BEGIN
      UPDATE book SET bookmark = bookmark - 1 WHERE id = OLD.book_id;
    END
  `).run();

  // Decrement page numbers of subsequent pages
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS page_trg_deleted
    AFTER DELETE ON page
    BEGIN
      UPDATE page
        SET number = number - 1
        WHERE book_id = OLD.book_id AND number > OLD.number;
    END
  `).run();

  // Increment page numbers of subsequent pages before new page is inserted
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS page_trg_insert
    BEFORE INSERT ON page
    BEGIN
      UPDATE page
        SET number = number + 1
        WHERE book_id = NEW.book_id AND number >= NEW.number;
    END
  `).run();

  // Set bookmark after first page was inserted
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS page_trg_inserted
    AFTER INSERT ON page
    WHEN
      (SELECT COUNT(*) FROM page WHERE book_id = NEW.book_id) == 1 OR
      NEW.number < (SELECT bookmark FROM book WHERE id = NEW.book_id)
    BEGIN
      UPDATE book SET bookmark = bookmark + 1 WHERE id = NEW.book_id;
    END
  `).run();

  // Delete series if no references from volumes left
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS volume_trg_deleted
    AFTER DELETE ON volume
    WHEN (SELECT COUNT(*) FROM volume WHERE series_id = OLD.series_id) == 0
    BEGIN
      DELETE FROM series WHERE id = OLD.series_id;
    END
  `).run();
}

function dropTriggers(db: Database) {
  db.transaction(() => {
    db.prepare('DROP TRIGGER book_author_trg_deleted').run();
    db.prepare('DROP TRIGGER book_publisher_trg_deleted').run();
    db.prepare('DROP TRIGGER book_tag_trg_deleted').run();
    db.prepare('DROP TRIGGER page_trg_delete').run();
    db.prepare('DROP TRIGGER page_trg_deleted').run();
    db.prepare('DROP TRIGGER page_trg_insert').run();
    db.prepare('DROP TRIGGER page_trg_inserted').run();
    db.prepare('DROP TRIGGER volume_trg_deleted').run();
  })();
}

function migrate(db: Database) {
  const userVersion = db.pragma('user_version', { simple: true });

  if (userVersion === 0) {
    // Fill 'language' table
    const insertLanguage = db.prepare(`
      INSERT INTO language (id, name, type, scope) VALUES (?, ?, ?, ?)
    `);

    db.transaction(() => {
      iso6393.forEach(({ iso6393: id, name, type, scope }) => {
        insertLanguage.run(id, name, type, scope);
      });

      db.pragma('user_version = 2');
    })();
  } else if (userVersion === 1) {
    // Add 'updated' column to table 'book'
    db.pragma('foreign_keys = off');

    db.transaction(() => {
      dropTriggers(db);

      db.prepare(`CREATE TABLE book_new (${bookColumns})`).run();

      db.prepare(`
        INSERT INTO book_new (
          id,
          created,
          modified,
          title,
          description,
          published,
          bookmark,
          brightness,
          page_fit,
          page_position,
          zoom
        )
        SELECT
          id,
          created,
          created,
          title,
          description,
          published,
          bookmark,
          brightness,
          page_fit,
          page_position,
          zoom
        FROM book
      `).run();

      db.prepare('DROP TABLE book').run();

      db.prepare('ALTER TABLE book_new RENAME TO book').run();

      createTriggers(db);

      db.pragma('user_version = 2');
    })();

    db.pragma('foreign_keys = on');
  }
}
