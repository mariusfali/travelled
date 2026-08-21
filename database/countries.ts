import type { SQLiteDatabase } from "expo-sqlite";
import type { CountryStatus, TravelData } from "../types/travel";

export async function setCountryStatus(
  db: SQLiteDatabase,
  country_code: string,
  status: CountryStatus | null
) {
  // if (status === null) {
  //   await db.runAsync(
  //     "DELETE FROM countries WHERE code = ?",
  //     country_code
  //   );
  //   return;
  // }

  if (status === null) {
    // Remove the status, but keep the country
    // if it still has memories.
    await db.runAsync(
      `
      UPDATE countries
      SET status = NULL
      WHERE code = ?
      `,
      country_code
    );

    // If there is now neither a status nor any memories,
    // remove the country row entirely.
    await db.runAsync(
      `
      DELETE FROM countries
      WHERE code = ?
        AND status IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM memories
          WHERE memories.country_code = countries.code
        )
      `,
      country_code
    );

    return;
  }

  await db.runAsync(
    `
    INSERT INTO countries (code, status)
    VALUES (?, ?)
    ON CONFLICT(code)
    DO UPDATE SET status = excluded.status
    `,
    country_code,
    status
  );
}

export async function getTravelData(
  db: SQLiteDatabase
): Promise<TravelData> {
  const countries = await db.getAllAsync<{
    code: string;
    status: CountryStatus | null;
  }>(
    "SELECT code, status FROM countries"
  );

  const memories = await db.getAllAsync<{
    id: string;
    country_code: string;
    image_uri: string;
    // title: string | null;
    // description: string | null;
    // date: string | null;
  }>(
    // "SELECT * FROM memories"
    "SELECT id, country_code, image_uri FROM memories"
  );

  const data: TravelData = {};

  for (const country of countries) {
    data[country.code] = {
      status: country.status ?? undefined,
      memories: [],
    };
  }

  for (const memory of memories) {
    if (!data[memory.country_code]) {
      data[memory.country_code] = {
        memories: [],
      };
    }

    data[memory.country_code].memories.push({
      id: memory.id,
      imageUri: memory.image_uri,
      // title: memory.title ?? undefined,
      // description: memory.description ?? undefined,
      // date: memory.date ?? undefined,
    });
  }

  return data;
}

