import { TournamentDetail } from "@/components/tournaments/TournamentDetail";
import { listTeams } from "@/lib/teams/teams";
import {
  TOURNAMENTS_HREF,
  getTournament,
} from "@/lib/tournaments/tournaments";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type TournamentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TournamentPageProps): Promise<Metadata> {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const tournament = await getTournament(id, { cookie });
  if (!tournament) {
    return { title: "Tournament" };
  }
  return {
    title: tournament.name,
    robots: { index: false, follow: false },
  };
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const [tournament, teams] = await Promise.all([
    getTournament(id, { cookie }),
    listTeams({ cookie }),
  ]);

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Tournaments
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
            Tournament not found
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            This event may still be a private draft, or you need to be the
            organizer or an entered team to view it.
          </p>
          <Link
            href={TOURNAMENTS_HREF}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Back to tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href={TOURNAMENTS_HREF}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Tournaments
        </Link>
        <div className="mt-6">
          <TournamentDetail tournament={tournament} teams={teams.teams} />
        </div>
      </div>
    </div>
  );
}
