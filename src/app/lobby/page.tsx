import { LobbyClient } from "@/components/lobby/LobbyClient";
import { emptyLobbySnapshot, listLobby, normalizeLobbyCity, normalizeLobbySport } from "@/lib/lobby/lobby";
import { isPadelVenue, toVenueOption, type VenueOption } from "@/lib/padel/venue-options";
import { isGolfVenue, toGolfVenueOption } from "@/lib/golf/venue-options";
import { isDartsVenue, toDartsVenueOption } from "@/lib/darts/venue-options";
import { getServerAuthState } from "@/lib/server-auth";
import { searchVenues } from "@/services/venues";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lobby | Find players | LeagueSports",
  description:
    "Looking for a game or looking for players. Set Looking, post an open game, and convert into Organise when the lobby fills.",
};

type LobbySearch = {
  sport?: string | string[];
  city?: string | string[];
  intent?: string | string[];
  proposal?: string | string[];
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function LobbyPage({
  searchParams,
}: {
  searchParams: Promise<LobbySearch>;
}) {
  const params = await searchParams;
  const sport = normalizeLobbySport(first(params.sport));
  const city = normalizeLobbyCity(first(params.city));
  const intentRaw = first(params.intent);
  const intent = intentRaw === "looking" || intentRaw === "open" ? intentRaw : null;
  const proposal = first(params.proposal).trim();
  const cookie = (await cookies()).toString();

  const [list, padelVenues, golfVenues, dartsVenues, auth] = await Promise.all([
    listLobby(
      { sport: sport || undefined, city: city || undefined },
      { cookie },
    ),
    searchVenues({ intent: "play", sportSlug: "padel" })
      .then((venues) => venues.map(toVenueOption).filter(isPadelVenue))
      .catch(() => [] as VenueOption[]),
    searchVenues({ intent: "play", sportSlug: "golf" })
      .then((venues) =>
        venues.map(toGolfVenueOption).filter((venue) => isGolfVenue(venue)),
      )
      .catch(() => [] as VenueOption[]),
    searchVenues({ intent: "play", sportSlug: "darts" })
      .then((venues) =>
        venues.map(toDartsVenueOption).filter((venue) => isDartsVenue(venue)),
      )
      .catch(() => [] as VenueOption[]),
    getServerAuthState(),
  ]);

  const venues = dedupeVenues([...padelVenues, ...golfVenues, ...dartsVenues]);
  const snapshot = list.ok ? list.value : emptyLobbySnapshot();

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
      <LobbyClient
        initial={snapshot}
        venues={venues}
        initialSport={sport}
        initialCity={city}
        initialIntent={intent}
        initialProposalId={proposal}
        nowIso={new Date().toISOString()}
      />
    </main>
  );
}

function dedupeVenues(venues: VenueOption[]): VenueOption[] {
  const seen = new Set<string>();
  const out: VenueOption[] = [];
  for (const venue of venues) {
    if (seen.has(venue.id)) continue;
    seen.add(venue.id);
    out.push(venue);
  }
  return out;
}
