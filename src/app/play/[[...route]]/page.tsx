import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBaseUrl,
  getLocationBySlug,
  getSportBySlug,
  getVenuesByLocationAndSportWithFallback,
} from "./data";
import { resolvePlayRoute } from "./types";
import { PlayShell } from "./_components/PlayShell";
import { PlayNav } from "./_components/PlayNav";
import { PlayHero } from "./_components/PlayHero";
import { PlayHub } from "./_components/PlayHub";
import { PlayVenueSection } from "./_components/PlayVenueSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ route: string[] }>;
}): Promise<Metadata> {
  const { route } = await params;
  const resolved = resolvePlayRoute(route);

  if (resolved.kind === "hub") {
    return {
      title: "Play sports near you | LeagueSports",
      description: "Find courts, clubs, and places to play near you.",
      robots: { index: true, follow: true },
    };
  }

  const { sportSlug, locationSlug } = resolved;
  const location = await getLocationBySlug(locationSlug);
  const sport = await getSportBySlug(sportSlug);

  if (!location) {
    return { title: "Location Not Found" };
  }

  const title = `Play ${sport?.name ?? sportSlug} in ${location.title}`;
  const canonicalPath = `/play/${sportSlug}/${locationSlug}`;
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  return {
    title,
    description: `${location.title} | Play | ${sport?.name ?? sportSlug}`,
    keywords: ["Play", "Sports", "Venues", "Courts", "Clubs"],
    openGraph: {
      title,
      description: `${location.title} | Play | ${sport?.name ?? sportSlug}`,
      url: canonicalUrl,
      siteName: "LeagueSports",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `${location.title} | Play | ${sport?.name ?? sportSlug}`,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PlayPage(route: {
  params: Promise<{ route: string[] }>;
}) {
  const params = await route.params;
  const resolved = resolvePlayRoute(params?.route);

  if (resolved.kind === "hub") {
    return (
      <PlayShell>
        <PlayNav sportName={resolved.sportSlug?.replace(/-/g, " ")} />
        <PlayHub partialSportSlug={resolved.sportSlug} />
      </PlayShell>
    );
  }

  const { sportSlug, locationSlug } = resolved;
  const [location, sport] = await Promise.all([
    getLocationBySlug(locationSlug),
    getSportBySlug(sportSlug),
  ]);

  if (!location) {
    notFound();
  }

  const venueResults = await getVenuesByLocationAndSportWithFallback(
    locationSlug,
    sportSlug,
    location,
  );

  const sportName = sport?.name ?? sportSlug;
  const locationTitle = location.title;
  const venues = venueResults.venues;

  return (
    <PlayShell>
      <PlayNav sportName={sportName} />
      <PlayHero
        sportName={sportName}
        locationTitle={locationTitle}
        venueCount={venues.length}
      />
      <PlayVenueSection
        venues={venues}
        locationTitle={locationTitle}
        sportName={sportName}
        usedCityFallback={venueResults.usedCityFallback}
        suburbTitle={venueResults.suburbTitle}
        cityTitle={venueResults.cityTitle}
      />
    </PlayShell>
  );
}
