"use client";

import { BadgesPanel } from "@/components/home/BadgesPanel";
import type { BadgesSnapshot } from "@/lib/badges/api";
import { CommunitiesPanel } from "@/components/home/CommunitiesPanel";
import { FriendsPanel } from "@/components/home/FriendsPanel";
import { IntegrationsPanel } from "@/components/home/IntegrationsPanel";
import { TrainingPanel } from "@/components/home/TrainingPanel";
import { FriendsSnapshotSeed } from "@/components/providers/AppSessionProvider";
import { PadelHistoryList } from "@/components/padel/PadelHistoryList";
import { SportIcon } from "@/components/icons/sports";
import type { AuthUser } from "@/lib/api-client";
import type { MyCommunity } from "@/lib/communities/communities";
import {
  emptyIntegrationsSnapshot,
  type IntegrationsSnapshot,
} from "@/lib/integrations/integrations";
import {
  emptyTrainingSnapshot,
  type TrainingSnapshot,
} from "@/lib/training/training";
import {
  emptyFriendsSnapshot,
  type FriendsSnapshot,
} from "@/lib/friends/friends";
import { updatePreferences } from "@/lib/preferences/preferences";
import { summarisePlayerHistory } from "@/lib/padel/history";
import { PadelProgressSummary } from "@/components/padel/PadelProgressSummary";
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
  filterFeedByVenueSlugs,
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
  LayoutGrid,
  MapPin,
  Sparkles,
  Trophy,
  Tv,
  Users,
  Dumbbell,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const HUB_PREFS_EVENT = "leaguesports-hub-prefs";


type HubSection = "for-you" | "tools" | "friends" | "progress";

const HUB_SECTIONS: {
  id: HubSection;
  label: string;
  description: string;
  icon: typeof Sparkles;
}[] = [
  {
    id: "for-you",
    label: "For you",
    description: "Games you follow, venue screenings, and guides",
    icon: Sparkles,
  },
  {
    id: "tools",
    label: "Tools",
    description: "Scorecards, venues, and sport utilities",
    icon: LayoutGrid,
  },
  {
    id: "friends",
    label: "Friends",
    description: "Friends and your communities",
    icon: Users,
  },
  {
    id: "progress",
    label: "Progress",
    description: "Form, badges, training, connected services, and locked matches",
    icon: Trophy,
  },
];

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-display text-2xl tracking-wide text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/** Locked-activity counts derived on the server — not full history rows. */
export type LockedActivityCounts = {
  padel: number;
  golf: number;
  /** Set when either padel or golf lookup failed — Games must not look certain. */
  error: string | null;
};

type SportsHubProps = {
  user: AuthUser;
  historyError: string | null;
  historyItems: PadelHistoryItem[];
  /** Prefer this over shipping full golf history into the client hub. */
  lockedActivity?: LockedActivityCounts;
  followedVenues?: FollowedVenue[];
  /** Resolved fixtures the user follows — personal broadcast calendar (#106). */
  followedFixtures?: HubFeedItem[];
  /** Raw follow count from the API (may exceed resolved CMS rows). */
  followedFixtureCount?: number;
  friends?: FriendsSnapshot;
  /** Prefetched `GET /api/me/communities` — empty on failure. */
  myCommunities?: MyCommunity[];
  /** Prefetched `GET /api/me/training/plans` — empty on 404 / 503 / lag. */
  training?: TrainingSnapshot;
  /** Prefetched `GET /api/me/integrations` — connectable providers only. */
  integrations?: IntegrationsSnapshot;
  badges?: BadgesSnapshot;
  sports: SportDefinition[];
  feed: HubFeedItem[];
  nowIso: string;
  /** Server-backed sport follows from `/api/me/preferences`. */
  initialFollowedSports?: string[];
  initialActiveSport?: string | null;
};

function useHubPreferences(
  userId: string,
  knownSlugs: string[],
  seedFollowed: string[],
  initialActiveSport: string | null = null,
) {
  const key = hubStorageKey(userId);
  const fallbackJson = useMemo(() => {
    const base = defaultHubPreferences(seedFollowed, knownSlugs);
    if (
      initialActiveSport &&
      (initialActiveSport === ALL_SPORTS_SLUG ||
        knownSlugs.includes(initialActiveSport))
    ) {
      return serializeHubPreferences({
        ...base,
        active: initialActiveSport,
      });
    }
    return serializeHubPreferences(base);
  }, [initialActiveSport, knownSlugs, seedFollowed]);

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
    void updatePreferences({
      sports: next.followed,
      activeSport: next.active === ALL_SPORTS_SLUG ? null : next.active,
    });
  }

  return [prefs, setPrefs] as const;
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
    case "training":
      return Dumbbell;
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
  lockedActivity,
  followedVenues = [],
  followedFixtures = [],
  followedFixtureCount = 0,
  friends = emptyFriendsSnapshot(),
  myCommunities = [],
  training = emptyTrainingSnapshot(),
  integrations = emptyIntegrationsSnapshot(),
  badges = { badges: [], fromApi: false },
  sports,
  feed,
  nowIso,
  initialFollowedSports = [],
  initialActiveSport = null,
}: SportsHubProps) {
  const knownSlugs = useMemo(() => sports.map((sport) => sport.slug), [sports]);
  const padelLocked = lockedActivity?.padel ?? historyItems.length;
  const golfLocked = lockedActivity?.golf ?? 0;
  const activityError = lockedActivity?.error ?? historyError;
  const gamesKnown = !activityError;
  const gamesPlayed = padelLocked + golfLocked;
  const seedFollowed = useMemo(() => {
    const seeds: string[] = [...initialFollowedSports];
    if (padelLocked > 0) seeds.push("padel");
    if (golfLocked > 0) seeds.push("golf");
    return seeds;
  }, [golfLocked, initialFollowedSports, padelLocked]);
  const [prefs, setPrefs] = useHubPreferences(
    user.id,
    knownSlugs,
    seedFollowed,
    initialActiveSport,
  );
  const tablistId = useId();
  const sectionTablistId = useId();
  const [section, setSection] = useState<HubSection>("for-you");
  const [friendRequestCount, setFriendRequestCount] = useState(
    () => friends.incoming.length,
  );
  const nowMs = new Date(nowIso).getTime();

  const active = prefs.active;
  const utilities = utilitiesForActiveSport(active, sports);
  const visibleFeed = filterFeedBySport(feed, active);
  const visibleFollowedFixtures = useMemo(
    () => filterFeedBySport(followedFixtures, active),
    [active, followedFixtures],
  );
  const followedSlugs = useMemo(
    () => followedVenues.map((venue) => venue.slug),
    [followedVenues],
  );
  const followedFeed = useMemo(
    () => filterFeedByVenueSlugs(visibleFeed, followedSlugs),
    [followedSlugs, visibleFeed],
  );
  const followedFixtureUpcoming = useMemo(() => {
    return visibleFollowedFixtures.filter((item) => {
      if (!item.startsAt) return false;
      const time = new Date(item.startsAt).getTime();
      return !Number.isNaN(time) && Number.isFinite(nowMs) && time >= nowMs;
    });
  }, [nowMs, visibleFollowedFixtures]);
  const followedUpcoming = useMemo(() => {
    return followedFeed.filter((item) => {
      if (!item.startsAt) return false;
      const time = new Date(item.startsAt).getTime();
      return !Number.isNaN(time) && Number.isFinite(nowMs) && time >= nowMs;
    });
  }, [followedFeed, nowMs]);
  // Prefer followed fixtures, then followed-venue screenings, then editorial.
  const nextUp =
    followedFixtureUpcoming[0] ??
    followedUpcoming[0] ??
    visibleFeed.find((item) => {
      if (!item.startsAt) return false;
      const time = new Date(item.startsAt).getTime();
      return !Number.isNaN(time) && Number.isFinite(nowMs) && time >= nowMs;
    });
  const followedFixtureRest = visibleFollowedFixtures.filter(
    (item) => item.id !== nextUp?.id,
  );
  const followedRest = followedFeed.filter((item) => item.id !== nextUp?.id);
  const followedRestIds = new Set([
    ...followedFixtureRest.map((item) => item.id),
    ...followedRest.map((item) => item.id),
  ]);
  const generalRest = visibleFeed.filter(
    (item) => item.id !== nextUp?.id && !followedRestIds.has(item.id),
  );
  const nextUpIsFollowedFixture = Boolean(nextUp?.followedFixture);
  const showPadel =
    active === ALL_SPORTS_SLUG || active === "padel";
  const stats = summarisePlayerHistory(historyItems, user.id);
  const activeSport =
    active === ALL_SPORTS_SLUG
      ? null
      : sports.find((sport) => sport.slug === active) ?? null;
  const recent = historyItems.slice(0, 8);
  const followedSet = new Set(prefs.followed);
  const activeSectionMeta =
    HUB_SECTIONS.find((item) => item.id === section) ?? HUB_SECTIONS[0];

  function focusSport(slug: string) {
    setPrefs(selectHubSport(prefs, slug, knownSlugs));
  }

  function unfollow(slug: string) {
    setPrefs(unfollowHubSport(prefs, slug, knownSlugs));
  }

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <FriendsSnapshotSeed snapshot={friends} />
      <h1 className="sr-only">Your hub</h1>

      <nav
        className="sticky top-16 z-40 border-b border-white/5 bg-[#0c0f0c]/90 backdrop-blur-xl"
        aria-label="Hub"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            id={sectionTablistId}
            role="tablist"
            aria-label="Hub sections"
            className="-mx-4 flex gap-1 overflow-x-auto px-4 py-2.5 sm:mx-0 sm:gap-2 sm:overflow-visible sm:px-0"
          >
            {HUB_SECTIONS.map((item) => {
              const Icon = item.icon;
              const selected = section === item.id;
              const badge =
                item.id === "friends" && friendRequestCount > 0
                  ? friendRequestCount
                  : null;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`hub-panel-${item.id}`}
                  id={`hub-tab-${item.id}`}
                  onClick={() => setSection(item.id)}
                  className={[
                    "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                    selected
                      ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-100"
                      : "border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/4 hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                  {badge ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 text-[11px] font-semibold text-zinc-950 tabular-nums">
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {section !== "friends" ? (
            <div className="border-t border-white/5 py-2.5">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Focus sport
              </p>
              <div
                id={tablistId}
                role="tablist"
                aria-label="Filter hub by sport"
                className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
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
                    count={
                      sport.slug === "padel"
                        ? padelLocked
                        : sport.slug === "golf"
                          ? golfLocked
                          : undefined
                    }
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
          ) : null}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div
          role="tabpanel"
          id={`hub-panel-${section}`}
          aria-labelledby={`hub-tab-${section}`}
        >
          {section === "for-you" ? (
            <div className="mx-auto max-w-3xl">
              <SectionHeading
                title={activeSport ? `${activeSport.name} feed` : "Up next"}
                description={activeSectionMeta.description}
              />

              {nextUp ? (
                <Link
                  href={nextUp.href}
                  className="group mb-4 block overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-5 transition-colors hover:border-emerald-400/40 sm:p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    {nextUpIsFollowedFixture
                      ? "Game you're following · "
                      : nextUp.venueSlug &&
                          followedSlugs.includes(nextUp.venueSlug)
                        ? "From venues you follow · "
                        : "Next up · "}
                    {feedKindLabel(nextUp.kind)}
                  </p>
                  <h3 className="mt-2 font-display text-3xl tracking-wide text-white sm:text-4xl">
                    {nextUp.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {nextUp.subtitle}
                    {nextUp.startsAt
                      ? ` · ${formatHubWhen(nextUp.startsAt)}`
                      : ""}
                  </p>
                </Link>
              ) : null}

              {followedFixtureRest.length > 0 ? (
                <div className="mb-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Flag
                      className="h-3.5 w-3.5 text-emerald-300"
                      aria-hidden
                    />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Games you&apos;re following
                    </p>
                  </div>
                  <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-emerald-400/15 bg-[#141814]">
                    {followedFixtureRest.slice(0, 6).map((item) => {
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
                                Fixture
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
                </div>
              ) : followedFixtureCount > 0 &&
                visibleFollowedFixtures.length === 0 ? (
                <p className="mb-4 text-sm leading-relaxed text-zinc-500">
                  Games you follow will show here when kickoff details are
                  available.{" "}
                  <Link
                    href="/events"
                    className="font-medium text-emerald-300 hover:text-emerald-200"
                  >
                    Browse fixtures
                  </Link>
                </p>
              ) : null}

              {followedVenues.length > 0 && followedRest.length > 0 ? (
                <div className="mb-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Heart
                      className="h-3.5 w-3.5 fill-emerald-300 text-emerald-300"
                      aria-hidden
                    />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      From venues you follow
                    </p>
                  </div>
                  <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-emerald-400/15 bg-[#141814]">
                    {followedRest.slice(0, 4).map((item) => {
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
                </div>
              ) : followedVenues.length > 0 && followedFeed.length === 0 ? (
                <p className="mb-4 text-sm leading-relaxed text-zinc-500">
                  No upcoming screenings from venues you follow yet. Check back
                  when they post fixtures.
                </p>
              ) : null}

              {generalRest.length > 0 ? (
                <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
                  {generalRest.slice(0, 8).map((item) => {
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
              ) : !nextUp &&
                followedRest.length === 0 &&
                followedFixtureRest.length === 0 ? (
                <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 sm:px-8">
                  <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                    {activeSport
                      ? `Nothing in the ${activeSport.name} feed yet. Jump to Tools to watch or play.`
                      : "Follow sports in onboarding or Focus, or follow a fixture on Events — matching games land here."}
                  </p>
                  {utilities[0] ? (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href="/events"
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                      >
                        Browse fixtures
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSection("tools")}
                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white hover:bg-white/5"
                      >
                        Browse tools
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/events"
                      className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                    >
                      Browse fixtures
                    </Link>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {section === "tools" ? (
            <div>
              <SectionHeading
                title={
                  activeSport
                    ? `${activeSport.name} tools`
                    : "What do you need?"
                }
                description={
                  activeSport
                    ? `Utilities for watching, playing, and tracking ${activeSport.name.toLowerCase()}.`
                    : "Start a match, find a venue, or jump into whatever you follow."
                }
              />

              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-8">
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                </div>

                <div className="lg:col-span-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Heart
                      className="h-3.5 w-3.5 fill-emerald-300 text-emerald-300"
                      aria-hidden
                    />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Followed venues
                    </p>
                  </div>
                  {followedVenues.length > 0 ? (
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
                  ) : (
                    <div className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-5">
                      <p className="text-sm leading-relaxed text-zinc-400">
                        Follow a venue from its listing and it will show up here
                        — with upcoming screenings in your feed.
                      </p>
                      <Link
                        href="/venues"
                        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                      >
                        Find venues
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Keep FriendsPanel mounted so accept/decline/add survive section switches. */}
          <div
            className={
              section === "friends" ? "mx-auto max-w-2xl" : "hidden"
            }
            hidden={section !== "friends"}
            inert={section !== "friends" ? true : undefined}
            aria-hidden={section !== "friends"}
          >
            <SectionHeading
              title="Your circle"
              description={
                HUB_SECTIONS.find((item) => item.id === "friends")
                  ?.description ?? activeSectionMeta.description
              }
              action={
                <Link
                  href="/communities"
                  className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
                >
                  Discover communities
                </Link>
              }
            />
            <CommunitiesPanel initial={myCommunities} className="mb-8" />
            <FriendsPanel
              initial={friends}
              className="mt-0"
              showHeading={false}
              onIncomingCountChange={setFriendRequestCount}
            />
          </div>

          {section === "progress" ? (
            <div>
              <SectionHeading
                title={
                  showPadel ? "Form and milestones" : "Badges and activity"
                }
                description={
                  showPadel
                    ? "Recent padel form, training plans, connected services, earned badges, and locked matches."
                    : "Milestones you’ve unlocked across the sports you play."
                }
                action={
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl tracking-wide text-white tabular-nums">
                        {gamesKnown ? gamesPlayed : "—"}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Games
                      </span>
                    </div>
                    {activityError ? (
                      <p className="max-w-[14rem] text-[11px] leading-snug text-amber-300/90 sm:text-right">
                        Couldn’t load all activity
                      </p>
                    ) : null}
                    {showPadel && historyItems.length > 0 ? (
                      <Link
                        href="/padel/history"
                        className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                      >
                        View all history
                      </Link>
                    ) : null}
                  </div>
                }
              />

              <IntegrationsPanel
                initial={integrations}
                className="mb-10"
              />

              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="space-y-8 lg:col-span-5">
                  {showPadel ? (
                    <>
                      <PadelProgressSummary
                        stats={stats}
                        variant="hub"
                        flush
                      />
                      <TrainingPanel initial={training} className="mt-0" />
                    </>
                  ) : (
                    <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
                      <p className="text-sm leading-relaxed text-zinc-400">
                        Switch the sport filter to Padel to see match form, or
                        keep collecting badges across every sport you play.
                      </p>
                      <button
                        type="button"
                        onClick={() => focusSport("padel")}
                        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                      >
                        Focus padel
                      </button>
                    </div>
                  )}
                  <BadgesPanel
                    initial={badges}
                    padelStats={stats}
                    golfLocked={golfLocked}
                    friendCount={friends.friends.length}
                    className="mt-0"
                  />
                </div>

                <div className="lg:col-span-7">
                  {showPadel ? (
                    <>
                      <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                          Padel
                        </p>
                        <h3 className="mt-1 font-display text-2xl tracking-wide text-white">
                          Locked matches
                        </h3>
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
                            No locked padel matches yet. Start a match, play it
                            out, and end the scorecard — only locked results
                            land here.
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
                    </>
                  ) : (
                    <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 sm:px-8">
                      <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                        Locked match history shows up when Padel is in focus.
                        Use Tools for other sports’ scorecards and calendars.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSection("tools")}
                        className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                      >
                        Open tools
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
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
