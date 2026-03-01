import { sanityClient } from "@/sanity/client";

type SanityRace = {
  id: string;
  title: string;
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
