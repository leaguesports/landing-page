import { SanityImageSource } from "@sanity/image-url";

type Sport = {
  id: string;
  name: string;
  slug: string;
};

export type Series = {
  id: string;
  name: string;
  slug: string;
  sport: Sport;
};

export type Venue = {
  id: string;
  name: string;
  slug: string;
};

export type Broadcast = {
  id: string;
  title: string;
  slug: string;
  description: string;
  series: Series;
  dateTime: string;
  venue: Venue;
  image: SanityImageSource;
};
