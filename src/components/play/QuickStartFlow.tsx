"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { getLoginPageHref } from "@/lib/auth-return-to";
import type { Friend } from "@/lib/friends/friends";
import { loadRecentPlayers } from "@/lib/padel/recent-players";
import {
  buildQuickStartPlayerSeed,
  formatDistanceKm,
  resolveQuickStart,
  suggestQuickStartPlayers,
  writeQuickStartPlayerSeed,
  type QuickStartResolution,
  type QuickStartSuggestedPlayer,
  type QuickStartVenue,
} from "@/lib/play/quick-start";
import {
  Check,
  Loader2,
  MapPin,
  Navigation,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type QuickStartFlowProps = {
  venues: QuickStartVenue[];
  friends: Friend[];
  preferredSports?: string[];
  activeSport?: string | null;
  isAuthenticated: boolean;
  selfUserId?: string | null;
};

function PlayerChip({
  player,
  selected,
  onToggle,
}: {
  player: QuickStartSuggestedPlayer;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={[
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
        selected
          ? "border-emerald-400/45 bg-emerald-400/12 text-emerald-100"
          : "border-white/10 bg-white/4 text-zinc-300 hover:border-white/20",
      ].join(" ")}
    >
      {player.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote OAuth avatars
        <img
          src={player.avatarUrl}
          alt=""
          className="h-6 w-6 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-[11px] font-semibold text-emerald-300"
          aria-hidden
        >
          {player.displayName.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
      <span className="max-w-[10rem] truncate">{player.displayName}</span>
      {selected ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
    </button>
  );
}

export function QuickStartFlow({
  venues,
  friends,
  preferredSports = [],
  activeSport = null,
  isAuthenticated,
  selfUserId = null,
}: QuickStartFlowProps) {
  const router = useRouter();
  const { coords, status, error, request } = useGeolocation();
  const [sportOverride, setSportOverride] = useState<string | null>(null);
  const [venueOverride, setVenueOverride] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    if (status === "idle") request();
  }, [status, request]);

  const recent = useMemo(() => {
    if (typeof window === "undefined") return [];
    return loadRecentPlayers().map((player) => ({
      id: player.id,
      displayName: player.displayName,
      // PadelPlayer.userId is optional; QuickStartSuggestedPlayer requires null.
      userId: player.userId ?? null,
      isGuest: player.isGuest,
    }));
  }, []);

  const resolution: QuickStartResolution | null = useMemo(() => {
    if (!coords) return null;
    return resolveQuickStart(venues, coords, {
      preferredSports,
      activeSport,
      overrideSport: sportOverride,
      overrideVenueSlug: venueOverride,
    });
  }, [
    coords,
    venues,
    preferredSports,
    activeSport,
    sportOverride,
    venueOverride,
  ]);

  const suggestions = useMemo(() => {
    if (!resolution) return [];
    return suggestQuickStartPlayers({
      sportSlug: resolution.activity.sportSlug,
      friends,
      recent,
      excludeUserIds: selfUserId ? [selfUserId] : [],
    });
  }, [resolution, friends, recent, selfUserId]);

  const selectedPlayers = useMemo(() => {
    if (!resolution) return [];
    const ids =
      selectedIds ??
      suggestions.map((player) => player.id);
    const selected = new Set(ids);
    return suggestions.filter((player) => selected.has(player.id));
  }, [resolution, selectedIds, suggestions]);

  const nearbyAlternates = useMemo(() => {
    if (!coords || !resolution) return [];
    return venues
      .map((venue) => {
        const match = resolveQuickStart([venue], coords, {
          preferredSports,
          activeSport,
        });
        return match;
      })
      .filter((row): row is QuickStartResolution => Boolean(row))
      .filter((row) => row.venue.slug !== resolution.venue.slug)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 4);
  }, [coords, venues, preferredSports, activeSport, resolution]);

  function togglePlayer(id: string) {
    const current =
      selectedIds ?? suggestions.map((player) => player.id);
    setSelectedIds(
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function handleContinue() {
    if (!resolution) return;
    setContinuing(true);
    const seed = buildQuickStartPlayerSeed(resolution, selectedPlayers);
    writeQuickStartPlayerSeed(seed);
    router.push(resolution.activity.href);
  }

  const signInHref = getLoginPageHref("/play/quick");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Quick start
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          Who, what, where
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-400">
          Use your location to pick the nearest court, the sport it hosts, and
          friends to seat on the scorecard.
        </p>
      </header>

      {!isAuthenticated ? (
        <div className="mb-6 rounded-3xl border border-amber-400/20 bg-amber-400/8 px-5 py-4 text-sm text-amber-100">
          <p>
            Sign in so we can seat you and suggest friends. Guests can still
            open a nearby scorecard.
          </p>
          <Link
            href={signInHref}
            className="mt-3 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950"
          >
            Sign in
          </Link>
        </div>
      ) : null}

      <section className="mb-6 rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <Navigation className="h-4 w-4 text-emerald-400" aria-hidden />
            {status === "loading" || status === "idle"
              ? "Finding your location…"
              : status === "ready"
                ? "Location ready"
                : status === "unsupported"
                  ? "Location not supported"
                  : "Location needed"}
          </div>
          <button
            type="button"
            onClick={request}
            disabled={status === "loading"}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Navigation className="h-4 w-4" aria-hidden />
            )}
            {status === "ready" ? "Refresh" : "Use my location"}
          </button>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-amber-300/90">{error}</p>
        ) : null}
      </section>

      {status === "ready" && !resolution ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 text-sm leading-relaxed text-zinc-400">
          No playable venues with coordinates within range. Browse the{" "}
          <Link href="/venues" className="text-emerald-300 hover:underline">
            venues directory
          </Link>{" "}
          or start a game manually from Play.
        </div>
      ) : null}

      {resolution ? (
        <div className="space-y-5">
          <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/8 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Where
            </p>
            <div className="mt-3 flex items-start gap-3">
              <MapPin
                className="mt-1 h-5 w-5 shrink-0 text-emerald-300"
                aria-hidden
              />
              <div className="min-w-0">
                <h2 className="font-display text-3xl tracking-wide text-white">
                  {resolution.venue.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {[resolution.venue.suburb, resolution.venue.city]
                    .filter(Boolean)
                    .join(" · ")}
                  {" · "}
                  <span className="tabular-nums text-emerald-300">
                    {formatDistanceKm(resolution.distanceKm)}
                  </span>
                </p>
                {resolution.far ? (
                  <p className="mt-2 text-xs text-amber-200/90">
                    Nearest mapped venue is more than 5 km away — pick another
                    below if that is not where you are.
                  </p>
                ) : null}
              </div>
            </div>

            {nearbyAlternates.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {nearbyAlternates.map((alt) => (
                  <li key={alt.venue.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        setVenueOverride(alt.venue.slug);
                        setSportOverride(null);
                        setSelectedIds(null);
                      }}
                      className="rounded-full border border-white/10 bg-[#0c0f0c]/50 px-3 py-1.5 text-xs text-zinc-300 hover:border-white/20 hover:text-white"
                    >
                      {alt.venue.name}
                      <span className="ml-1.5 tabular-nums text-zinc-500">
                        {formatDistanceKm(alt.distanceKm)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              What
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-wide text-white">
              {resolution.activity.name}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              {resolution.activity.description}
            </p>
            {resolution.activities.length > 1 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {resolution.activities.map((activity) => {
                  const active =
                    activity.sportSlug === resolution.activity.sportSlug;
                  return (
                    <li key={activity.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSportOverride(activity.sportSlug);
                          setSelectedIds(null);
                        }}
                        className={[
                          "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                          active
                            ? "border-emerald-400/45 bg-emerald-400/12 text-emerald-100"
                            : "border-white/10 bg-white/4 text-zinc-300 hover:border-white/20",
                        ].join(" ")}
                      >
                        {activity.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>

          <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-300" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Who
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {suggestions.length > 0
                ? "Friends and recent players we will pre-seat on the scorecard. Tap to include or skip."
                : "No friends or recent players yet — we will open the scorecard with guest slots you can edit."}
            </p>
            {suggestions.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((player) => (
                  <PlayerChip
                    key={player.id}
                    player={player}
                    selected={selectedPlayers.some((p) => p.id === player.id)}
                    onToggle={() => togglePlayer(player.id)}
                  />
                ))}
              </div>
            ) : null}
          </section>

          <button
            type="button"
            onClick={handleContinue}
            disabled={continuing}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
          >
            {continuing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Zap className="h-4 w-4" aria-hidden />
            )}
            {resolution.activity.cta}
          </button>
        </div>
      ) : null}
    </div>
  );
}
