import { RaceReplay } from "@/components/f1-replay/RaceReplay";
import {
  getOpenF1WeekendByEventSlug,
  getOpenF1WeekendForFixture,
  isOpenF1EnrichableFixture,
  isOpenF1EventSlug,
} from "@/lib/openf1/openf1";
import { replayConfigFromWeekend } from "@/lib/openf1/replay";
import { getSiteBaseUrl } from "@/lib/site-url";
import { getFixtureBySlug } from "@/services/events";
import { ArrowLeft } from "lucide-react";
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
  const weekend = isOpenF1EventSlug(slug)
    ? await getOpenF1WeekendByEventSlug(slug)
    : fixture && isOpenF1EnrichableFixture(fixture)
      ? await getOpenF1WeekendForFixture(fixture)
      : null;
  const titleBase = weekend?.meeting.meetingName ?? fixture?.title ?? "F1";
  const title = `${titleBase} race replay`;
  const description = `Watch a 3D replay of ${titleBase} with live order, flags, and GPS car positions.`;
  const canonical = `/events/${slug}/replay`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${getSiteBaseUrl()}${canonical}`,
      type: "website",
      locale: "en_ZA",
    },
  };
}

export default async function EventReplayPage({ params }: PageProps) {
  const { slug } = await params;
  const fixture = await getFixtureBySlug(slug);
  const weekendPrefetch = isOpenF1EventSlug(slug)
    ? await getOpenF1WeekendByEventSlug(slug)
    : null;
  const weekend =
    weekendPrefetch ??
    (fixture && isOpenF1EnrichableFixture(fixture)
      ? await getOpenF1WeekendForFixture(fixture)
      : null);
  const replay = weekend ? replayConfigFromWeekend(weekend) : null;
  const canResolveBySlug = isOpenF1EventSlug(slug);

  if (!replay && !canResolveBySlug) notFound();

  const backHref = fixture ? `/events/${fixture.slug}` : `/events/${slug}`;
  const heading =
    weekend?.meeting.meetingName ?? fixture?.title ?? "Race replay";

  return (
    <div className="min-h-screen bg-[#0c0f0c] pb-10 text-white">
      <section className="border-b border-white/5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to event
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
            3D race replay
          </p>
          <h1 className="font-display text-3xl tracking-wide text-white sm:text-5xl">
            {heading}
          </h1>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <RaceReplay
          sessionKey={replay?.sessionKey}
          eventSlug={canResolveBySlug ? slug : weekend?.meeting.eventSlug}
          variant="page"
        />
      </div>
    </div>
  );
}
