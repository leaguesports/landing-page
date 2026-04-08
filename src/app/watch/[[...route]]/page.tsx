import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getBaseUrl,
    getBroadcastSeries,
    getBroadcastSports,
    getLocationBySlug,
    getSportBySlug,
    getVenuesByLocationAndSport,
    getWatchLocationsBySportSlug,
} from "./watch-data";
import { resolveWatchRoute } from "./watch-types";
import { WatchBrowseSection } from "./_components/WatchBrowseSection";
import { WatchChoiceCard } from "./_components/WatchChoiceCard";
import { WatchFollowBanner } from "./_components/WatchFollowBanner";
import { WatchHero } from "./_components/WatchHero";
import { WatchHub } from "./_components/WatchHub";
import { WatchNav } from "./_components/WatchNav";
import { WatchShell } from "./_components/WatchShell";
import { WatchVenuesSection } from "./_components/WatchVenuesSection";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ route: string[] }>;
}): Promise<Metadata> {
    const { route } = await params;
    const resolved = resolveWatchRoute(route);

    if (resolved.kind === "landing") {
        return {
            title: "Watch sports at a venue | LeagueSports",
            description: "Find bars and fan zones screening live sport near you.",
            robots: { index: true, follow: true },
        };
    }

    if (resolved.kind === "location") {
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

export default async function WatchPage(route: {
    params: Promise<{ route: string[] }>;
}) {
    const params = await route.params;
    const resolved = resolveWatchRoute(params?.route);

    if (resolved.kind === "landing") {
        const sports = await getBroadcastSports();
        const series = await getBroadcastSeries();

        return (
            <div>
                <WatchShell>
                    <WatchNav variant="hub" />
                    <WatchHub />
                    <WatchBrowseSection
                        eyebrow="Step one"
                        title="Choose a sport"
                        description="Open a sport to see suburbs and areas with screening venues."
                    >
                        {sports.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                                {sports.map((sport) => (
                                    <WatchChoiceCard
                                        key={sport.id}
                                        href={`/watch/${sport.slug}`}
                                        title={sport.name}
                                        subtitle="Browse watch venues"
                                        sportIconSlug={sport.slug}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyBrowseMessage message="No sports with watch listings yet. Check back soon." />
                        )}
                    </WatchBrowseSection>
                    <WatchBrowseSection
                        eyebrow="Motorsport & series"
                        title="Series & championships"
                        description="Follow a series to find venues showing those broadcasts."
                    >
                        {series.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                                {series.map((item) => (
                                    <WatchChoiceCard
                                        key={item.id}
                                        href={`/watch/${item.slug}`}
                                        title={item.name}
                                        subtitle="Browse by series"
                                        sportIconSlug={item.sportSlug ?? undefined}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyBrowseMessage message="No series listed yet." />
                        )}
                    </WatchBrowseSection>
                </WatchShell>
            </div>
        );
    }

    if (resolved.kind === "location") {
        const [locations, sport] = await Promise.all([
            getWatchLocationsBySportSlug(resolved.sportSlug),
            getSportBySlug(resolved.sportSlug),
        ]);
        const sportName = sport?.name ?? resolved.sportSlug;

        return (
            <div>
                <WatchShell>
                    <WatchNav variant="hub" sportName={sportName} />
                    <WatchHub
                        partialSportSlug={resolved.sportSlug}
                        sportDisplayName={sport?.name}
                    />
                    <WatchBrowseSection
                        eyebrow="Step two"
                        title="Choose an area"
                        description="Pick a suburb to see venues screening this sport."
                    >
                        {locations.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                                {locations.map((location) => (
                                    <WatchChoiceCard
                                        key={location.id}
                                        href={`/watch/${resolved.sportSlug}/${location.slug}`}
                                        title={location.title}
                                        subtitle={`Watch ${sportName}`}
                                        sportIconSlug={resolved.sportSlug}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyBrowseMessage
                                message={`No suburbs with watch venues for ${sportName} yet.`}
                                backHref="/watch"
                                backLabel="Back to sports"
                            />
                        )}
                    </WatchBrowseSection>
                </WatchShell>
            </div>
        );
    }

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
        <div>
            <WatchShell>
                <WatchNav variant="detail" sportName={sportName} />
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
            </WatchShell>
        </div>
    );
}

function EmptyBrowseMessage({
    message,
    backHref,
    backLabel,
}: {
    message: string;
    backHref?: string;
    backLabel?: string;
}) {
    return (
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/60 px-6 py-12 sm:py-14 text-center">
            <p className="text-zinc-500 font-bold text-sm uppercase tracking-wide max-w-md mx-auto">
                {message}
            </p>
            {backHref && backLabel ? (
                <Link
                    href={backHref}
                    className="inline-flex mt-6 text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors"
                >
                    {backLabel}
                </Link>
            ) : null}
        </div>
    );
}
