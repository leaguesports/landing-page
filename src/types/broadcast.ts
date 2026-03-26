import { SanityImageSource } from "@sanity/image-url";

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
  series: string;
  dateTime: string;
  /** F1-specific (from f1Details) */
  round?: number;
  track?: string;
  laps?: number;
  distance?: number;
};
