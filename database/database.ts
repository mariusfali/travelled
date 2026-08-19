import * as SQLite from "expo-sqlite";

export async function initializeDatabase(
  db: SQLite.SQLiteDatabase
) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS countries (
      code TEXT PRIMARY KEY NOT NULL,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY NOT NULL,
      country_code TEXT NOT NULL,
      image_uri TEXT NOT NULL,
      title TEXT,
      description TEXT,
      date TEXT,
      FOREIGN KEY (country_code)
        REFERENCES countries(code)
        ON DELETE CASCADE
    );
  `);
}