import { sanityClient } from "@/sanity/client";
import type { TypedObject } from "@portabletext/types";

type SanityRace = {
  id: string;
  title: string;
  description: TypedObject | TypedObject[];
  slug: string;
  dateTime: string;
  round: number;
  laps: number;
  distance: number;
  track: string;
};

export async function getRaceBySlug(slug: string) {
  const race = await sanityClient.fetch<SanityRace>(
    `*[_type == "event" && slug.current == $slug][0] {
        "id": _id,
        "title": title,
        "slug": slug.current,
        "description": f1Details.description,
        "dateTime": f1Details.dateTime,
        "round": f1Details.round,
        "track": f1Details.track,
        "laps": f1Details.laps,
        "distance": f1Details.distance,
        }`,
    { slug },
  );

  return race;
}

/** Fetch all F1 race slugs for sitemap and static generation. */
export async function getAllRaceSlugs(): Promise<string[]> {
  const races = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "event" && defined(slug.current)].slug.current`,
  );
  return races?.map((race) => race.slug) ?? [];
}
