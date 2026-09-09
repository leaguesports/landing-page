import { OrganiseHub } from "@/components/play/OrganiseHub";
import { listProposals } from "@/lib/lobby/lobby";
import { getServerAuthState } from "@/lib/server-auth";
import { SPORT_CATALOG } from "@/lib/sports/catalog";
import {
  HUB_ORGANISE_HUB_SUBTITLE,
  pendingLobbyProposalCount,
  type HubOrganiseBadgeCounts,
} from "@/lib/sports/hub-ia";
import { listMyTeamMatches } from "@/lib/team-matches/team-matches";
import {
  listMyTournaments,
  partitionMineLists,
} from "@/lib/tournaments/tournaments";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Organise | LeagueSports",
  description: HUB_ORGANISE_HUB_SUBTITLE,
  robots: { index: false, follow: false },
};

export default async function OrganiseHubPage() {
  const cookie = (await cookies()).toString();
  const [proposals, teamMatches, tournaments, auth] = await Promise.all([
    listProposals({ cookie }),
    listMyTeamMatches({ cookie }),
    listMyTournaments({ cookie }),
    getServerAuthState(),
  ]);

  const liveTournaments = partitionMineLists(tournaments);
  const badges: HubOrganiseBadgeCounts = {
    lobby: proposals.ok
      ? pendingLobbyProposalCount(proposals.value.proposals)
      : 0,
    teamMatches: teamMatches.upcoming.length,
    tournaments: liveTournaments.organizing.length + liveTournaments.entered.length,
  };

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href={auth.isAuthenticated ? "/" : "/play"}
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Play
          </Link>
          {auth.isAuthenticated ? (
            <Link
              href="/"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Hub
            </Link>
          ) : null}
        </div>
      </div>
      <OrganiseHub sports={SPORT_CATALOG} badges={badges} />
    </main>
  );
}
