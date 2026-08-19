export type CountryStatus = "visited" | "want" | "lived";

export type Memory = {
  id: string;
  imageUri: string;
  title?: string;
  description?: string;
  date?: string;
};

export type CountryUserData = {
  status?: CountryStatus;
  memories: Memory[];
};

export type TravelData = Record<string, CountryUserData>;