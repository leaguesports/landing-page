import { CountdownTimer } from "@/components/CountdownTimer";
import { DriverCard } from "@/components/DriverCard";
import { FeaturedEventCard } from "@/components/FeaturedEventCard";
import { RaceCard } from "@/components/RaceCard";
import { SportVenueCard } from "@/components/SportVenueCard";
import { TeamCard } from "@/components/TeamCard";
import { ChevronRight, Flag, MapPin, Sparkles, Tv } from "lucide-react";
import Link from "next/link";

const FEATURED_RACE = {
    slug: "australian-grand-prix",
    image: "https://images6.alphacoders.com/112/1120089.jpg",
    title: "FORMULA 1 QATAR AIRWAYS AUSTRALIAN GRAND PRIX 2026",
    date: "2026-03-15",
    dateLabel: "15 March 2026",
    location: "Melbourne, Australia",
    description: "The 2026 season opener at Albert Park. Twenty drivers, one champion—find where to watch live.",
};

const UPCOMING_RACES: Array<{
    slug: string;
    title: string;
    round: string;
    date: string;
    location?: string;
    image: string;
    badge?: string;
}> = [
        { slug: "australian-grand-prix", title: "Australian Grand Prix", round: "Round 1", date: "15 Mar 2026", location: "Melbourne", image: "https://www.autohebdo.fr/app/uploads/2022/03/DPPI_00119001_942.jpg", badge: "Season opener" },
        { slug: "chinese-grand-prix", title: "Chinese Grand Prix", round: "Round 2", date: "22 Mar 2026", location: "Shanghai", image: "https://www.formula1.com/fom-website/2025/China/GettyImages-2147970664.jpg" },
        { slug: "japanese-grand-prix", title: "Japanese Grand Prix", round: "Round 3", date: "5 Apr 2026", location: "Suzuka", image: "https://www.autohebdo.fr/app/uploads/2023/09/DPPI_00123037_387.jpg" },
        { slug: "bahrain-grand-prix", title: "Bahrain Grand Prix", round: "Round 4", date: "12 Apr 2026", location: "Sakhir", image: "https://www.timeoutbahrain.com/cloud/timeoutbahrain/2024/09/17/409000265_18414303553033106_7265928152314773389_n.jpg" },
    ];

const TEAMS = [
    { href: "/sports/f1/teams/red-bull", name: "Red Bull Racing", accent: "blue" as const, subtitle: "Oracle Red Bull Racing" },
    { href: "/sports/f1/teams/ferrari", name: "Ferrari", accent: "red" as const, subtitle: "Scuderia Ferrari" },
    { href: "/sports/f1/teams/mercedes", name: "Mercedes", accent: "silver" as const, subtitle: "Mercedes-AMG F1" },
    { href: "/sports/f1/teams/mclaren", name: "McLaren", accent: "orange" as const, subtitle: "McLaren F1 Team" },
    { href: "/sports/f1/teams/aston-martin", name: "Aston Martin", accent: "green" as const, subtitle: "Aston Martin Aramco" },
    { href: "/sports/f1/teams/alpine", name: "Alpine", accent: "pink" as const, subtitle: "Alpine F1 Team" },
];

const DRIVERS: Array<{ href: string; number: number; name: string; team: string }> = [
    { href: "/sports/f1/drivers/verstappen", number: 1, name: "Max Verstappen", team: "Red Bull Racing" },
    { href: "/sports/f1/drivers/piastri", number: 81, name: "Oscar Piastri", team: "McLaren" },
    { href: "/sports/f1/drivers/norris", number: 4, name: "Lando Norris", team: "McLaren" },
    { href: "/sports/f1/drivers/leclerc", number: 16, name: "Charles Leclerc", team: "Ferrari" },
    { href: "/sports/f1/drivers/hamilton", number: 44, name: "Lewis Hamilton", team: "Ferrari" },
    { href: "/sports/f1/drivers/russell", number: 63, name: "George Russell", team: "Mercedes" },
];

const VENUES = [
    { href: "/venues", name: "Benchwarmers Sports Bar", image: "/assets/benchwarmers.webp", type: "Sports bar", area: "Illovo, Johannesburg", showing: "Showing F1" },
    { href: "/venues", name: "Hogshead Illovo", image: "/assets/hogshead.webp", type: "Pub & grill", area: "Illovo, Johannesburg", showing: "Live every race weekend" },
    { href: "/venues", name: "Ridgeway Racebar", image: "/assets/ridgeway-racebar.webp", type: "Race-focused bar", area: "Ridgeway, Johannesburg", showing: "F1 + motorsport" },
] as const;

export default async function F1Page() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0f0f0f]">
            {/* Background: color blurs (F1 theme) */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/4 top-1/4 h-112 w-112 rounded-full bg-red-500/15 blur-3xl" />
                <div className="absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="absolute left-1/2 top-2/3 h-80 w-80 -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl" />
                <div className="absolute right-1/3 top-1/2 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
            </div>
            {/* Grid overlay */}
            <div
                className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[4rem_4rem]"
                aria-hidden
            />

            <Link href={`/sports/f1/races/${FEATURED_RACE.slug}`} className="block mb-8">
                <FeaturedEventCard
                    image={FEATURED_RACE.image}
                    title={FEATURED_RACE.title}
                    sport="F1™"
                    date={FEATURED_RACE.dateLabel}
                    location={FEATURED_RACE.location}
                    description={FEATURED_RACE.description}
                />
            </Link>

            {/* Hero + intro in one breath */}
            <section className="px-4 pt-12 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 flex flex-col items-center gap-4">
                        <p className="text-center text-sm font-medium text-white/60 uppercase tracking-wider">
                            Time until lights out
                        </p>
                        <CountdownTimer
                            targetDate={`${FEATURED_RACE.date}T05:00:00.000Z`}
                            completedLabel="Race day!"
                        />
                    </div>
                    <p className="mx-auto max-w-2xl text-center text-white/80 text-lg leading-relaxed">
                        Find race schedules and session times, then pick a venue to watch with other fans. Times are in your local time; for big races, book a table in advance.
                    </p>
                </div>
            </section>

            {/* 2026 season: format + stats in one block */}
            <section className="border-y border-white/10 bg-white/5 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="mb-10 text-center text-sm text-white/60">
                        2026 season · 24 races · New power unit era. Typical weekend: practice Friday, qualifying Saturday, race Sunday.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-r from-red-600/20 to-rose-700/20">
                                <Flag className="h-5 w-5 text-red-400" strokeWidth={2} />
                            </div>
                            <span className="text-white/90 font-medium">24 races</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                                <Sparkles className="h-5 w-5 text-amber-400" strokeWidth={2} />
                            </div>
                            <span className="text-white/90 font-medium">New regs</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                                <Tv className="h-5 w-5 text-white/80" strokeWidth={2} />
                            </div>
                            <span className="text-white/90 font-medium">Watch at venues</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming races — main content */}
            <section className="py-16 lg:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
                        <h2 className="font-bold text-xl sm:text-2xl tracking-tight text-white">Upcoming races</h2>
                        <Link
                            href="/sports/f1/races"
                            className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-400 transition-colors font-semibold text-sm"
                        >
                            View all races
                            <ChevronRight className="h-4 w-4" strokeWidth={2} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {UPCOMING_RACES.map((race) => (
                            <RaceCard
                                key={race.slug}
                                href={`/sports/f1/races/${race.slug}`}
                                image={race.image}
                                title={race.title}
                                round={race.round}
                                date={race.date}
                                location={race.location}
                                badge={race.badge}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Teams */}
            <section className="py-16 lg:py-20 border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="font-bold text-xl sm:text-2xl tracking-tight text-white mb-10">Teams</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {TEAMS.map((team) => (
                            <TeamCard
                                key={team.name}
                                href={team.href}
                                name={team.name}
                                accent={team.accent}
                                subtitle={team.subtitle}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Drivers */}
            <section className="py-16 lg:py-20 border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="font-bold text-xl sm:text-2xl tracking-tight text-white mb-10">Drivers</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {DRIVERS.map((driver) => (
                            <DriverCard
                                key={driver.href}
                                href={driver.href}
                                number={driver.number}
                                name={driver.name}
                                team={driver.team}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Where to watch */}
            <section className="py-16 lg:py-20 border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="font-bold text-xl sm:text-2xl tracking-tight text-white mb-10">Where to watch</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {VENUES.map((venue) => (
                            <SportVenueCard
                                key={venue.name}
                                href={venue.href}
                                image={venue.image}
                                name={venue.name}
                                type={venue.type}
                                area={venue.area}
                                showing={venue.showing}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA strip */}
            <section className="border-t border-white/10 bg-white/5 py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-white/70 text-sm sm:text-base mb-8">
                        Pick a race, choose a venue, and watch with other fans.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/sports/f1/races"
                            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-red-600 to-rose-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/25 transition hover:opacity-95"
                        >
                            View race calendar
                            <ChevronRight className="h-4 w-4" strokeWidth={2} />
                        </Link>
                        <Link
                            href="/venues"
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
                        >
                            Find venues
                            <MapPin className="h-4 w-4" strokeWidth={2} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}