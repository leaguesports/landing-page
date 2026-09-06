import { FixtureFollowButton } from "@/components/events/FixtureFollowButton";
import { FixtureVenueList } from "@/components/events/FixtureList";
import { FixtureSocialFeed } from "@/components/events/FixtureSocialFeed";
import { ensureFixtureFeed } from "@/lib/fixtures/feed-store";
import { fixturePublicSlugs, formatFixtureWhen } from "@/lib/sports/events-feed";
import { getFixtureBySlug, getUpcomingFixtures } from "@/services/events";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fixture = await getFixtureBySlug(slug);
  if (!fixture) {
    return { title: "Fixture not found" };
  }
  const venueCount = fixture.venues.length;
  return {
    title: `${fixture.title} — live feed & where to watch`,
    description:
      venueCount > 0
        ? `Live updates for ${fixture.title} plus ${venueCount} venue${venueCount === 1 ? "" : "s"} screening nearby.`
        : `Live feed and watch options for ${fixture.title} on LeagueSports.`,
  };
}

export async function generateStaticParams() {
  const fixtures = await getUpcomingFixtures({ limit: 24 });
  const slugs = new Set<string>();
  for (const fixture of fixtures) {
    for (const slug of fixturePublicSlugs(fixture)) {
      slugs.add(slug);
    }
  }
  return [...slugs].map((slug) => ({ slug }));
}

export default async function EventFixturePage({ params }: PageProps) {
  const { slug } = await params;
  const fixture = await getFixtureBySlug(slug);
  if (!fixture) notFound();

  const when = formatFixtureWhen(fixture.startsAt);
  const sport = fixture.sportSlug?.replace(/-/g, " ") ?? null;
  const venueCount = fixture.venues.length;
  const watchHref = fixture.sportSlug
    ? `/watch/${encodeURIComponent(fixture.sportSlug)}`
    : "/watch";

  const feed = ensureFixtureFeed({
    slug: fixture.slug,
    title: fixture.title,
    sportSlug: fixture.sportSlug,
    venueCount,
  });

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="border-b border-white/5 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/events"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All events
          </Link>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            {sport ? (
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-400">
                {sport}
              </span>
            ) : null}
            {when ? (
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                {when}
              </span>
            ) : null}
          </div>

          <h1 className="font-display max-w-4xl text-4xl tracking-wide text-white sm:text-5xl lg:text-6xl">
            {fixture.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Follow the live feed for score updates, then pick a venue screening
            nearby — interest here helps surface where to watch.
          </p>

          <div className="mt-8 flex flex-wrap items-start gap-3">
            <FixtureFollowButton slug={fixture.slug} />
            <Link
              href="#live-feed"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
            >
              Open live feed
            </Link>
            {fixture.sportSlug ? (
              <Link
                href={watchHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              >
                Watch {sport}
              </Link>
            ) : null}
            {fixture.eventPageHref ? (
              <Link
                href={fixture.eventPageHref}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              >
                Event page
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section
        id="live-feed"
        className="scroll-mt-24 border-b border-white/5 px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
          <FixtureSocialFeed
            slug={fixture.slug}
            title={fixture.title}
            sportSlug={fixture.sportSlug}
            venueCount={venueCount}
            initial={feed}
            watchHref={
              venueCount > 0 ? `#where-to-watch` : watchHref
            }
          />

          <aside className="lg:pt-2">
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                Screenings
              </p>
              <h2
                id="where-to-watch"
                className="font-display scroll-mt-24 text-3xl tracking-wide text-white sm:text-4xl"
              >
                Where it&apos;s on
              </h2>
            </div>
            <FixtureVenueList fixture={fixture} />
          </aside>
        </div>
      </section>
    </div>
  );
}
