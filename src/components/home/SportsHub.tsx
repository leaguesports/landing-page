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
  HUB_GOLF_HISTORY_HREF,
  HUB_INTEGRATIONS_HREF,
  HUB_PADEL_HISTORY_HREF,
  HUB_PEOPLE_PREVIEW_LIMIT,
  HUB_RECENT_LOCK_LIMIT,
  HUB_TABS,
  HUB_TRAINING_HREF,
  hubConnectedCount,
  hubPlayIntentCtas,
  hubPlayNearbyHref,
  hubSearchHref,
  hubShowsSportControl,
  takeHubPreview,
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
  ChevronDown,
  Flag,
  Heart,
  Home,
  Search,
  Sparkles,
  Trophy,
  Tv,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";

const HUB_PREFS_EVENT = "leaguesports-hub-prefs";

const HUB_CONTROL =
  "min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] text-sm text-white outline-none focus:border-emerald-400/40";

function HubTabIcon({ id }: { id: HubTabId }) {
  if (id === "home") return <Home className="h-5 w-5" aria-hidden />;
  if (id === "play") return <Trophy className="h-5 w-5" aria-hidden />;
  if (id === "people") return <Users className="h-5 w-5" aria-hidden />;
  return <User className="h-5 w-5" aria-hidden />;
}

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
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:mb-6">
      <div className="min-w-0">
        <h2
          id={id}
          className="font-display text-2xl tracking-wide text-white"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-400 lg:max-w-2xl">
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

function feedKindLabel(kind: HubFeedItem["kind"]): string {
  if (kind === "event") return "Event";
  if (kind === "screening") return "Screening";
  return "Guide";
}

function FeedKindIcon({ kind }: { kind: HubFeedItem["kind"] }) {
  if (kind === "event") {
    return <Calendar className="h-4 w-4" aria-hidden />;
  }
  if (kind === "screening") {
    return <Tv className="h-4 w-4" aria-hidden />;
  }
  return <BookOpen className="h-4 w-4" aria-hidden />;
}

function FeedRow({ item }: { item: HubFeedItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/3 sm:px-6"
      >
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-zinc-300">
          <FeedKindIcon kind={item.kind} />
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

function HubSportControl({
  active,
  sports,
  onChange,
}: {
  active: string;
  sports: SportDefinition[];
  onChange: (slug: string) => void;
}) {
  return (
    <label className="relative block min-w-0 lg:w-56 lg:shrink-0">
      <span className="sr-only">Filter hub by sport</span>
      <select
        value={active}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Filter hub by sport"
        className={`${HUB_CONTROL} appearance-none px-4 pr-10`}
      >
        <option value={ALL_SPORTS_SLUG}>All sports</option>
        {sports.map((sport) => (
          <option key={sport.slug} value={sport.slug}>
            {sport.name}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
        aria-hidden
      />
    </label>
  );
}

function HubSearch({
  query,
  onQueryChange,
  onSubmit,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const searchId = useId();
  return (
    <form onSubmit={onSubmit} className="relative min-w-0 flex-1" role="search">
      <label className="sr-only" htmlFor={searchId}>
        Search venues, play, and watch
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
        aria-hidden
      />
      <input
        id={searchId}
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search venues, play, watch…"
        autoComplete="off"
        className={`${HUB_CONTROL} px-4 pl-10 placeholder:text-zinc-600`}
      />
    </form>
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
  const router = useRouter();
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
  const [searchQuery, setSearchQuery] = useState("");
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
  const playIntentCtas = hubPlayIntentCtas(active);
  const youHistoryEmpty =
    recentPadel.length === 0 &&
    !historyError &&
    recentGolf.length === 0 &&
    !golfHistoryError;

  function focusSport(slug: string) {
    setPrefs(selectHubSport(prefs, slug, knownSlugs));
  }

  function submitHubSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(hubSearchHref(searchQuery, active));
  }

  const forYouEmpty =
    !nextUp &&
    followedRest.length === 0 &&
    followedFixtureRest.length === 0 &&
    generalRest.length === 0;

  return (
    <div className="min-h-screen bg-[#0c0f0c] pb-[calc(5.75rem+env(safe-area-inset-bottom))] text-white lg:pb-[calc(6.25rem+env(safe-area-inset-bottom))]">
      <FriendsSnapshotSeed snapshot={friends} />
      <h1 className="sr-only">Your hub</h1>

      <div className="sticky top-16 z-30 border-b border-white/5 bg-[#0c0f0c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-3 sm:px-6 lg:max-w-5xl lg:flex-row lg:items-center lg:gap-3 lg:px-8">
          {showSportControl ? (
            <HubSportControl
              active={active}
              sports={sports}
              onChange={focusSport}
            />
          ) : null}
          <HubSearch
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSubmit={submitHubSearch}
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:max-w-5xl lg:px-8 lg:py-10">
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
                  className="group mb-4 block overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-5 transition-colors hover:border-emerald-400/40 sm:p-6 lg:p-7"
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
                    {HUB_FOR_YOU_EMPTY_CTAS.map((cta, index) => (
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
                    ))}
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
                description={
                  activeSport
                    ? `Decide what ${activeSport.name.toLowerCase()} to play.`
                    : "Decide what to play — start a match or a round."
                }
              />

              {playIntentCtas.length > 0 ? (
                <ul
                  className={
                    playIntentCtas.length > 1
                      ? "grid gap-3 lg:grid-cols-2 lg:gap-4"
                      : "grid gap-3"
                  }
                >
                  {playIntentCtas.map((cta, index) => (
                    <li key={cta.href}>
                      <Link
                        href={cta.href}
                        className={[
                          "group flex h-full flex-col justify-between gap-4 rounded-3xl border px-5 py-6 transition-colors sm:px-6 lg:px-7 lg:py-7",
                          index === 0
                            ? "border-emerald-400/25 bg-emerald-400/8 hover:border-emerald-400/45"
                            : "border-white/8 bg-[#141814] hover:border-white/16",
                        ].join(" ")}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-emerald-200">
                          {cta.sport === "golf" ? (
                            <Flag className="h-4 w-4" aria-hidden />
                          ) : (
                            <Trophy className="h-4 w-4" aria-hidden />
                          )}
                        </span>
                        <span>
                          <span className="block font-display text-3xl tracking-wide text-white">
                            {cta.label}
                          </span>
                          <span className="mt-1.5 block text-sm leading-relaxed text-zinc-400">
                            {cta.description}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 sm:px-8">
                  <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                    {activeSport
                      ? `No scorecard for ${activeSport.name} yet. Find a place to play nearby.`
                      : "Find a place to play nearby."}
                  </p>
                  <div className="mt-5">
                    <Link
                      href={hubPlayNearbyHref(active)}
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                    >
                      Find a place to play
                    </Link>
                  </div>
                </div>
              )}
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
                description="Identity, form, badges, and recent locks."
              />

              <div className="lg:grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
                <div>
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
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
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
                </div>

                <div className="mt-10 lg:mt-0">
                  <div className="mb-5">
                    <h3 className="font-display text-xl tracking-wide text-white">
                      Recent locks
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                      Locked padel matches and golf rounds.
                    </p>
                  </div>

                  <div className="space-y-8 lg:space-y-6">
                    <div>
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
                        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-6 sm:px-8">
                          <p className="text-sm text-red-300">{historyError}</p>
                        </div>
                      ) : recentPadel.length > 0 ? (
                        <PadelHistoryList
                          items={recentPadel}
                          playerUserId={user.id}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-zinc-500">
                          No locked padel matches yet.
                        </p>
                      )}
                    </div>

                    <div>
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
                          <p className="text-sm text-red-300">
                            {golfHistoryError}
                          </p>
                        </div>
                      ) : recentGolf.length > 0 ? (
                        <GolfHistoryList items={recentGolf} />
                      ) : (
                        <p className="text-sm leading-relaxed text-zinc-500">
                          No locked golf rounds yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {youHistoryEmpty ? (
                    <p className="mt-6 text-sm leading-relaxed text-zinc-500">
                      Start a match or round from{" "}
                      <button
                        type="button"
                        onClick={() => setTab("play")}
                        className="font-medium text-emerald-300 hover:text-emerald-200"
                      >
                        Play
                      </button>{" "}
                      to lock a result here.
                    </p>
                  ) : null}
                </div>
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
        <nav
          id={tablistId}
          role="tablist"
          aria-label="Hub"
          className="mx-auto grid max-w-none grid-cols-4 pb-[max(0.4rem,env(safe-area-inset-bottom))] lg:max-w-xl"
        >
          {HUB_TABS.map((item) => {
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
                <HubTabIcon id={item.id} />
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
