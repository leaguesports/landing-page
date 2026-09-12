"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  formatGolfTeeLabel,
  formatVenueLeaderboardStats,
  isVenueLeaderboardEmpty,
  listedVenueLeaderboardEntries,
  parseBoardFromSearch,
  parseWindowFromSearch,
  selectGrinderWindow,
  selectVenueLeaderboardTab,
  VENUE_LEADERBOARD_EMPTY_COPY,
  VENUE_LEADERBOARD_EMPTY_CTA,
  VENUE_LEADERBOARD_TAB_LABELS,
  VENUE_LEADERBOARD_WINDOW_LABELS,
  venueLeaderboardPlayHref,
  visibleVenueLeaderboardTabs,
} from "@/lib/venue-leaderboards/boards";
import {
  getVenueLeaderboard,
  probeVenueLeaderboards,
} from "@/lib/venue-leaderboards/api";
import type {
  VenueLeaderboardBoard,
  VenueLeaderboardEntry,
  VenueLeaderboardGolfTeeRecord,
  VenueLeaderboardRecords,
  VenueLeaderboardResponse,
  VenueLeaderboardWindow,
} from "@/lib/venue-leaderboards/types";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type VenueLeaderboardProps = {
  /** Internal venue UUID or Sanity/cms id — same as other venue routes. */
  venueId: string;
  venueName?: string;
  initialBoard?: VenueLeaderboardBoard | null;
  initialWindow?: VenueLeaderboardWindow | null;
  /** `/play` or `/play/[sport]` — empty-state CTA. */
  playHref?: string;
  sport?: string | null;
  className?: string;
  /** Signed-out slot (soft auth wall). TV can omit and handle auth itself. */
  unsignedSlot?: ReactNode;
};

type ProbeState = {
  records: VenueLeaderboardResponse | null;
  potm: VenueLeaderboardResponse | null;
  grinderMonth: VenueLeaderboardResponse | null;
  grinderAll: VenueLeaderboardResponse | null;
  streak: VenueLeaderboardResponse | null;
};

function LeaderAvatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "h-14 w-14 text-xl" : "h-10 w-10 text-base";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote OAuth avatars
      <img
        src={avatarUrl}
        alt=""
        className={`${box} shrink-0 rounded-full border border-white/10 object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span
      className={`flex ${box} shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-emerald-300`}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function EntryRow({
  entry,
  highlight = false,
}: {
  entry: VenueLeaderboardEntry;
  highlight?: boolean;
}) {
  const stats = formatVenueLeaderboardStats(entry.stats);
  return (
    <li
      className={
        highlight
          ? "flex items-center gap-4 rounded-3xl border border-amber-400/35 bg-amber-400/10 px-4 py-4 sm:px-5"
          : "flex items-center gap-3 px-4 py-3"
      }
    >
      <span
        className={`w-7 shrink-0 text-center font-display tabular-nums ${
          highlight ? "text-lg text-amber-200" : "text-xs text-zinc-500"
        }`}
      >
        {entry.rank || "—"}
      </span>
      <LeaderAvatar
        name={entry.displayName}
        avatarUrl={entry.avatarUrl}
        size={highlight ? "lg" : "md"}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate ${
            highlight
              ? "font-display text-xl tracking-wide text-white"
              : "text-sm font-medium text-white"
          }`}
        >
          {entry.displayName}
        </p>
        {stats ? (
          <p
            className={`mt-0.5 tabular-nums ${
              highlight ? "text-sm text-amber-100/80" : "text-xs text-zinc-500"
            }`}
          >
            {stats}
          </p>
        ) : null}
      </div>
      {highlight ? (
        <Trophy
          className="h-5 w-5 shrink-0 text-amber-300"
          aria-hidden
        />
      ) : null}
    </li>
  );
}

function TeeRecordRow({
  record,
}: {
  record: VenueLeaderboardGolfTeeRecord;
}) {
  const stats = formatVenueLeaderboardStats(record.stats);
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <LeaderAvatar name={record.displayName} avatarUrl={record.avatarUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {record.displayName}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {formatGolfTeeLabel(record)}
          {stats ? ` · ${stats}` : ""}
        </p>
      </div>
    </li>
  );
}

function RecordList({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode;
  empty: boolean;
}) {
  if (empty) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </h4>
      <ol className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8">
        {children}
      </ol>
    </div>
  );
}

function RecordsBoard({ records }: { records: VenueLeaderboardRecords }) {
  const golfGross = records.golf.bestGrossByTee;
  const golfNet = records.golf.bestNetByTee;
  const padelWins = records.padel.mostWins;
  const padelStreak = records.padel.bestWinStreak;
  const dartsWins = records.darts.mostWins;
  const dartsStreak = records.darts.bestWinStreak;

  return (
    <div className="space-y-8">
      {golfGross.length > 0 || golfNet.length > 0 ? (
        <div className="space-y-5">
          <h3 className="font-display text-xl tracking-wide text-white">Golf</h3>
          <RecordList title="Best gross by tee" empty={golfGross.length === 0}>
            {golfGross.map((row) => (
              <TeeRecordRow
                key={`${row.userId}-${row.teeId ?? row.teeName ?? "tee"}-gross`}
                record={row}
              />
            ))}
          </RecordList>
          <RecordList title="Best net by tee" empty={golfNet.length === 0}>
            {golfNet.map((row) => (
              <TeeRecordRow
                key={`${row.userId}-${row.teeId ?? row.teeName ?? "tee"}-net`}
                record={row}
              />
            ))}
          </RecordList>
        </div>
      ) : null}

      {padelWins.length > 0 || padelStreak.length > 0 ? (
        <div className="space-y-5">
          <h3 className="font-display text-xl tracking-wide text-white">
            Padel
          </h3>
          <RecordList title="Most wins" empty={padelWins.length === 0}>
            {padelWins.map((row) => (
              <EntryRow key={`padel-wins-${row.userId}`} entry={row} />
            ))}
          </RecordList>
          <RecordList title="Best win streak" empty={padelStreak.length === 0}>
            {padelStreak.map((row) => (
              <EntryRow key={`padel-streak-${row.userId}`} entry={row} />
            ))}
          </RecordList>
        </div>
      ) : null}

      {dartsWins.length > 0 || dartsStreak.length > 0 ? (
        <div className="space-y-5">
          <h3 className="font-display text-xl tracking-wide text-white">
            Darts
          </h3>
          <RecordList title="Most wins" empty={dartsWins.length === 0}>
            {dartsWins.map((row) => (
              <EntryRow key={`darts-wins-${row.userId}`} entry={row} />
            ))}
          </RecordList>
          <RecordList title="Best win streak" empty={dartsStreak.length === 0}>
            {dartsStreak.map((row) => (
              <EntryRow key={`darts-streak-${row.userId}`} entry={row} />
            ))}
          </RecordList>
        </div>
      ) : null}
    </div>
  );
}

function EmptyBoard({ playHref }: { playHref: string }) {
  return (
    <div className="space-y-5 rounded-3xl border border-dashed border-white/12 bg-[#141814] px-5 py-6 text-sm leading-relaxed text-zinc-400">
      <p>{VENUE_LEADERBOARD_EMPTY_COPY}</p>
      <Link
        href={playHref}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
      >
        {VENUE_LEADERBOARD_EMPTY_CTA}
      </Link>
    </div>
  );
}

/**
 * Extractable venue board for `/venues/{slug}` and later TV.
 * Auth: session cookie via same-origin `/api` + `credentials: "include"`.
 */
export function VenueLeaderboard({
  venueId,
  venueName,
  initialBoard = null,
  initialWindow = null,
  playHref,
  sport = null,
  className = "",
  unsignedSlot,
}: VenueLeaderboardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedBoard =
    parseBoardFromSearch(searchParams) ?? initialBoard ?? null;
  const requestedWindow =
    parseWindowFromSearch(searchParams) ?? initialWindow ?? null;

  const resolvedPlayHref = playHref ?? venueLeaderboardPlayHref(sport);

  const [probe, setProbe] = useState<ProbeState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [grinderOverride, setGrinderOverride] =
    useState<VenueLeaderboardWindow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await probeVenueLeaderboards(venueId);
    const unauthorized =
      (!result.records.ok && result.records.status === 401) ||
      (!result.potm.ok && result.potm.status === 401);
    if (unauthorized) {
      setProbe(null);
      setError(null);
      setLoading(false);
      return;
    }
    const firstError = [
      result.records,
      result.potm,
      result.grinderMonth,
      result.grinderAll,
      result.streak,
    ].find((row) => !row.ok);
    if (firstError && !firstError.ok && firstError.status !== 401) {
      setError(firstError.error);
    }
    setProbe({
      records: result.records.ok ? result.records.board : null,
      potm: result.potm.ok ? result.potm.board : null,
      grinderMonth: result.grinderMonth.ok ? result.grinderMonth.board : null,
      grinderAll: result.grinderAll.ok ? result.grinderAll.board : null,
      streak: result.streak.ok ? result.streak.board : null,
    });
    setLoading(false);
  }, [venueId]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    void load();
  }, [authLoading, isAuthenticated, load]);

  const tabs = useMemo(
    () => visibleVenueLeaderboardTabs(probe ?? {}),
    [probe],
  );
  const selected = selectVenueLeaderboardTab(requestedBoard, tabs);
  const monthEmpty = isVenueLeaderboardEmpty(probe?.grinderMonth);
  const allEmpty = isVenueLeaderboardEmpty(probe?.grinderAll);
  const grinderWindow = selectGrinderWindow(
    grinderOverride ?? requestedWindow,
    monthEmpty,
    allEmpty,
  );

  const selectedPayload = useMemo(() => {
    if (!probe || !selected) return null;
    if (selected === "grinder") {
      return grinderWindow === "all" ? probe.grinderAll : probe.grinderMonth;
    }
    return probe[selected];
  }, [grinderWindow, probe, selected]);

  function replaceQuery(
    board: VenueLeaderboardBoard,
    nextWindow?: VenueLeaderboardWindow,
  ) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("board", board);
    if (board === "grinder") {
      params.set("window", nextWindow ?? grinderWindow);
    } else {
      params.delete("window");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  async function handleGrinderWindow(next: VenueLeaderboardWindow) {
    setGrinderOverride(next);
    replaceQuery("grinder", next);
    if (
      (next === "month" && probe?.grinderMonth) ||
      (next === "all" && probe?.grinderAll)
    ) {
      return;
    }
    const result = await getVenueLeaderboard(venueId, {
      board: "grinder",
      window: next,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setProbe((current) =>
      current
        ? {
            ...current,
            grinderMonth:
              next === "month" ? result.board : current.grinderMonth,
            grinderAll: next === "all" ? result.board : current.grinderAll,
          }
        : current,
    );
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <div className={className}>
        {unsignedSlot ?? (
          <EmptyBoard playHref={resolvedPlayHref} />
        )}
      </div>
    );
  }

  if (authLoading || (isAuthenticated && loading && !probe)) {
    return (
      <div className={className}>
        <p className="text-sm text-zinc-500">Loading leaderboards…</p>
      </div>
    );
  }

  const visibleIds = (
    ["records", "potm", "grinder", "streak"] as const
  ).filter((board) => tabs[board]);
  const showEmpty =
    !selected || !selectedPayload || isVenueLeaderboardEmpty(selectedPayload);

  return (
    <div className={className}>
      {error ? (
        <p className="mb-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      {visibleIds.length > 0 ? (
        <div
          role="tablist"
          aria-label="Venue leaderboards"
          className="mb-5 flex flex-wrap gap-2"
        >
          {visibleIds.map((board) => {
            const active = selected === board;
            return (
              <button
                key={board}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setGrinderOverride(null);
                  replaceQuery(board);
                }}
                className={
                  active
                    ? "inline-flex min-h-11 items-center rounded-full bg-emerald-400 px-4 text-sm font-semibold text-zinc-950"
                    : "inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-sm font-medium text-zinc-300 hover:border-white/20 hover:text-white"
                }
              >
                {VENUE_LEADERBOARD_TAB_LABELS[board]}
              </button>
            );
          })}
        </div>
      ) : null}

      {selected === "grinder" && tabs.grinder ? (
        <div
          role="group"
          aria-label="Grinder window"
          className="mb-5 flex flex-wrap gap-2"
        >
          {(["month", "all"] as const).map((window) => {
            const active = grinderWindow === window;
            return (
              <button
                key={window}
                type="button"
                aria-pressed={active}
                onClick={() => void handleGrinderWindow(window)}
                className={
                  active
                    ? "inline-flex min-h-10 items-center rounded-full bg-white px-4 text-xs font-semibold text-zinc-950"
                    : "inline-flex min-h-10 items-center rounded-full border border-white/12 px-4 text-xs font-medium text-zinc-400 hover:text-white"
                }
              >
                {VENUE_LEADERBOARD_WINDOW_LABELS[window]}
              </button>
            );
          })}
        </div>
      ) : null}

      {showEmpty ? (
        <EmptyBoard playHref={resolvedPlayHref} />
      ) : selected === "records" && selectedPayload.records ? (
        <RecordsBoard records={selectedPayload.records} />
      ) : (
        <RankedBoard
          payload={selectedPayload}
          venueName={venueName}
        />
      )}
    </div>
  );
}

function RankedBoard({
  payload,
  venueName,
}: {
  payload: VenueLeaderboardResponse;
  venueName?: string;
}) {
  const rows = listedVenueLeaderboardEntries(payload.first, payload.entries);
  const first = rows[0] ?? payload.first;
  const rest = first
    ? rows.filter((row) => row.userId !== first.userId)
    : rows;

  return (
    <div className="space-y-4">
      {first ? <EntryRow entry={first} highlight /> : null}
      {rest.length > 0 ? (
        <ol
          className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]"
          aria-label={
            venueName ? `Leaderboard at ${venueName}` : "Leaderboard"
          }
        >
          {rest.map((row) => (
            <EntryRow key={row.userId} entry={row} />
          ))}
        </ol>
      ) : null}
    </div>
  );
}
