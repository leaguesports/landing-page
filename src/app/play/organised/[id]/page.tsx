import { OrganisedGameDetail } from "@/components/play/OrganisedGameDetail";
import { getLoginPageHref } from "@/lib/auth-return-to";
import { getOrganisedGameResult } from "@/lib/organised-games/organised-games";
import { hubOrganisedGameHref } from "@/lib/sports/hub-ia";
import { getVenueBySlug } from "@/services/venues";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type OrganisedGamePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OrganisedGamePageProps): Promise<Metadata> {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const result = await getOrganisedGameResult(id, { cookie });
  if (!result.ok) {
    return {
      title: "Organised game",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: "Organised game | LeagueSports",
    description: "View RSVPs and start or join this organised game.",
    robots: { index: false, follow: false },
  };
}

export default async function OrganisedGamePage({
  params,
}: OrganisedGamePageProps) {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const result = await getOrganisedGameResult(id, { cookie });

  if (!result.ok && result.status === 401) {
    return (
      <main className="min-h-dvh bg-[#0c0f0c] text-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Organised game
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
            Sign in to view
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            This game is only visible to the host and invited players.
          </p>
          <Link
            href={getLoginPageHref(hubOrganisedGameHref(id))}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (!result.ok) {
    return (
      <main className="min-h-dvh bg-[#0c0f0c] text-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Organised game
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
            Game not found
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            This link may be invalid, or you were not invited.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Back to hub
          </Link>
        </div>
      </main>
    );
  }

  const venue = await getVenueBySlug(result.value.venueCmsId).catch(() => null);

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Hub
          </Link>
        </div>
      </div>
      <OrganisedGameDetail
        game={result.value}
        venueName={venue?.name ?? null}
        venueHref={venue?.slug ? `/venues/${venue.slug}` : null}
      />
    </main>
  );
}
