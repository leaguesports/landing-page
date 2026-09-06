"use client";

import { BadgesPanel } from "@/components/home/BadgesPanel";
import type { BadgesSnapshot } from "@/lib/badges/api";
import { CommunitiesPanel } from "@/components/home/CommunitiesPanel";
import { FriendsPanel } from "@/components/home/FriendsPanel";
import { FriendsSnapshotSeed } from "@/components/providers/AppSessionProvider";
import { GolfHistoryList } from "@/components/golf/GolfHistoryList";
import { PadelHistoryList } from "@/components/padel/PadelHistoryList";
import type { AuthUser } from "@/lib/api-client";
import {
  athleteDisplayName,
  athleteHandle,
} from "@/lib/athletes/overview";
import type { MyCommunity } from "@/lib/communities/communities";
import {
  emptyIntegrationsSnapshot,
  type IntegrationsSnapshot,
} from "@/lib/integrations/integrations";
import {
  emptyFriendsSnapshot,
  type FriendsSnapshot,
} from "@/lib/friends/friends";
import { updatePreferences } from "@/lib/preferences/preferences";
import { summarisePlayerHistory } from "@/lib/padel/history";
import {
  ALL_SPORTS_SLUG,
  defaultHubPreferences,
  filterFeedBySport,
  hubStorageKey,
  parseHubPreferences,
  selectHubSport,
  serializeHubPreferences,
  type HubPreferences,
  type SportDefinition,
} from "@/lib/sports/catalog";
import {
  HUB_FOR_YOU_EMPTY_CTAS,
  HUB_DISCOVER_SEGMENTS,
  HUB_GOLF_HISTORY_HREF,
  HUB_INTEGRATIONS_HREF,
  HUB_PADEL_HISTORY_HREF,
  HUB_PEOPLE_PREVIEW_LIMIT,
  HUB_PLAY_EMPTY_CTAS,
  HUB_RECENT_LOCK_LIMIT,
  HUB_START_GOLF_HREF,
  HUB_START_MATCH_HREF,
  HUB_TABS,
  HUB_TRAINING_HREF,
  hubConnectedCount,
  hubDiscoverShortcuts,
  hubPlayShowsGolf,
  hubPlayShowsPadel,
  hubShowsSportControl,
  hubShowsStartActions,
  takeHubPreview,
  type HubDiscoverSegment,
  type HubTabId,
} from "@/lib/sports/hub-ia";
import {
  filterFeedByVenueSlugs,
  formatHubWhen,
  type HubFeedItem,
} from "@/lib/sports/hub-feed";
import type { GolfHistoryItem } from "@/types/golf-round";
import type { PadelHistoryItem } from "@/types/padel-match";
import type { FollowedVenue } from "@/lib/venues/follow";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Compass,
  Flag,
  Heart,
  Home,
  Sparkles,
  Trophy,
  Tv,
  User,
  Users,
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

const TAB_ICONS = {
  home: Home,
  play: Trophy,
  discover: Compass,
  people: Users,
  you: User,
} as const;

function SectionHeading({
  id,
  title,
  description,
  action,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2
          id={id}
          className="font-display text-2xl tracking-wide text-white"
        >
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

function HubAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote OAuth avatars
      <img
        src={avatarUrl}
        alt=""
        className="h-11 w-11 rounded-full border border-white/10 object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-lg text-emerald-300"
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
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
  golfHistoryError?: string | null;
  golfHistoryItems?: GolfHistoryItem[];
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

function FeedRow({ item }: { item: HubFeedItem }) {
  const Icon = feedIcon(item.kind);
  return (
    <li>
      <Link
        href={item.href}
        className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/3 sm:px-6"
      >
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-zinc-300">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            {item.followedFixture ? "Fixture" : feedKindLabel(item.kind)}
            {item.startsAt ? ` · ${formatHubWhen(item.startsAt)}` : ""}
          </p>
          <p className="mt-1 text-sm font-medium text-white">{item.title}</p>
          <p className="mt-1 text-sm text-zinc-500">{item.subtitle}</p>
        </div>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600" />
      </Link>
    </li>
  );
}

export function SportsHub({
  user,
  historyError,
  historyItems,
  golfHistoryError = null,
  golfHistoryItems = [],
  lockedActivity,
  followedVenues = [],
  followedFixtures = [],
  followedFixtureCount = 0,
  friends = emptyFriendsSnapshot(),
  myCommunities = [],
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
  const golfLocked = lockedActivity?.golf ?? golfHistoryItems.length;
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
  const [tab, setTab] = useState<HubTabId>("home");
  const [discoverSegment, setDiscoverSegment] =
    useState<HubDiscoverSegment>("play");
  const [friendRequestCount, setFriendRequestCount] = useState(
    () => friends.incoming.length,
  );
  const nowMs = new Date(nowIso).getTime();

  const active = prefs.active;
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
  const showPadelPlay = hubPlayShowsPadel(active);
  const showGolfPlay = hubPlayShowsGolf(active);
  const stats = summarisePlayerHistory(historyItems, user.id);
  const activeSport =
    active === ALL_SPORTS_SLUG
      ? null
      : sports.find((sport) => sport.slug === active) ?? null;
  const recentPadel = takeHubPreview(historyItems, HUB_RECENT_LOCK_LIMIT);
  const recentGolf = takeHubPreview(golfHistoryItems, HUB_RECENT_LOCK_LIMIT);
  const displayName = athleteDisplayName(user);
  const handle = athleteHandle(user);
  const connectedCount = hubConnectedCount(integrations.providers);
  const showSportControl = hubShowsSportControl(tab);
  const showStartActions = hubShowsStartActions(tab);
  const discoverShortcuts = hubDiscoverShortcuts(discoverSegment, active);
  const playEmpty =
    (!showPadelPlay || (recentPadel.length === 0 && !historyError)) &&
    (!showGolfPlay || (recentGolf.length === 0 && !golfHistoryError));

  function focusSport(slug: string) {
    setPrefs(selectHubSport(prefs, slug, knownSlugs));
  }

  const forYouEmpty =
    !nextUp &&
    followedRest.length === 0 &&
    followedFixtureRest.length === 0 &&
    generalRest.length === 0;

  return (
    <div
      className={[
        "min-h-screen bg-[#0c0f0c] text-white",
        showStartActions
          ? "pb-[calc(9.25rem+env(safe-area-inset-bottom))]"
          : "pb-[calc(5.75rem+env(safe-area-inset-bottom))]",
      ].join(" ")}
    >
      <FriendsSnapshotSeed snapshot={friends} />
      <h1 className="sr-only">Your hub</h1>

      {showSportControl ? (
        <div className="sticky top-16 z-30 border-b border-white/5 bg-[#0c0f0c]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
            <label className="min-w-0 flex-1">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Sport
              </span>
              <select
                value={active}
                onChange={(event) => focusSport(event.target.value)}
                aria-label="Filter hub by sport"
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                <option value={ALL_SPORTS_SLUG}>All sports</option>
                {sports.map((sport) => (
                  <option key={sport.slug} value={sport.slug}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {tab === "home" ? (
          <div
            role="tabpanel"
            id="hub-panel-home"
            aria-labelledby="hub-tab-home"
          >
            <section aria-labelledby="hub-for-you">
              <SectionHeading
                id="hub-for-you"
                title={activeSport ? `${activeSport.name} for you` : "For you"}
                description="Games you follow, venue screenings, and light nudges."
                action={
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/80">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Feed
                  </span>
                }
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
                    {followedFixtureRest.slice(0, 6).map((item) => (
                      <FeedRow key={item.id} item={item} />
                    ))}
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
                    {followedRest.slice(0, 4).map((item) => (
                      <FeedRow key={item.id} item={item} />
                    ))}
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
                  {generalRest.slice(0, 8).map((item) => (
                    <FeedRow key={item.id} item={item} />
                  ))}
                </ul>
              ) : forYouEmpty ? (
                <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 sm:px-8">
                  <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                    {activeSport
                      ? `Nothing in the ${activeSport.name} feed yet. Browse fixtures or find a venue.`
                      : "Follow sports in onboarding or the sport menu, or follow a fixture on Events — matching games land here."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {HUB_FOR_YOU_EMPTY_CTAS.map((cta, index) =>
                      "tab" in cta && cta.tab ? (
                        <button
                          key={cta.href}
                          type="button"
                          onClick={() => setTab(cta.tab)}
                          className={
                            index === 0
                              ? "inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                              : "inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white hover:bg-white/5"
                          }
                        >
                          {cta.label}
                        </button>
                      ) : (
                        <Link
                          key={cta.href}
                          href={cta.href}
                          className={
                            index === 0
                              ? "inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                              : "inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white hover:bg-white/5"
                          }
                        >
                          {cta.label}
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}

        {tab === "play" ? (
          <div
            role="tabpanel"
            id="hub-panel-play"
            aria-labelledby="hub-tab-play"
          >
            <section aria-labelledby="hub-play">
              <SectionHeading
                id="hub-play"
                title="Play"
                description="Start a match, resume a scorecard, and recent locks."
              />

              {showPadelPlay ? (
                <div className="mb-8">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Padel
                    </p>
                    {historyItems.length > 0 ? (
                      <Link
                        href={HUB_PADEL_HISTORY_HREF}
                        className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                      >
                        View all
                      </Link>
                    ) : null}
                  </div>
                  {historyError ? (
                    <div className="space-y-5 rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-6 sm:px-8">
                      <p className="text-sm text-red-300">{historyError}</p>
                      <Link
                        href={HUB_START_MATCH_HREF}
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                      >
                        Start a match anyway
                      </Link>
                    </div>
                  ) : recentPadel.length > 0 ? (
                    <PadelHistoryList
                      items={recentPadel}
                      playerUserId={user.id}
                    />
                  ) : showGolfPlay && recentGolf.length > 0 ? (
                    <p className="text-sm leading-relaxed text-zinc-500">
                      No locked padel matches yet.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {showGolfPlay ? (
                <div className="mb-8">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Golf
                    </p>
                    {golfHistoryItems.length > 0 ? (
                      <Link
                        href={HUB_GOLF_HISTORY_HREF}
                        className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                      >
                        View all
                      </Link>
                    ) : null}
                  </div>
                  {golfHistoryError ? (
                    <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-6 sm:px-8">
                      <p className="text-sm text-red-300">{golfHistoryError}</p>
                    </div>
                  ) : recentGolf.length > 0 ? (
                    <GolfHistoryList items={recentGolf} />
                  ) : showPadelPlay && recentPadel.length > 0 ? (
                    <p className="text-sm leading-relaxed text-zinc-500">
                      No locked golf rounds yet.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {playEmpty ? (
                <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 sm:px-8">
                  <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                    {activeSport
                      ? `No ${activeSport.name.toLowerCase()} scorecards yet. Start a match to lock a result.`
                      : "No locked scorecards yet. Start a match, play it out, and end the scorecard."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {HUB_PLAY_EMPTY_CTAS.map((cta) => (
                      <Link
                        key={cta.href}
                        href={cta.href}
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                      >
                        {cta.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}

        {tab === "discover" ? (
          <div
            role="tabpanel"
            id="hub-panel-discover"
            aria-labelledby="hub-tab-discover"
          >
            <section aria-labelledby="hub-discover">
              <SectionHeading
                id="hub-discover"
                title="Discover"
                description="Shortcuts to play and watch — open the full pages from here."
              />

              <div
                role="radiogroup"
                aria-label="Discover Play or Watch"
                className="mb-6 grid grid-cols-2 gap-2 rounded-full border border-white/8 bg-[#141814] p-1"
              >
                {HUB_DISCOVER_SEGMENTS.map((segment) => {
                  const selected = discoverSegment === segment.id;
                  return (
                    <button
                      key={segment.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setDiscoverSegment(segment.id)}
                      className={[
                        "inline-flex min-h-11 items-center justify-center rounded-full text-sm font-medium transition-colors",
                        selected
                          ? "bg-emerald-400 text-zinc-950"
                          : "text-zinc-400 hover:text-white",
                      ].join(" ")}
                    >
                      {segment.label}
                    </button>
                  );
                })}
              </div>

              <ul className="space-y-3">
                {discoverShortcuts.map((shortcut) => (
                  <li key={shortcut.href}>
                    <Link
                      href={shortcut.href}
                      className="group flex items-start justify-between gap-3 rounded-3xl border border-white/8 bg-[#141814] px-5 py-5 transition-colors hover:border-white/16"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-white group-hover:text-[var(--color-brand)]">
                          {shortcut.label}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-zinc-500">
                          {shortcut.description}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 group-hover:text-white"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}

        {tab === "you" ? (
          <div
            role="tabpanel"
            id="hub-panel-you"
            aria-labelledby="hub-tab-you"
          >
            <section aria-labelledby="hub-you">
              <SectionHeading
                id="hub-you"
                title="You"
                description="Identity, form, badges, and connected services."
              />

              <div className="mb-8 flex items-center gap-3">
                <HubAvatar name={displayName} avatarUrl={user.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate font-display text-2xl tracking-wide text-white">
                    {displayName}
                  </p>
                  {handle ? (
                    <p className="truncate text-sm text-zinc-500">{handle}</p>
                  ) : (
                    <p className="text-sm text-zinc-500">Your hub</p>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="font-display text-2xl tracking-wide text-white tabular-nums">
                    {gamesKnown ? gamesPlayed : "—"}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Games
                  </span>
                </div>
                {activityError ? (
                  <p className="mb-3 text-[11px] leading-snug text-amber-300/90">
                    Couldn’t load all activity
                  </p>
                ) : null}
                {stats.locked > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Locked", value: String(stats.locked) },
                      { label: "Wins", value: String(stats.wins) },
                      { label: "Win rate", value: `${stats.winRate}%` },
                      {
                        label: "Form",
                        value:
                          stats.recentForm.length > 0
                            ? stats.recentForm.join(" ")
                            : "—",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                          {stat.label}
                        </p>
                        <p className="mt-1.5 font-display text-xl tracking-wide text-white tabular-nums">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-zinc-500">
                    Lock a match to see form here.
                  </p>
                )}
              </div>

              <BadgesPanel
                initial={badges}
                padelStats={stats}
                golfLocked={golfLocked}
                friendCount={friends.friends.length}
                variant="strip"
                className="mt-0"
              />

              <div className="mt-8 space-y-3">
                <Link
                  href={HUB_INTEGRATIONS_HREF}
                  className="flex items-center justify-between gap-3 rounded-3xl border border-white/8 bg-[#141814] px-5 py-4 text-sm font-medium text-white transition-colors hover:border-white/16"
                >
                  <span>
                    {connectedCount > 0
                      ? `Connected · ${connectedCount}`
                      : "Connected services"}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-zinc-600"
                    aria-hidden
                  />
                </Link>
                <Link
                  href={HUB_TRAINING_HREF}
                  className="flex items-center justify-between gap-3 rounded-3xl border border-white/8 bg-[#141814] px-5 py-4 text-sm font-medium text-white transition-colors hover:border-white/16"
                >
                  <span>Training</span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-zinc-600"
                    aria-hidden
                  />
                </Link>
              </div>
            </section>
          </div>
        ) : null}

        {/* Keep FriendsPanel mounted so accept/decline/add survive tab switches. */}
        <div
          role="tabpanel"
          id="hub-panel-people"
          aria-labelledby="hub-tab-people"
          className={tab === "people" ? "mt-0" : "hidden"}
          hidden={tab !== "people"}
          inert={tab !== "people" ? true : undefined}
          aria-hidden={tab !== "people"}
        >
          {tab === "people" ? (
            <SectionHeading
              id="hub-people"
              title="People"
              description="Friends and communities — short lists, then See all."
              action={
                friendRequestCount > 0 ? (
                  <span className="inline-flex items-center gap-2 text-sm text-emerald-200">
                    <Users className="h-4 w-4" aria-hidden />
                    {friendRequestCount} request
                    {friendRequestCount === 1 ? "" : "s"}
                  </span>
                ) : (
                  <Link
                    href="/communities"
                    className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
                  >
                    Discover communities
                  </Link>
                )
              }
            />
          ) : null}
          <CommunitiesPanel
            initial={myCommunities}
            compact
            previewLimit={HUB_PEOPLE_PREVIEW_LIMIT}
            className="mb-8"
          />
          <FriendsPanel
            initial={friends}
            compact
            previewLimit={HUB_PEOPLE_PREVIEW_LIMIT}
            className="mt-0"
            showHeading
            onIncomingCountChange={setFriendRequestCount}
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#0c0f0c]/95 backdrop-blur-xl">
        {showStartActions ? (
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
            <Link
              href={HUB_START_MATCH_HREF}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 sm:flex-none"
            >
              Start a match
            </Link>
            <Link
              href={HUB_START_GOLF_HREF}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white hover:text-zinc-950"
            >
              Start a round
            </Link>
          </div>
        ) : null}

        <nav
          id={tablistId}
          role="tablist"
          aria-label="Hub"
          className="grid grid-cols-5 pb-[max(0.4rem,env(safe-area-inset-bottom))]"
        >
          {HUB_TABS.map((item) => {
            const Icon = TAB_ICONS[item.id];
            const selected = tab === item.id;
            const badge =
              item.id === "people" && friendRequestCount > 0
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
                onClick={() => setTab(item.id)}
                className={[
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors",
                  selected ? "text-emerald-200" : "text-zinc-500 hover:text-white",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {item.label}
                {badge ? (
                  <span className="absolute top-1.5 right-[calc(50%-1.15rem)] inline-flex min-w-4 items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-semibold text-zinc-950 tabular-nums">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
