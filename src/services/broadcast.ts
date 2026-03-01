import { sanityClient } from "@/sanity/client";
import { Broadcast } from "@/types/broadcast";

interface BroadcastRepository {
  getBroadcastsBySportSlug(sportSlug: string): Promise<Broadcast[]>;
  getBroadcastsBySeriesSlug(seriesSlug: string): Promise<Broadcast[]>;
}

class SanityBroadcastRepository implements BroadcastRepository {
  constructor(private readonly client: typeof sanityClient) {}

  async getBroadcastsBySportSlug(sportSlug: string): Promise<Broadcast[]> {
    const broadcasts = await sanityClient.fetch<Broadcast[]>(
      `*[_type == "broadcast" && series.sport.slug == $sportSlug]`,
      { sportSlug },
    );

    return broadcasts;
  }

  async getBroadcastsBySeriesSlug(seriesSlug: string): Promise<Broadcast[]> {
    const broadcasts = await sanityClient.fetch<Broadcast[]>(
      `*[_type == "broadcast" && series->slug.current == $seriesSlug && dateTime > now()]
      {
        "id": _id,
        "title": title,
        "slug": slug.current,
        "description": description,
        "series": series->,
        "dateTime": dateTime,
        "venue": venue->,
      } | order(dateTime asc) [0...4]`,
      { seriesSlug },
    );

    return broadcasts;
  }
}

class BroadcastService {
  constructor(private readonly repository: BroadcastRepository) {}

  async getBroadcastsBySportSlug(sportSlug: string): Promise<Broadcast[]> {
    return this.repository.getBroadcastsBySportSlug(sportSlug);
  }

  async getBroadcastsBySeriesSlug(seriesSlug: string): Promise<Broadcast[]> {
    return this.repository.getBroadcastsBySeriesSlug(seriesSlug);
  }
}

const broadcastRepository = new SanityBroadcastRepository(sanityClient);
export const broadcastService = new BroadcastService(broadcastRepository);
