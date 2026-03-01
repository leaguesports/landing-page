export type Intent = "watch" | "play";

export type DiscoverItemKind = "venue" | "event";

export type DiscoverVenue = {
  kind: "venue";
  id: string;
  slug: string;
  name: string;
  image: string;
  area: string;
  suburb: string;
  intent: Intent;
  sports: string[];
  lat: number;
  lng: number;
  distanceKm?: number;
};

export type DiscoverEvent = {
  kind: "event";
  id: string;
  title: string;
  sport: string;
  date: string;
  time: string;
  venueName: string;
  suburb: string;
  image: string;
  href: string;
  lat: number;
  lng: number;
  distanceKm?: number;
};

export type DiscoverItem = DiscoverVenue | DiscoverEvent;

export type SportFilter = {
  id: string;
  label: string;
  slug: string;
  icon?: string;
};
