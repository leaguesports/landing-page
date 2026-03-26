import { sanityClient } from "@/sanity/client";

type Series = "f1" | "f2";

type Race = {
  id: string;
  title: string;
  slug: string;
  description: string;
  dateTime: string;
  round: number;
  track: string;
  laps: number;
  distance: number;
};

export async function getRaces(series: Series, limit: number = 4) {
  const races = await sanityClient.fetch<Race[]>(
    `*[_type == "event" && series == $series] 
    {
        "id": _id,
        "title": title,
        "slug": slug.current,
        "description": f1Details.description,
        "dateTime": f1Details.dateTime,
        "round": f1Details.round,
        "track": f1Details.track,
        "laps": f1Details.laps,
        "distance": f1Details.distance,
      } | order(dateTime asc) [0...$limit]`,
    { series, limit },
  );
  return races;
}
