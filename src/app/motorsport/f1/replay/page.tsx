import { RaceReplayCatalog } from "@/components/f1-replay/RaceReplayCatalog";
import {
  defaultReplayCatalogYear,
  loadReplayCatalogSafe,
  replayCatalogYearOrDefault,
  replayCatalogYears,
} from "@/lib/openf1/replay-catalog";
import { getSiteBaseUrl } from "@/lib/site-url";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

type PageProps = {
  searchParams: Promise<{ year?: string | string[] }>;
};

function yearQuery(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const year = replayCatalogYearOrDefault(yearQuery(params.year));
  const title = `${year} F1 race replays`;
  const description = `Watch 3D GPS replays of ${year} Formula 1 Grands Prix. Completed races play back now; upcoming weekends open after lights out.`;
  const canonical = `/motorsport/f1/replay`;
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

export default async function F1ReplayLibraryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = replayCatalogYearOrDefault(yearQuery(params.year), now);
  const { races } = await loadReplayCatalogSafe(year);
  const years = replayCatalogYears(now);

  return (
    <div className="min-h-screen bg-[#0c0f0c] pb-16 text-white">
      <section className="border-b border-white/5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/motorsport/f1"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Formula 1
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
            3D race replay
          </p>
          <h1 className="font-display text-3xl tracking-wide text-white sm:text-5xl">
            {year} race library
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
            Pick a Grand Prix to rotate the circuit, follow a car, and scrub
            flags. Telemetry is loaded by our API. GPS coverage starts in 2023.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RaceReplayCatalog
          races={races}
          year={year}
          years={years}
          showYearNav
          yearHref={(item) =>
            item === defaultReplayCatalogYear()
              ? "/motorsport/f1/replay"
              : `/motorsport/f1/replay?year=${item}`
          }
          heading={`${year} Grands Prix`}
          description="Completed races are ready to watch. Upcoming rounds stay listed and open after the chequered flag."
          libraryHref={null}
        />
      </div>
    </div>
  );
}
