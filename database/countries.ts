import type { SQLiteDatabase } from "expo-sqlite";
import type { CountryStatus, TravelData } from "../types/travel";

export async function setCountryStatus(
  db: SQLiteDatabase,
  countryCode: string,
  status: CountryStatus | null
) {
  if (status === null) {
    await db.runAsync(
      "DELETE FROM countries WHERE code = ?",
      countryCode
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
    countryCode,
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
    title: string | null;
    description: string | null;
    date: string | null;
  }>(
    "SELECT * FROM memories"
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
      title: memory.title ?? undefined,
      description: memory.description ?? undefined,
      date: memory.date ?? undefined,
    });
  }

  return data;
}

