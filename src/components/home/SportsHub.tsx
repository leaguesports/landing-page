"use client";

import { PadelHistoryList } from "@/components/padel/PadelHistoryList";
import { SportIcon } from "@/components/icons/sports";
import { useAuth } from "@/hooks/useAuth";
import type { AuthUser } from "@/lib/api-client";
import { summarisePlayerHistory } from "@/lib/padel/history";
import {
  ALL_SPORTS_SLUG,
  defaultHubPreferences,
  filterFeedBySport,
  hubStorageKey,
  parseHubPreferences,
  selectHubSport,
  serializeHubPreferences,
  unfollowHubSport,
  utilitiesForActiveSport,
  type HubPreferences,
  type HubUtility,
  type SportDefinition,
} from "@/lib/sports/catalog";
import {
  formatHubWhen,
  type HubFeedItem,
} from "@/lib/sports/hub-feed";
import type { PadelHistoryItem } from "@/types/padel-match";
import type { FollowedVenue } from "@/lib/venues/follow";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Flag,
  Heart,
  History,
  MapPin,
  Trophy,
  Tv,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useId,
  useMemo,
  useSyncExternalStore,
} from "react";

const HUB_PREFS_EVENT = "leaguesports-hub-prefs";

type SportsHubProps = {
  user: AuthUser;
  historyError: string | null;
  historyItems: PadelHistoryItem[];
  followedVenues?: FollowedVenue[];
  sports: SportDefinition[];
  feed: HubFeedItem[];
  nowIso: string;
};

function useHubPreferences(
  userId: string,
  knownSlugs: string[],
  seedFollowed: string[],
) {
  const key = hubStorageKey(userId);
  const fallbackJson = useMemo(
    () =>
      serializeHubPreferences(
        defaultHubPreferences(seedFollowed, knownSlugs),
      ),
    [knownSlugs, seedFollowed],
  );

  const subscribe = useCallback((onChange: () => void) => {
    const handler = () => onChange();
    window.addEventListener("storage", handler);
    window.addEventListener(HUB_PREFS_EVENT, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(HUB_PREFS_EVENT, handler);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key) ?? fallbackJson;
    } catch {
      return fallbackJson;
    }
  }, [key, fallbackJson]);

  const getServerSnapshot = useCallback(() => fallbackJson, [fallbackJson]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const prefs = parseHubPreferences(raw, { knownSlugs, seedFollowed });

  function setPrefs(next: HubPreferences) {
    try {
      window.localStorage.setItem(key, serializeHubPreferences(next));
    } catch {
      // Private mode / quota — hub still works for this session.
    }
    window.dispatchEvent(new Event(HUB_PREFS_EVENT));
  }

  return [prefs, setPrefs] as const;
}

function displayName(user: AuthUser): string {
  return (
    user.displayName?.trim() ||
    user.name?.trim() ||
    user.handle?.trim() ||
    user.email?.trim() ||
    "Player"
  );
}

function utilityIcon(kind: HubUtility["kind"]) {
  switch (kind) {
    case "scorecard":
      return Trophy;
    case "history":
      return History;
    case "play":
      return MapPin;
    case "watch":
      return Tv;
    case "calendar":
      return Calendar;
    case "series":
      return Flag;
    case "guides":
      return BookOpen;
  }
}

function feedIcon(kind: HubFeedItem["kind"]) {
  if (kind === "event") return Calendar;
  if (kind === "screening") return Tv;
  return BookOpen;
}

function feedKindLabel(kind: HubFeedItem["kind"]): string {
  if (kind === "event") return "Event";
  if (kind === "screening") return "Screening";
  return "Guide";
}

export function SportsHub({
  user,
  historyError,
  historyItems,
  followedVenues = [],
  sports,
  feed,
  nowIso,
}: SportsHubProps) {
  const name = displayName(user);
  const handle = user.handle?.trim();
  const knownSlugs = useMemo(() => sports.map((sport) => sport.slug), [sports]);
  const seedFollowed = useMemo(
    () => (historyItems.length > 0 ? ["padel"] : []),
    [historyItems.length],
  );
  const [prefs, setPrefs] = useHubPreferences(
    user.id,
    knownSlugs,
    seedFollowed,
  );
  const tablistId = useId();
  const { signOut } = useAuth();
  const nowMs = new Date(nowIso).getTime();

  const active = prefs.active;
  const utilities = utilitiesForActiveSport(active, sports);
  const visibleFeed = filterFeedBySport(feed, active);
  const nextUp = visibleFeed.find((item) => {
    if (!item.startsAt) return false;
    const time = new Date(item.startsAt).getTime();
    return !Number.isNaN(time) && Number.isFinite(nowMs) && time >= nowMs;
  });
  const restFeed = visibleFeed.filter((item) => item.id !== nextUp?.id);
  const showPadel =
    active === ALL_SPORTS_SLUG || active === "padel";
  const stats = summarisePlayerHistory(historyItems, user.id);
  const activeSport =
    active === ALL_SPORTS_SLUG
      ? null
      : sports.find((sport) => sport.slug === active) ?? null;
  const primary = utilities.filter((item) => item.emphasis === "primary");
  const recent = historyItems.slice(0, 8);
  const followedSet = new Set(prefs.followed);

  function focusSport(slug: string) {
    setPrefs(selectHubSport(prefs, slug, knownSlugs));
  }

  function unfollow(slug: string) {
    setPrefs(unfollowHubSport(prefs, slug, knownSlugs));
  }

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute -right-24 top-0 h-[22rem] w-[22rem] rounded-full bg-[var(--color-brand)]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Your hub
            </p>
            <button
              type="button"
              onClick={() => {
                void signOut().then(() => {
                  window.location.assign("/");
                });
              }}
              className="text-sm text-zinc-500 transition-colors hover:text-white"
            >
              Sign out
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-14 w-14 rounded-full border border-white/10 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#141814] font-display text-2xl text-emerald-300">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                  {name}
                </h1>
                {handle ? (
                  <p className="mt-1 text-sm text-zinc-400">@{handle}</p>
                ) : (
                  <p className="mt-1 text-sm text-zinc-400">
                    Watch, play, and keep your results in one place.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {primary.slice(0, 2).map((action) => (
                <Link
                  key={action.id}
                  href={action.href}
                  className={
                    action.emphasis === "primary" && action === primary[0]
                      ? "inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
                      : "inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                  }
                >
                  {action.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Sports
              </p>
              <h2 className="mt-1 font-display text-2xl tracking-wide text-white sm:text-3xl">
                {activeSport ? activeSport.name : "All sports"}
              </h2>
            </div>
            <p className="hidden max-w-xs text-right text-xs leading-relaxed text-zinc-500 sm:block">
              Tap a sport to focus the hub. Followed sports stay on this device.
            </p>
          </div>

          <div
            id={tablistId}
            role="tablist"
            aria-label="Filter hub by sport"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          >
            <SportChip
              label="All"
              selected={active === ALL_SPORTS_SLUG}
              followed={false}
              onSelect={() => focusSport(ALL_SPORTS_SLUG)}
            />
            {sports.map((sport) => (
              <SportChip
                key={sport.slug}
                label={sport.name}
                sportSlug={sport.slug}
                selected={active === sport.slug}
                followed={followedSet.has(sport.slug)}
                count={sport.slug === "padel" ? stats.locked : undefined}
                onSelect={() => focusSport(sport.slug)}
                onUnfollow={
                  followedSet.has(sport.slug)
                    ? () => unfollow(sport.slug)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Manage
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-wide text-white">
              {activeSport
                ? `${activeSport.name} tools`
                : "What do you need?"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {activeSport
                ? `Utilities for watching, playing, and tracking ${activeSport.name.toLowerCase()}.`
                : "Start a match, find a venue, or jump into whatever you follow."}
            </p>

            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {utilities.map((utility) => {
                const Icon = utilityIcon(utility.kind);
                return (
                  <li key={utility.id}>
                    <Link
                      href={utility.href}
                      className="group flex h-full min-h-28 flex-col rounded-3xl border border-white/8 bg-[#141814] p-5 transition-colors hover:border-white/16"
                    >
                      <Icon
                        className="h-4 w-4 text-emerald-300"
                        aria-hidden
                      />
                      <p className="mt-3 text-sm font-medium text-white group-hover:text-[var(--color-brand)]">
                        {utility.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                        {utility.description}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {followedVenues.length > 0 ? (
              <div className="mt-8">
                <div className="mb-3 flex items-center gap-2">
                  <Heart
                    className="h-3.5 w-3.5 fill-emerald-300 text-emerald-300"
                    aria-hidden
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Followed venues
                  </p>
                </div>
                <ul className="space-y-2">
                  {followedVenues.slice(0, 6).map((venue) => (
                    <li key={venue.id}>
                      <Link
                        href={`/venues/${venue.slug}`}
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 transition-colors hover:border-white/16"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-white group-hover:text-[var(--color-brand)]">
                            {venue.name}
                          </span>
                        </span>
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-white"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {showPadel ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Locked", value: String(stats.locked) },
                  { label: "Wins", value: String(stats.wins) },
                  { label: "Losses", value: String(stats.losses) },
                  {
                    label: "Win rate",
                    value: stats.locked ? `${stats.winRate}%` : "—",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-white/8 bg-[#141814] px-4 py-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 font-display text-3xl tracking-wide text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <div className="mb-6 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  For you
                </p>
                <h2 className="mt-1 font-display text-3xl tracking-wide text-white">
                  {activeSport ? `${activeSport.name} feed` : "Up next"}
                </h2>
              </div>
            </div>

            {nextUp ? (
              <Link
                href={nextUp.href}
                className="group mb-4 block overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-5 transition-colors hover:border-emerald-400/40 sm:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Next up · {feedKindLabel(nextUp.kind)}
                </p>
                <h3 className="mt-2 font-display text-3xl tracking-wide text-white sm:text-4xl">
                  {nextUp.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {nextUp.subtitle}
                  {nextUp.startsAt ? ` · ${formatHubWhen(nextUp.startsAt)}` : ""}
                </p>
              </Link>
            ) : null}

            {restFeed.length > 0 ? (
              <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
                {restFeed.slice(0, 8).map((item) => {
                  const Icon = feedIcon(item.kind);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/3 sm:px-6"
                      >
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-zinc-300">
                          <Icon className="h-4 w-4" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                            {feedKindLabel(item.kind)}
                            {item.startsAt
                              ? ` · ${formatHubWhen(item.startsAt)}`
                              : ""}
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {item.subtitle}
                          </p>
                        </div>
                        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : !nextUp ? (
              <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 sm:px-8">
                <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                  {activeSport
                    ? `Nothing in the ${activeSport.name} feed yet. Use the tools beside this list to watch or play.`
                    : "Your feed fills with upcoming screenings, events, and guides as they land."}
                </p>
                {utilities[0] ? (
                  <Link
                    href={utilities[0].href}
                    className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                  >
                    {utilities[0].title}
                  </Link>
                ) : null}
              </div>
            ) : null}

            {showPadel ? (
              <div className="mt-10">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Padel
                    </p>
                    <h3 className="mt-1 font-display text-3xl tracking-wide text-white">
                      Locked matches
                    </h3>
                  </div>
                  {historyItems.length > 0 ? (
                    <Link
                      href="/padel/history"
                      className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                    >
                      View all history
                    </Link>
                  ) : null}
                </div>

                {historyError ? (
                  <div className="space-y-5 rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-8 sm:px-8">
                    <p className="text-sm text-red-300">{historyError}</p>
                    <Link
                      href="/padel/new"
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                    >
                      Start a match anyway
                    </Link>
                  </div>
                ) : recent.length === 0 ? (
                  <div className="space-y-5 rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 sm:px-8">
                    <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                      No locked padel matches yet. Start a match, play it out,
                      and end the scorecard — only locked results land here.
                    </p>
                    <Link
                      href="/padel/new"
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                    >
                      Start your first match
                    </Link>
                  </div>
                ) : (
                  <PadelHistoryList
                    items={recent}
                    playerUserId={user.id}
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SportChip({
  label,
  sportSlug,
  selected,
  followed,
  count,
  onSelect,
  onUnfollow,
}: {
  label: string;
  sportSlug?: string;
  selected: boolean;
  followed: boolean;
  count?: number;
  onSelect: () => void;
  onUnfollow?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        role="tab"
        aria-selected={selected}
        onClick={onSelect}
        className={[
          "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
          selected
            ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-100"
            : followed
              ? "border-white/16 bg-white/6 text-white"
              : "border-white/8 bg-[#141814] text-zinc-400 hover:border-white/16 hover:text-white",
          onUnfollow ? "rounded-r-none pr-3" : "",
        ].join(" ")}
      >
        {sportSlug ? (
          <SportIcon
            sportSlug={sportSlug}
            size={16}
            color="currentColor"
          />
        ) : null}
        {label}
        {typeof count === "number" && count > 0 ? (
          <span className="tabular-nums text-emerald-300/80">{count}</span>
        ) : null}
      </button>
      {onUnfollow ? (
        <button
          type="button"
          onClick={onUnfollow}
          aria-label={`Unfollow ${label}`}
          className={[
            "inline-flex h-11 items-center rounded-full rounded-l-none border border-l-0 px-2.5 text-zinc-500 transition-colors hover:text-white",
            selected
              ? "border-emerald-400/40 bg-emerald-400/15"
              : "border-white/16 bg-white/6",
          ].join(" ")}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
