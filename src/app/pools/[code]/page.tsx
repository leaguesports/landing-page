import { PoolJoinCard } from "@/components/pools/PoolJoinCard";
import { getPool, getPoolStandings } from "@/lib/pools/pools";
import { getFixtureBySlug } from "@/services/events";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type PoolPageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({
  params,
}: PoolPageProps): Promise<Metadata> {
  const { code } = await params;
  const cookie = (await cookies()).toString();
  const pool = await getPool(code, { cookie });
  if (!pool) {
    return {
      title: "Prediction pool",
      description: "Join a friends tip pool on LeagueSports.",
    };
  }
  const fixture = await getFixtureBySlug(pool.fixtureSlug);
  const title = pool.title?.trim() || fixture?.title || "Prediction pool";
  return {
    title,
    description: `Join the ${title} tip pool on LeagueSports. Friends only — no money.`,
  };
}

export default async function PredictionPoolPage({ params }: PoolPageProps) {
  const { code } = await params;
  const cookie = (await cookies()).toString();
  const pool = await getPool(code, { cookie });

  if (!pool) {
    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Prediction pools
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
            Pool not found
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            This invite may have expired, or prediction pools haven’t been
            migrated on this environment yet. Create a pool from a fixture page
            once the API is live.
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-sky-400 hover:text-white"
          >
            Browse fixtures
          </Link>
        </div>
      </div>
    );
  }

  const [fixture, standings] = await Promise.all([
    getFixtureBySlug(pool.fixtureSlug),
    getPoolStandings(pool.inviteCode, { cookie }),
  ]);
  const fixtureTitle = fixture?.title ?? pool.title ?? "Fixture tips";

  return (
    <PoolJoinCard
      pool={pool}
      fixtureTitle={fixtureTitle}
      standings={standings?.standings ?? []}
    />
  );
}
