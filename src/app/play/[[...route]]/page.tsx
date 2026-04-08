import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
    getBaseUrl,
    getLocationBySlug,
    getSportBySlug,
    getVenuesByLocationAndSport,
} from "./data";
import { resolvePlayRoute } from "./types";
import { PlayShell } from "./_components/PlayShell";
import { PlayNav } from "./_components/PlayNav";
import { PlayHero } from "./_components/PlayHero";
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
            title: "Watch sports at a venue | LeagueSports",
            description: "Find bars and fan zones screening live sport near you.",
            robots: { index: true, follow: true },
        };
    }

    const { sportSlug, locationSlug } = resolved;
    const location = await getLocationBySlug(locationSlug);
    const sport = await getSportBySlug(sportSlug);

    if (!location) {
        return { title: "Location Not Found" };
    }

    const title = `Watch ${sport?.name ?? sportSlug} in ${location.title}`;
    const canonicalPath = `/watch/${sportSlug}/${locationSlug}`;
    const baseUrl = getBaseUrl();
    const canonicalUrl = `${baseUrl}${canonicalPath}`;

    return {
        title,
        description: `${location.title} | Watch | ${sport?.name ?? sportSlug}`,
        keywords: [
            "Watch",
            "Sports",
            "Venues",
            "Locations",
            "Sports Venues",
            "Sports Locations",
            "Sports Venues Locations",
            "Sports Venues Locations",
            "Sports Bars",
        ],
        openGraph: {
            title,
            description: `${location.title} | Watch | ${sport?.name ?? sportSlug}`,
            url: canonicalUrl,
            siteName: "LeagueSports",
            type: "website",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: `${location.title} | Watch | ${sport?.name ?? sportSlug}`,
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
                <PlayNav />
                <h1>Play Hub</h1>
            </PlayShell>
        );
    }

    {/* <PlayShell>
                    <WatchNav />
                    <WatchHub partialSportSlug={resolved.sportSlug} />
                </PlayShell> */}

    const { sportSlug, locationSlug } = resolved;
    const [location, sport, venues] = await Promise.all([
        getLocationBySlug(locationSlug),
        getSportBySlug(sportSlug),
        getVenuesByLocationAndSport(locationSlug, sportSlug),
    ]);

    if (!location) {
        notFound();
    }

    const sportName = sport?.name ?? sportSlug;
    const locationTitle = location.title;

    return (
        <PlayShell>
            <PlayNav sportName={sportName} />
            <PlayHero sportName={sportName} locationTitle={locationTitle} venueCount={venues.length} />
            <PlayVenueSection venues={venues} locationTitle={locationTitle} sportName={sportName} />
            {/* <WatchShell>
                <WatchNav sportName={sportName} />
                <WatchHero
                    sportName={sportName}
                    locationTitle={locationTitle}
                    venueCount={venues.length}
                />
                <WatchVenuesSection
                    venues={venues}
                    locationTitle={locationTitle}
                    sportName={sportName}
                />
                <WatchFollowBanner />
            </WatchShell> */}
        </PlayShell>
    );
}
