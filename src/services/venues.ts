import { sanityClient } from "@/sanity/client";

export type Venue = {
  _id: string;
  name: string;
  slug: string;
  description: string;
};

/** Full venue document for venue detail pages (watch/play from linked sports). */
export type VenueDetail = Venue & {
  // watch: Activity[];
  // play: Activity[];
};

export async function listVenues() {
  const venues = await sanityClient.fetch<Venue[]>(`
        *[_type == "venue"] | order(createdAt desc)
    `);

  return venues;
}

export async function getVenueBySlug(
  slug: string,
): Promise<VenueDetail | null> {
  if (!slug) return null;

  const row = await sanityClient.fetch<{
    _id: string;
    name: string;
    slug: string | null;
    description: string | null;
    // area: string | null;
    // suburb: string | null;
    // image: SanityImageSource | null;
    // watch: { id?: string; slug?: string; name?: string }[] | null;
    // play: { id?: string; slug?: string; name?: string }[] | null;
  } | null>(
    `*[_type == "venue" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      description,
    }`,
    { slug },
  );

  if (!row?.slug) return null;

  return {
    _id: row._id,
    name: row.name,
    slug: row.slug,
    // image: (row.image ?? {}) as SanityImageSource,
    description: row.description ?? "",
    // area: row.area ?? "",
    // suburb: row.suburb ?? "",
    // watch: asActivities(row.watch),
    // play: asActivities(row.play),
  };
}
