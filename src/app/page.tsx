import { HomeDashboard } from "@/components/home/HomeDashboard";
import { HomeDiscovery } from "@/components/home/HomeDiscovery";
import { HomeUpcomingEvents } from "@/components/home/HomeUpcomingEvents";
import { formatStat } from "@/lib/format-stat";
import { getServerAuthState } from "@/lib/server-auth";
import { safeSanityImageUrl } from "@/lib/sanity-image";
import { selectFeaturedFixture } from "@/lib/sports/events-feed";
import { getUpcomingFixtures } from "@/services/events";
import { getHomepageStats } from "@/services/homepageStats";
import { ArrowUpRight } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getTopGuides, Guide } from "./guides/[[...route]]/actions";

function GuideCard({ guide }: { guide: Guide }) {
  const imageUrl = safeSanityImageUrl(guide.mainImage);

  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group block overflow-hidden rounded-3xl border border-white/8 bg-[#141814] transition-colors hover:border-white/16"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={guide.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <div className="h-full w-full bg-zinc-800" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#141814] via-transparent to-transparent" />
      </div>

      <div className="px-4 py-4 sm:px-5">
        <h3 className="text-[15px] font-medium leading-snug text-white group-hover:text-[var(--color-brand)]">
          {guide.title}
        </h3>
      </div>
    </Link>
  );
}

async function MarketingHome() {
  const [topGuides, stats, upcomingFixtures] = await Promise.all([
    getTopGuides(),
    getHomepageStats(),
    getUpcomingFixtures({ limit: 24 }),
  ]);

  const featuredFixture = selectFeaturedFixture(upcomingFixtures);
  const upcomingList = featuredFixture
    ? upcomingFixtures
        .filter((item) => item.slug !== featuredFixture.slug)
        .slice(0, 5)
    : upcomingFixtures.slice(0, 5);

  const homepageStats = [
    { value: formatStat(stats.watchVenues), label: "Watch venues", tone: "text-sky-400" },
    { value: formatStat(stats.playVenues), label: "Play venues", tone: "text-emerald-400" },
    { value: formatStat(stats.events), label: "Events", tone: "text-white" },
    { value: formatStat(stats.guides), label: "Guides", tone: "text-zinc-300" },
  ];

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <HomeDiscovery />

      <section className="border-t border-white/5 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {homepageStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/8 bg-[#141814] px-4 py-6 text-center sm:px-5 sm:py-8"
              >
                <p
                  className={`font-display text-4xl tracking-wide sm:text-5xl ${stat.tone}`}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeUpcomingEvents fixtures={upcomingList} featured={featuredFixture} />

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                Editorial
              </p>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                Top guides
              </h2>
              <p className="mt-3 text-sm text-zinc-400 sm:text-base">
                Local tips for fans and players.
              </p>
            </div>
            <Link
              href="/guides"
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
            {topGuides.map((guide) => (
              <GuideCard key={guide._id} guide={guide} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/5 bg-[#101410] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[var(--color-brand)]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                LeagueSports
              </p>
              <h2 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
                Find your game
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-400">
                Browse Watch and Play directories for venues in your area.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/venues"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              >
                Find a venue
              </Link>
              <Link
                href="/padel/new"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
              >
                Play now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default async function Home() {
  const auth = await getServerAuthState();

  if (auth.isAuthenticated && auth.user?.id) {
    const cookie = (await cookies()).toString();
    return <HomeDashboard user={auth.user} cookie={cookie} />;
  }

  return <MarketingHome />;
}
