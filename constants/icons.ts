import map from "@/assets/icons/map.png";
import trips from "@/assets/icons/trips.png";
import friends from "@/assets/icons/friends.png";
import settings from "@/assets/icons/settings.png";
import profile from "@/assets/icons/profile.png";

export const icons = {
    map,
    trips,
    friends,
    settings,
    profile
} as const;

export type IconKey = keyof typeof icons;