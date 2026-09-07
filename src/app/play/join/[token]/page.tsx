import { OrganisedGameJoin } from "@/components/play/OrganisedGameJoin";
import { getLoginPageHref } from "@/lib/auth-return-to";
import { previewOrganisedGameInviteResult } from "@/lib/organised-games/organised-games";
import { hubOrganisedGameJoinHref } from "@/lib/sports/hub-ia";
import { getVenueBySlug } from "@/services/venues";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type JoinGamePageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Join organised game | LeagueSports",
  description: "Join a padel or golf game from an invite link.",
  robots: { index: false, follow: false },
};

export default async function JoinOrganisedGamePage({
  params,
}: JoinGamePageProps) {
  const { token } = await params;
  const cookie = (await cookies()).toString();
  const result = await previewOrganisedGameInviteResult(token, { cookie });

  if (!result.ok && result.status === 401) {
    return (
      <main className="min-h-dvh bg-[#0c0f0c] text-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Join game
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
            Sign in to join
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            Invite links work for signed-in players. After you join you can RSVP
            on the game page.
          </p>
          <Link
            href={getLoginPageHref(hubOrganisedGameJoinHref(token))}
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
            Join game
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
            Invite not found
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            This share link is invalid or the game was cancelled.
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
      <OrganisedGameJoin
        token={token}
        game={result.value}
        venueName={venue?.name ?? null}
      />
    </main>
  );
}
