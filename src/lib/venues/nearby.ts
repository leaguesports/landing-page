export type NearbyVenueCard = {
  name: string;
  slug: string;
  suburb: string;
  city: string;
  rating: number | null;
};

export const NEARBY_VENUES_QUERY = `*[
  _type == "venue"
  && defined(slug.current)
  && slug.current != $slug
  && (
    ($city != "" && address.city->title == $city) ||
    ($suburb != "" && address.suburb->title == $suburb)
  )
] | order(
  select(address.suburb->title == $suburb => 0, 1) asc,
  coalesce(rating, 0) desc,
  name asc
) [0...6] {
  name,
  "slug": slug.current,
  "suburb": address.suburb->title,
  "city": address.city->title,
  rating
}`;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asRating(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function mapNearbyVenueRows(
  rows: readonly {
    name?: unknown;
    slug?: unknown;
    suburb?: unknown;
    city?: unknown;
    rating?: unknown;
  }[] | null | undefined,
): NearbyVenueCard[] {
  const cards: NearbyVenueCard[] = [];
  const seen = new Set<string>();
  for (const row of rows ?? []) {
    const name = asString(row?.name);
    const slug = asString(row?.slug);
    if (!name || !slug || seen.has(slug)) continue;
    seen.add(slug);
    cards.push({
      name,
      slug,
      suburb: asString(row?.suburb),
      city: asString(row?.city),
      rating: asRating(row?.rating),
    });
  }
  return cards;
}
