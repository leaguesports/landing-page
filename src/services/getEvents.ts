import { sanityClient } from "@/sanity/client";
import { SanityImageSource } from "@sanity/image-url";

export type Event = {
  id: string;
  title: string;
  description: string;
  slug: string;
  tournament: {
    id: string;
    name: string;
    slug: string;
  };
  teams: {
    home: string;
    away: string;
  };
  venue: {
    id: string;
    name: string;
    slug: string;
    image: SanityImageSource | undefined;
  };
  dateTime: string;
  image: SanityImageSource | undefined;
};

export async function getEvents() {
  const events = await sanityClient.fetch<Event[]>(`
        *[_type == "event"] {
        "id": _id,
        "title": title,
        "description": description,
        "slug": slug.current,
        "image": image,
        "tournament": {
            "id": tournament->_id,
            "name": tournament->name,
            "slug": tournament->slug.current,
        },
        "teams": {
            "home": teams.homeTeam->name,
            "away": teams.awayTeam->name
        },
        "venue": venue->,
        "dateTime": dateTime
        }
    `);

  return events;
}

export async function getEventBySlug(slug: string) {
  const event = await sanityClient.fetch<Event | null>(
    `
    *[_type == "event" && slug.current == $slug][0] {
        "id": _id,
        "title": title,
        "description": description,
        "slug": slug.current,
        "image": image,
        "tournament": {
            "id": tournament->_id,
            "name": tournament->name,
            "slug": tournament->slug.current,
        },
        "teams": {
            "home": teams.homeTeam->name,
            "away": teams.awayTeam->name
        },
        "venue": venue->,
        "dateTime": dateTime
    }
  `,
    { slug },
  );

  return event;
}
