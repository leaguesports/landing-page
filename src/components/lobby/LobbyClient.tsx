"use client";

import { CoverageNotify } from "@/components/conversion/CoverageNotify";
import { PostActionShare } from "@/components/conversion/PostActionShare";
import { VenuePicker } from "@/components/padel/VenuePicker";
import { useAuth } from "@/hooks/useAuth";
import { track } from "@/lib/analytics/track";
import {
  acceptProposal,
  applyLobbyFilters,
  buildLobbyWhatsAppShare,
  canOrganiseLobbySport,
  clearLooking,
  conversionBlockedCtas,
  createOpenGame,
  defaultSlotsNeeded,
  formatLookingTtl,
  hubLobbyHref,
  joinOpenGame,
  listLobby,
  listProposals,
  lobbyEmptyCopy,
  lobbyOrganiseHandoffHref,
  LOBBY_HREF,
  LOBBY_PARTY_SIZE_MAX,
  LOBBY_PARTY_SIZE_MIN,
  LOBBY_SKILLS,
  LOBBY_SPORTS,
  needNMoreCopy,
  passProposal,
  setLooking,
  slotsNeededRange,
  type CreateOpenGameInput,
  type LobbyListSnapshot,
  type LobbySkill,
  type LobbySport,
  type PublicLobbyOpenGame,
  type PublicOwnLooking,
  type PublicProposal,
  type SetLookingInput,
} from "@/lib/lobby/lobby";
import { datetimeLocalToIso, toDatetimeLocalValue } from "@/lib/padel/api-match";
import type { VenueOption } from "@/lib/padel/venue-options";
import { formatHubWhen } from "@/lib/sports/hub-feed";
import { CITY_DIRECTORY } from "@/data/cities";
import { Loader2, Minus, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Intent = "looking" | "open" | null;

type LobbyClientProps = {
  initial: LobbyListSnapshot;
  venues: VenueOption[];
  initialSport?: string;
  initialCity?: string;
  initialIntent?: Intent;
  initialProposalId?: string;
  nowIso: string;
};

function defaultWindowLocal(): { start: string; end: string } {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 2);
  return {
    start: toDatetimeLocalValue(start),
    end: toDatetimeLocalValue(end),
  };
}

function formatWindow(start: string, end: string, now: Date): string {
  const from = formatHubWhen(start, now) ?? "Time TBC";
  const to = new Date(end);
  if (Number.isNaN(to.getTime())) return from;
  const time = to.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${from} – ${time}`;
}

function sportLabel(sport: LobbySport): string {
  if (sport === "padel") return "Padel";
  if (sport === "golf") return "Golf";
  return "Darts";
}

function skillLabel(skill: LobbySkill): string {
  if (skill === "intermediate") return "Intermediate";
  if (skill === "competitive") return "Competitive";
  return "Casual";
}

function venuesForSport(venues: VenueOption[], sport: LobbySport): VenueOption[] {
  return venues.filter((venue) =>
    venue.sports.some((label) => label === sport),
  );
}

export function LobbyClient({
  initial,
  venues,
  initialSport = "",
  initialCity = "",
  initialIntent = null,
  initialProposalId = "",
  nowIso,
}: LobbyClientProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, promptSoftWall } = useAuth();
  const gatedDeepLink = useRef(false);
  const [snapshot, setSnapshot] = useState(initial);
  const [proposals, setProposals] = useState<PublicProposal[]>([]);
  const [sportFilter, setSportFilter] = useState(
    LOBBY_SPORTS.includes(initialSport as LobbySport)
      ? (initialSport as LobbySport | "")
      : "",
  );
  const [cityFilter, setCityFilter] = useState(initialCity);
  const [intent, setIntent] = useState<Intent>(initialIntent);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<ReturnType<
    typeof conversionBlockedCtas
  > | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [shownProposalIds, setShownProposalIds] = useState<Set<string>>(
    () => new Set(),
  );

  const now = useMemo(() => new Date(nowIso), [nowIso]);
  const filters = { sport: sportFilter || null, city: cityFilter || null };
  const filtered = useMemo(
    () => ({
      lookings: applyLobbyFilters(snapshot.lookings, filters),
      openGames: applyLobbyFilters(snapshot.openGames, filters),
    }),
    [snapshot, sportFilter, cityFilter],
  );

  const looking = snapshot.viewer.looking;
  const ttl = looking ? formatLookingTtl(looking.expiresAt, new Date()) : null;
  const empty =
    filtered.lookings.length === 0 && filtered.openGames.length === 0;
  const emptyCopy = lobbyEmptyCopy(filters);

  useEffect(() => {
    if (!isAuthenticated) return;
    void listProposals().then((result) => {
      if (result.ok) setProposals(result.value.proposals);
    });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!initialIntent || isLoading || gatedDeepLink.current) return;
    if (isAuthenticated) return;
    gatedDeepLink.current = true;
    setIntent(null);
    promptSoftWall({
      reason: "lobby",
      returnTo: hubLobbyHref({
        sport: sportFilter,
        city: cityFilter,
        intent: initialIntent,
      }),
      pageType: "lobby",
    });
  }, [
    initialIntent,
    isAuthenticated,
    isLoading,
    promptSoftWall,
    sportFilter,
    cityFilter,
  ]);

  useEffect(() => {
    const pending = proposals.filter((item) => item.status === "pending");
    if (pending.length === 0) return;
    const unseen = pending.filter((item) => !shownProposalIds.has(item.id));
    if (unseen.length === 0) return;
    for (const item of unseen) {
      track("lobby_propose_shown", {
        page_type: "lobby",
        sport: item.sport,
        city: item.city,
      });
    }
    setShownProposalIds((prev) => {
      const next = new Set(prev);
      for (const item of unseen) next.add(item.id);
      return next;
    });
  }, [proposals, shownProposalIds]);

  function requireAccount(nextIntent: Intent): boolean {
    if (isAuthenticated) return true;
    promptSoftWall({
      reason: "lobby",
      returnTo: hubLobbyHref({
        sport: sportFilter,
        city: cityFilter,
        intent: nextIntent,
      }),
      pageType: "lobby",
    });
    return false;
  }

  async function refreshList() {
    const result = await listLobby({
      sport: sportFilter || undefined,
      city: cityFilter || undefined,
    });
    if (result.ok) setSnapshot(result.value);
  }

  function landOrBlock(opts: {
    organiseGameId: string | null;
    conversionBlocked: string | null;
    sport: LobbySport;
    city: string;
  }) {
    const href = lobbyOrganiseHandoffHref(opts.organiseGameId);
    if (href) {
      router.push(href);
      return;
    }
    if (opts.conversionBlocked) {
      setBlocked(
        conversionBlockedCtas(opts.conversionBlocked, {
          sport: opts.sport,
          city: opts.city,
        }),
      );
    }
  }

  async function onJoin(game: PublicLobbyOpenGame) {
    if (!requireAccount(null)) return;
    setError(null);
    setBusy(`join-${game.id}`);
    const result = await joinOpenGame(game.id, { partySizeWithMe: 1 });
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    track("lobby_join", {
      page_type: "lobby",
      sport: game.sport,
      city: game.city,
    });
    landOrBlock({
      organiseGameId: result.value.openGame.organiseGameId,
      conversionBlocked: result.value.openGame.conversionBlocked,
      sport: result.value.openGame.sport,
      city: result.value.openGame.city,
    });
    await refreshList();
  }

  async function onAccept(proposal: PublicProposal) {
    if (!requireAccount(null)) return;
    setError(null);
    setBusy(`accept-${proposal.id}`);
    const result = await acceptProposal(proposal.id);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    track("lobby_propose_accept", {
      page_type: "lobby",
      sport: proposal.sport,
      city: proposal.city,
    });
    setProposals((prev) =>
      prev.map((item) => (item.id === result.value.proposal.id ? result.value.proposal : item)),
    );
    landOrBlock({
      organiseGameId: result.value.proposal.organiseGameId,
      conversionBlocked: result.value.proposal.conversionBlocked,
      sport: result.value.proposal.sport,
      city: result.value.proposal.city,
    });
  }

  async function onPass(proposal: PublicProposal) {
    if (!requireAccount(null)) return;
    setError(null);
    setBusy(`pass-${proposal.id}`);
    const result = await passProposal(proposal.id);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setProposals((prev) =>
      prev.map((item) => (item.id === result.value.proposal.id ? result.value.proposal : item)),
    );
  }

  async function onClearLooking() {
    if (!requireAccount(null)) return;
    setBusy("clear");
    const result = await clearLooking();
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSnapshot((prev) => ({ ...prev, viewer: { looking: null } }));
    await refreshList();
  }

  function openIntent(next: Intent) {
    if (!requireAccount(next)) return;
    setIntent(next);
    setError(null);
  }

  const highlightProposal = initialProposalId
    ? proposals.find((item) => item.id === initialProposalId)
    : null;
  const pendingProposals = proposals.filter((item) => item.status === "pending");

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Find players
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          Lobby
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Looking for a game, or looking for players. When a lobby fills we
          move you into Organise — then Start when you&apos;re ready.
        </p>
      </header>

      {looking && ttl ? (
        <section className="rounded-3xl border border-emerald-400/25 bg-emerald-400/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            {ttl.statusLabel}
          </p>
          <p className="mt-1 text-sm text-white">
            {sportLabel(looking.sport)} · {looking.city}
            {looking.area ? ` · ${looking.area}` : ""}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {formatWindow(looking.windowStart, looking.windowEnd, now)}
          </p>
          <button
            type="button"
            onClick={() => void onClearLooking()}
            disabled={busy === "clear"}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-60"
          >
            Clear Looking
          </button>
        </section>
      ) : null}

      {pendingProposals.length > 0 || highlightProposal ? (
        <section className="space-y-3" aria-labelledby="lobby-proposals">
          <h2 id="lobby-proposals" className="text-sm font-semibold text-zinc-200">
            Proposals
          </h2>
          <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
            {(highlightProposal && highlightProposal.status !== "pending"
              ? [highlightProposal, ...pendingProposals.filter((p) => p.id !== highlightProposal.id)]
              : pendingProposals
            ).map((proposal) => (
              <li key={proposal.id} className="space-y-3 px-4 py-4 sm:px-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                  {sportLabel(proposal.sport)} · {proposal.city}
                </p>
                <p className="text-sm font-medium text-white">
                  {formatWindow(proposal.windowStart, proposal.windowEnd, now)}
                </p>
                <p className="text-sm text-zinc-400">
                  {proposal.members
                    .map((member) =>
                      member.isYou
                        ? `You (${member.partySize})`
                        : `${member.firstName} (${member.partySize})`,
                    )
                    .join(" · ")}
                </p>
                {proposal.status === "pending" ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy === `accept-${proposal.id}`}
                      onClick={() => void onAccept(proposal)}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={busy === `pass-${proposal.id}`}
                      onClick={() => void onPass(proposal)}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-60"
                    >
                      Pass
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">
                    {proposal.status === "accepted" ? "Accepted" : "Passed"}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {blocked ? (
        <section className="rounded-3xl border border-amber-400/30 bg-amber-400/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-amber-100">{blocked.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-100/80">
            {blocked.body}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <PostActionShare
              url={blocked.primaryHref}
              text={`Need players for a game\n{url}`}
              pageType="lobby"
              sport={sportFilter || undefined}
              heading="Invite friends"
              compact
            />
            <Link
              href={blocked.secondaryHref}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/5"
            >
              {blocked.secondaryLabel}
            </Link>
          </div>
        </section>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => openIntent("looking")}
          className="flex flex-col items-start gap-2 rounded-3xl border border-white/8 bg-[#141814] px-5 py-5 text-left hover:border-white/16"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Looking for a game
          </span>
          <span className="text-sm text-zinc-400">
            Set Looking. We&apos;ll match you or show compatible open games.
          </span>
        </button>
        <button
          type="button"
          onClick={() => openIntent("open")}
          className="flex flex-col items-start gap-2 rounded-3xl border border-white/8 bg-[#141814] px-5 py-5 text-left hover:border-white/16"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Looking for players
          </span>
          <span className="text-sm text-zinc-400">
            Post an open game. Players join instantly until it fills.
          </span>
        </button>
      </div>

      {intent ? (
        <LobbyIntentForm
          kind={intent}
          venues={venues}
          defaultSport={(sportFilter || "padel") as LobbySport}
          defaultCity={cityFilter || "Cape Town"}
          busy={busy === "save"}
          onCancel={() => setIntent(null)}
          onSubmit={async (payload) => {
            setError(null);
            setBusy("save");
            if (intent === "looking") {
              const result = await setLooking(payload);
              setBusy(null);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              track("lobby_looking_on", {
                page_type: "lobby",
                sport: payload.sport,
                city: payload.city,
              });
              setSnapshot((prev) => ({
                ...prev,
                viewer: { looking: result.value.looking },
              }));
              if (result.value.proposals.length > 0) {
                setProposals((prev) => {
                  const ids = new Set(prev.map((item) => item.id));
                  return [
                    ...result.value.proposals.filter((item) => !ids.has(item.id)),
                    ...prev,
                  ];
                });
              }
            } else {
              const result = await createOpenGame(payload);
              setBusy(null);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              track("lobby_post_open", {
                page_type: "lobby",
                sport: payload.sport,
                city: payload.city,
              });
            }
            setIntent(null);
            await refreshList();
          }}
        />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Filter</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-zinc-400">
            Sport
            <select
              value={sportFilter}
              onChange={(event) => {
                const next = event.target.value as LobbySport | "";
                setSportFilter(next);
                router.replace(
                  hubLobbyHref({
                    sport: next,
                    city: cityFilter,
                    proposal: initialProposalId,
                  }),
                  { scroll: false },
                );
                void listLobby({
                  sport: next || undefined,
                  city: cityFilter || undefined,
                }).then((result) => {
                  if (result.ok) setSnapshot(result.value);
                });
              }}
              className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
            >
              <option value="">All sports</option>
              {LOBBY_SPORTS.map((sport) => (
                <option key={sport} value={sport}>
                  {sportLabel(sport)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-zinc-400">
            City
            <select
              value={cityFilter}
              onChange={(event) => {
                const next = event.target.value;
                setCityFilter(next);
                router.replace(
                  hubLobbyHref({
                    sport: sportFilter,
                    city: next,
                    proposal: initialProposalId,
                  }),
                  { scroll: false },
                );
                void listLobby({
                  sport: sportFilter || undefined,
                  city: next || undefined,
                }).then((result) => {
                  if (result.ok) setSnapshot(result.value);
                });
              }}
              className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
            >
              <option value="">All cities</option>
              {CITY_DIRECTORY.map((city) => (
                <option key={city.slug} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {empty ? (
        <section className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            {emptyCopy.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {emptyCopy.body}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openIntent("looking")}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
            >
              Set Looking
            </button>
            <button
              type="button"
              onClick={() => openIntent("open")}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/5"
            >
              Post open game
            </button>
          </div>
          <div className="mt-6">
            <CoverageNotify
              sport={sportFilter || undefined}
              city={cityFilter || undefined}
              cityName={cityFilter || undefined}
              sourcePage={LOBBY_HREF}
              pageType="lobby"
              trackFallbackOnView
            />
          </div>
        </section>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3" aria-labelledby="lobby-open">
            <h2 id="lobby-open" className="text-sm font-semibold text-zinc-200">
              Open games
            </h2>
            {filtered.openGames.length === 0 ? (
              <p className="text-sm text-zinc-500">No open games in this filter.</p>
            ) : (
              <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
                {filtered.openGames.map((game) => {
                  const share = buildLobbyWhatsAppShare({
                    kind: "need_more",
                    sport: game.sport,
                    city: game.city,
                    slotsRemaining: game.slotsRemaining,
                  });
                  return (
                    <li key={game.id} className="px-4 py-4 sm:px-5">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                        {sportLabel(game.sport)} · {game.city}
                        {game.area ? ` · ${game.area}` : ""}
                      </p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {game.firstName} ·{" "}
                        {formatWindow(game.windowStart, game.windowEnd, now)}
                      </p>
                      <p className="mt-1 text-sm text-emerald-300">
                        {needNMoreCopy(game.slotsRemaining)} · {game.slotsFilled}/
                        {game.slotsNeeded} in
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy === `join-${game.id}`}
                          onClick={() => void onJoin(game)}
                          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                        >
                          {busy === `join-${game.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            "Join"
                          )}
                        </button>
                        <a
                          href={share.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            track("share_click", {
                              page_type: "lobby",
                              cta_slot: "inline",
                              sport: game.sport,
                              channel: "whatsapp",
                            })
                          }
                          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25D366] px-5 text-sm font-semibold text-black hover:bg-[#1ebe57]"
                        >
                          WhatsApp · {needNMoreCopy(game.slotsRemaining)}
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="space-y-3" aria-labelledby="lobby-lookings">
            <h2 id="lobby-lookings" className="text-sm font-semibold text-zinc-200">
              Looking for a game
            </h2>
            {filtered.lookings.length === 0 ? (
              <p className="text-sm text-zinc-500">No one looking in this filter.</p>
            ) : (
              <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
                {filtered.lookings.map((row) => (
                  <li key={row.id} className="flex items-start gap-3 px-4 py-4 sm:px-5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-emerald-200">
                      <Users className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                        {sportLabel(row.sport)} · {row.city}
                        {row.area ? ` · ${row.area}` : ""}
                      </span>
                      <span className="mt-1 block text-sm font-medium text-white">
                        {row.firstName} ·{" "}
                        {formatWindow(row.windowStart, row.windowEnd, now)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function LobbyIntentForm({
  kind,
  venues,
  defaultSport,
  defaultCity,
  busy,
  onCancel,
  onSubmit,
}: {
  kind: "looking" | "open";
  venues: VenueOption[];
  defaultSport: LobbySport;
  defaultCity: string;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateOpenGameInput) => Promise<void>;
}) {
  const windowDefault = useMemo(() => defaultWindowLocal(), []);
  const [sport, setSport] = useState<LobbySport>(defaultSport);
  const [city, setCity] = useState(defaultCity || "Cape Town");
  const [area, setArea] = useState("");
  const [startLocal, setStartLocal] = useState(windowDefault.start);
  const [endLocal, setEndLocal] = useState(windowDefault.end);
  const [partySize, setPartySize] = useState(1);
  const [skill, setSkill] = useState<LobbySkill | "">("");
  const [venue, setVenue] = useState<VenueOption | null>(null);
  const [slotsNeeded, setSlotsNeeded] = useState(defaultSlotsNeeded(defaultSport));
  const [localError, setLocalError] = useState<string | null>(null);

  const sportVenues = useMemo(() => venuesForSport(venues, sport), [venues, sport]);
  const slotRange = slotsNeededRange(sport);
  const organiseReady = canOrganiseLobbySport(sport);

  function bumpParty(delta: number) {
    setPartySize((prev) =>
      Math.min(LOBBY_PARTY_SIZE_MAX, Math.max(LOBBY_PARTY_SIZE_MIN, prev + delta)),
    );
  }

  async function handleSubmit() {
    const windowStart = datetimeLocalToIso(startLocal);
    const windowEnd = datetimeLocalToIso(endLocal);
    if (!windowStart || !windowEnd) {
      setLocalError("Set a time window.");
      return;
    }
    if (!city.trim()) {
      setLocalError("City is required.");
      return;
    }
    const payload: SetLookingInput & CreateOpenGameInput = {
      sport,
      windowStart,
      windowEnd,
      city: city.trim(),
      area: area.trim() || null,
      venueCmsId: venue?.id ?? null,
      partySizeWithMe: partySize,
      skill: skill || null,
    };
    if (kind === "open") {
      payload.slotsNeeded = slotsNeeded;
    }
    setLocalError(null);
    await onSubmit(payload);
  }

  return (
    <section className="space-y-5 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-white">
            {kind === "looking" ? "Set Looking" : "Post open game"}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Sport, time window, and city are required. Venue is optional.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-zinc-400 hover:text-white"
        >
          Cancel
        </button>
      </div>

      {!organiseReady ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Darts can&apos;t convert to Organise yet. If this fills, invite friends
          — we won&apos;t invent a venue.
        </p>
      ) : !venue ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-zinc-400">
          Venue is optional now. Organise needs one later — pick a listed venue
          if you have one. We never invent venues.
        </p>
      ) : null}

      <label className="block text-sm text-zinc-400">
        Sport
        <select
          value={sport}
          onChange={(event) => {
            const next = event.target.value as LobbySport;
            setSport(next);
            setVenue(null);
            setSlotsNeeded(defaultSlotsNeeded(next));
          }}
          className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
        >
          {LOBBY_SPORTS.map((item) => (
            <option key={item} value={item}>
              {sportLabel(item)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-zinc-400">
          From
          <input
            type="datetime-local"
            value={startLocal}
            onChange={(event) => setStartLocal(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
          />
        </label>
        <label className="block text-sm text-zinc-400">
          To
          <input
            type="datetime-local"
            value={endLocal}
            onChange={(event) => setEndLocal(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-zinc-400">
          City
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
          >
            {CITY_DIRECTORY.map((item) => (
              <option key={item.slug} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-zinc-400">
          Area <span className="text-zinc-600">(optional)</span>
          <input
            type="text"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="Sea Point"
            className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/40"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">Party size with me</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => bumpParty(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white hover:bg-white/5"
            aria-label="Fewer players"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-8 text-center text-sm font-semibold text-white">
            {partySize}
          </span>
          <button
            type="button"
            onClick={() => bumpParty(1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white hover:bg-white/5"
            aria-label="More players"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {kind === "open" && slotRange.min !== slotRange.max ? (
        <label className="block text-sm text-zinc-400">
          Slots needed
          <select
            value={slotsNeeded}
            onChange={(event) => setSlotsNeeded(Number(event.target.value))}
            className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
          >
            {Array.from(
              { length: slotRange.max - slotRange.min + 1 },
              (_, i) => slotRange.min + i,
            ).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="block text-sm text-zinc-400">
        Skill <span className="text-zinc-600">(soft, optional)</span>
        <select
          value={skill}
          onChange={(event) => setSkill(event.target.value as LobbySkill | "")}
          className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
        >
          <option value="">Any</option>
          {LOBBY_SKILLS.map((item) => (
            <option key={item} value={item}>
              {skillLabel(item)}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <p className="text-sm text-zinc-400">
          Venue <span className="text-zinc-600">(optional)</span>
        </p>
        {sportVenues.length > 0 ? (
          <VenuePicker
            venues={sportVenues}
            selected={venue}
            onSelect={setVenue}
            searchPlaceholder={`Search ${sport} venues…`}
          />
        ) : (
          <p className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-zinc-400">
            No listed {sportLabel(sport).toLowerCase()} venues to pick. You can
            still post — invite friends if Organise needs a venue later.
          </p>
        )}
      </div>

      {localError ? (
        <p className="text-sm text-amber-200" role="alert">
          {localError}
        </p>
      ) : null}

      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSubmit()}
        className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-emerald-400 px-6 text-base font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : kind === "looking" ? (
          "Set Looking"
        ) : (
          "Post open game"
        )}
      </button>
    </section>
  );
}
