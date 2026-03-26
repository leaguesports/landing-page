import { sanityClient } from "@/sanity/client";
import { Broadcast } from "@/types/broadcast";

interface BroadcastRepository {
  getBroadcastsBySportSlug(sportSlug: string): Promise<Broadcast[]>;
  getBroadcastsBySeriesSlug(seriesSlug: string, limit?: number): Promise<Broadcast[]>;
}

class SanityBroadcastRepository implements BroadcastRepository {
  constructor(private readonly client: typeof sanityClient) {}

  async getBroadcastsBySportSlug(sportSlug: string): Promise<Broadcast[]> {
    const broadcasts = await sanityClient.fetch<Broadcast[]>(
      `*[_type == "event" && series == $sportSlug]`,
      { sportSlug },
    );

    return broadcasts;
  }

  async getBroadcastsBySeriesSlug(
    seriesSlug: string,
    limit: number = 4,
  ): Promise<Broadcast[]> {
    const broadcasts = await sanityClient.fetch<Broadcast[]>(
      `*[_type == "event" && series == $seriesSlug]
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
      { seriesSlug, limit },
    );

    return broadcasts;
  }
}

class BroadcastService {
  constructor(private readonly repository: BroadcastRepository) {}

  async getBroadcastsBySportSlug(sportSlug: string): Promise<Broadcast[]> {
    return this.repository.getBroadcastsBySportSlug(sportSlug);
  }

  async getBroadcastsBySeriesSlug(seriesSlug: string, limit?: number): Promise<Broadcast[]> {
    return this.repository.getBroadcastsBySeriesSlug(seriesSlug, limit);
  }
}

const broadcastRepository = new SanityBroadcastRepository(sanityClient);
export const broadcastService = new BroadcastService(broadcastRepository);
