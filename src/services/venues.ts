import { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "@/sanity/client";

export type Venue = {
  _id: string;
  name: string;
  slug: string;
  image: SanityImageSource;
  description: string;
  area: string;
  suburb: string;
};

export async function listVenues() {
  const venues = await sanityClient.fetch<Venue[]>(`
        *[_type == "venue"] | order(createdAt desc)
    `);

  return venues;
}
