import type { SQLiteDatabase } from "expo-sqlite";
import type { Memory } from "../types/travel";

export async function addMemory(
  db: SQLiteDatabase,
  countryCode: string,
  memory: Memory
) {
  await db.runAsync(
    `
      INSERT OR IGNORE INTO countries (code)
      VALUES (?)
    `,
    countryCode
  );

  await db.runAsync(
    `
      INSERT INTO memories (
        id,
        country_code,
        image_uri
      )
      VALUES (?, ?, ?)
    `,
    memory.id,
    countryCode,
    memory.imageUri
  );
}

// export async function deleteMemory(
//   db: SQLiteDatabase,
//   memoryId: string
// ) {
//   await db.runAsync(
//     "DELETE FROM memories WHERE id = ?",
//     memoryId
//   );
// }

export async function deleteMemory(
  db: SQLiteDatabase,
  memoryId: string
) {
  const memory = await db.getFirstAsync<{
    country_code: string;
  }>(
    "SELECT country_code FROM memories WHERE id = ?",
    memoryId
  );

  if (!memory) return;

  await db.runAsync(
    "DELETE FROM memories WHERE id = ?",
    memoryId
  );

  await db.runAsync(
    `
    DELETE FROM countries
    WHERE code = ?
      AND status IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM memories
        WHERE country_code = countries.code
      )
    `,
    memory.country_code
  );
}