import { VENUE_LIST } from "@/data/venues";
import { isVenueForIntent } from "@/data/venues";
import { SUBURB_COORDINATES, DEFAULT_MAP_CENTER } from "@/data/coordinates";
import type { Intent } from "@/app/discover/types";
import type { DiscoverVenue, DiscoverEvent } from "@/app/discover/types";

/** Static upcoming events for discover (Watch intent). */
export const DISCOVER_EVENTS: Array<{
  id: string;
  title: string;
  series: string;
  sport: string;
  date: string;
  time: string;
  venue: string;
  suburb: string;
  href: string;
  round?: string;
  image: string;
}> = [
  {
    id: "evt-1",
    title: "Monaco Grand Prix",
    series: "Formula 1",
    sport: "Formula 1",
    date: "25 May 2025",
    time: "15:00",
    venue: "Ridgeway Racebar",
    suburb: "edenvale",
    href: "/events",
    round: "R08",
    image:
      "https://images.sportschau.de/image/2d5995ba-55ad-4b31-8df7-b20be7fb5a17/AAABmIT5oOs/AAABmyZE3MM/1x1-1400/norris-piastri-108.jpg",
  },
  {
    id: "evt-2",
    title: "Lions vs Bulls",
    series: "Super Rugby",
    sport: "Rugby",
    date: "1 Jun 2025",
    time: "17:00",
    venue: "Hogshead Illovo",
    suburb: "illovo",
    href: "/events",
    image:
      "https://images.unsplash.com/photo-1574602904329-56e2f95fb15e?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: "evt-3",
    title: "Manchester United vs Liverpool",
    series: "Premier League",
    sport: "Soccer",
    date: "8 Jun 2025",
    time: "19:30",
    venue: "The Wanders Club",
    suburb: "illovo",
    href: "/events",
    image:
      "https://images.unsplash.com/flagged/photo-1550413231-202a9d53a331?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: "evt-4",
    title: "Canadian Grand Prix",
    series: "Formula 1",
    sport: "Formula 1",
    date: "15 Jun 2025",
    time: "20:00",
    venue: "Benchwarmers Sports Bar",
    suburb: "rosebank",
    href: "/events",
    round: "R09",
    image:
      "https://img.redbull.com/images/c_crop,w_3840,h_1920,x_0,y_194/c_auto,w_1200,h_630/f_auto,q_auto/redbullcom/2025/6/1/ukxsn3eamlsz9ji2okdt/extreme-f1-tracks-zandvoort",
  },
];

function getCoords(suburb: string): [number, number] {
  const slug = suburb.toLowerCase().replace(/\s+/g, "-");
  return SUBURB_COORDINATES[slug] ?? DEFAULT_MAP_CENTER;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Build discover venues for a given intent and optional user location. */
export function getDiscoverVenues(
  intent: Intent,
  userLat?: number,
  userLng?: number,
  sportSlugs?: string[],
  areaQuery?: string
): DiscoverVenue[] {
  const out: DiscoverVenue[] = [];

  for (const v of VENUE_LIST) {
    if (!isVenueForIntent(v, intent)) continue;

    if (areaQuery && areaQuery.trim()) {
      const q = areaQuery.trim().toLowerCase();
      const match =
        v.suburb.toLowerCase().includes(q) ||
        v.area.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q);
      if (!match) continue;
    }

    const activities = intent === "watch" ? v.watch : v.play;
    const sports = activities?.map((a) => a.name) ?? [];

    if (sportSlugs && sportSlugs.length > 0 && activities) {
      const venueSlugs = activities.map((a) => a.slug);
      const hasMatch = sportSlugs.some((slug) => venueSlugs.includes(slug));
      if (!hasMatch) continue;
    }

    const [lat, lng] = getCoords(v.suburb);
    let distanceKm: number | undefined;
    if (userLat != null && userLng != null) {
      distanceKm = haversineKm(userLat, userLng, lat, lng);
    }

    out.push({
      kind: "venue",
      id: v.id,
      slug: v.slug,
      name: v.name,
      image: v.image,
      area: v.area,
      suburb: v.suburb,
      intent,
      sports,
      lat,
      lng,
      distanceKm,
    });
  }

  if (userLat != null && userLng != null) {
    out.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }
  return out;
}

/** Build discover events (Watch only), optionally filtered by sport and location. */
export function getDiscoverEvents(
  sportSlugs?: string[],
  areaQuery?: string,
  userLat?: number,
  userLng?: number
): DiscoverEvent[] {
  let out: DiscoverEvent[] = DISCOVER_EVENTS.map((e) => {
    const [lat, lng] = getCoords(e.suburb);
    let distanceKm: number | undefined;
    if (userLat != null && userLng != null) {
      distanceKm = haversineKm(userLat, userLng, lat, lng);
    }
    return {
      kind: "event",
      id: e.id,
      title: e.title,
      sport: e.sport,
      date: e.date,
      time: e.time,
      venueName: e.venue,
      suburb: e.suburb,
      image: e.image,
      href: e.href,
      lat,
      lng,
      distanceKm,
    };
  });

  if (sportSlugs && sportSlugs.length > 0) {
    const sportToSlug: Record<string, string> = {
      "Formula 1": "f1",
      Rugby: "rugby",
      Soccer: "soccer",
      Cricket: "cricket",
      Golf: "golf",
      Padel: "padel",
      MotoGP: "motogp",
    };
    const getSlug = (s: string) => sportToSlug[s] ?? s.toLowerCase().replace(/\s+/g, "-");
    out = out.filter((e) =>
      sportSlugs.some((slug) => getSlug(e.sport) === slug)
    );
  }

  if (areaQuery && areaQuery.trim()) {
    const q = areaQuery.trim().toLowerCase();
    out = out.filter(
      (e) =>
        e.suburb.toLowerCase().includes(q) ||
        e.venueName.toLowerCase().includes(q)
    );
  }

  if (userLat != null && userLng != null) {
    out.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }
  return out;
}
