"use client";

import { BadgesPanel } from "@/components/home/BadgesPanel";
import type { BadgesSnapshot } from "@/lib/badges/api";
import { CommunitiesPanel } from "@/components/home/CommunitiesPanel";
import { FriendsPanel } from "@/components/home/FriendsPanel";
import { HubBottomNav } from "@/components/hub/HubBottomNav";
import { TeamsPanel } from "@/components/home/TeamsPanel";
import { FriendsSnapshotSeed } from "@/components/providers/AppSessionProvider";
import { DartsHistoryList } from "@/components/darts/DartsHistoryList";
import { GolfHandicapIndexField } from "@/components/golf/GolfHandicapIndexField";
import { GolfHistoryList } from "@/components/golf/GolfHistoryList";
import { PadelHistoryList } from "@/components/padel/PadelHistoryList";
import type { AuthUser } from "@/lib/api-client";
import {
  athleteDisplayName,
  athleteHandle,
} from "@/lib/athletes/overview";
import type { MyCommunity } from "@/lib/communities/communities";
import {
  emptyTeamsSnapshot,
  type TeamsSnapshot,
} from "@/lib/teams/teams";
import {
  emptyIntegrationsSnapshot,
  type IntegrationsSnapshot,
} from "@/lib/integrations/integrations";
import {
  emptyFriendsSnapshot,
  type FriendsSnapshot,
} from "@/lib/friends/friends";
import {
  type OrganisedGamesSnapshot,
} from "@/lib/organised-games/organised-games";
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
  HUB_DARTS_HISTORY_HREF,
  HUB_FOR_YOU_EMPTY_CTAS,
  HUB_GOLF_HISTORY_HREF,
  HUB_INTEGRATIONS_HREF,
  HUB_PADEL_HISTORY_HREF,
  HUB_PEOPLE_PREVIEW_LIMIT,
  HUB_PLAY_HREF,
  HUB_RECENT_LOCK_LIMIT,
  HUB_TRAINING_HREF,
  hubConnectedCount,
  hubSearchHref,
  hubShowsSportControl,
  parseHubTabParam,
  takeHubPreview,
  type HubTabId,
} from "@/lib/sports/hub-ia";
import {
  filterFeedByVenueSlugs,
  formatHubWhen,
  type HubFeedItem,
} from "@/lib/sports/hub-feed";
import type { DartsHistoryItem } from "@/types/darts-match";
import type { GolfHistoryItem } from "@/types/golf-round";
import type { PadelHistoryItem } from "@/types/padel-match";
import type { FollowedVenue } from "@/lib/venues/follow";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  Flag,
  Heart,
  ListFilter,
  Search,
  Sparkles,
  Tv,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const HUB_PREFS_EVENT = "leaguesports-hub-prefs";

const HUB_ICON_BTN =
  "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#101410] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/8 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50";

const HUB_ICON_BTN_ACTIVE =
  "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-400/10 text-emerald-200 transition-colors hover:border-emerald-400/50 hover:bg-emerald-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50";

const HUB_CONTROL =
  "min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] text-sm text-white outline-none focus:border-emerald-400/40";

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
  darts?: number;
  /** Set when a padel, golf, or darts lookup failed — Games must not look certain. */
  error: string | null;
};

type SportsHubProps = {
  user: AuthUser;
  historyError: string | null;
  historyItems: PadelHistoryItem[];
  golfHistoryError?: string | null;
  golfHistoryItems?: GolfHistoryItem[];
  dartsHistoryError?: string | null;
  dartsHistoryItems?: DartsHistoryItem[];
  /** Prefer this over shipping full golf history into the client hub. */
  lockedActivity?: LockedActivityCounts;
  followedVenues?: FollowedVenue[];
  /** Resolved fixtures the user follows — personal broadcast calendar (#106). */
  followedFixtures?: HubFeedItem[];
  /** Raw follow count from the API (may exceed resolved CMS rows). */
  followedFixtureCount?: number;
  friends?: FriendsSnapshot;
  organisedGames?: OrganisedGamesSnapshot;
  /** Prefetched `GET /api/me/communities` — empty on failure. */
  myCommunities?: MyCommunity[];
  /** Prefetched `GET /api/teams` — empty on failure. */
  myTeams?: TeamsSnapshot;
  /** Prefetched `GET /api/me/integrations` — connectable providers only. */
  integrations?: IntegrationsSnapshot;
  badges?: BadgesSnapshot;
  sports: SportDefinition[];
  feed: HubFeedItem[];
  nowIso: string;
  /** Server-backed sport follows from `/api/me/preferences`. */
  initialFollowedSports?: string[];
  initialActiveSport?: string | null;
  /** `?tab=` on `/` — Play is a route and is ignored here. */
  initialTab?: string | null;
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

function HubModal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <div
        aria-hidden
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative z-10 flex max-h-[min(32rem,85vh)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#141814] shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/8 px-5 py-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-2xl tracking-wide text-white"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-1 text-sm leading-relaxed text-zinc-500"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/4 text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
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
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const filtered = active !== ALL_SPORTS_SLUG;
  const activeName =
    sports.find((sport) => sport.slug === active)?.name ?? "All sports";

  function pickSport(slug: string) {
    onChange(slug);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          filtered
            ? `Filter hub by sport, ${activeName} selected`
            : "Filter hub by sport"
        }
        onClick={() => setOpen(true)}
        className={filtered ? HUB_ICON_BTN_ACTIVE : HUB_ICON_BTN}
      >
        <ListFilter className="h-4 w-4" aria-hidden />
        {filtered ? (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
        ) : null}
      </button>

      <HubModal
        open={open}
        onClose={() => setOpen(false)}
        title="Filter by sport"
        description="Scopes Home, Play, and search."
      >
        <div id={panelId} className="p-2">
          <ul className="space-y-0.5" role="listbox" aria-label="Sports">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={active === ALL_SPORTS_SLUG}
                onClick={() => pickSport(ALL_SPORTS_SLUG)}
                className={[
                  "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-colors",
                  active === ALL_SPORTS_SLUG
                    ? "bg-emerald-400/10 text-emerald-100"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                <span>All sports</span>
                {active === ALL_SPORTS_SLUG ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                ) : null}
              </button>
            </li>
            {sports.map((sport) => {
              const selected = active === sport.slug;
              return (
                <li key={sport.slug}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => pickSport(sport.slug)}
                    className={[
                      "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-colors",
                      selected
                        ? "bg-emerald-400/10 text-emerald-100"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <span>{sport.name}</span>
                    {selected ? (
                      <Check
                        className="h-4 w-4 shrink-0 text-emerald-300"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </HubModal>
    </>
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
  const [open, setOpen] = useState(false);
  const searchId = useId();
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    onSubmit(event);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Search venues, play, and watch"
        onClick={() => setOpen(true)}
        className={query.trim() ? HUB_ICON_BTN_ACTIVE : HUB_ICON_BTN}
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>

      <HubModal
        open={open}
        onClose={() => setOpen(false)}
        title="Search"
        description="Find venues, play, and watch."
      >
        <form
          id={panelId}
          onSubmit={handleSubmit}
          className="space-y-4 p-5"
          role="search"
        >
          <label className="sr-only" htmlFor={searchId}>
            Search venues, play, and watch
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <input
              ref={inputRef}
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Venues, play, watch…"
              autoComplete="off"
              className={`${HUB_CONTROL} px-4 pl-10 placeholder:text-zinc-600`}
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
          >
            Search
          </button>
        </form>
      </HubModal>
    </>
  );
}

export function SportsHub({
  user,
  historyError,
  historyItems,
  golfHistoryError = null,
  golfHistoryItems = [],
  dartsHistoryError = null,
  dartsHistoryItems = [],
  lockedActivity,
  followedVenues = [],
  followedFixtures = [],
  followedFixtureCount = 0,
  friends = emptyFriendsSnapshot(),
  organisedGames: _organisedGames = undefined,
  myCommunities = [],
  myTeams = emptyTeamsSnapshot(),
  integrations = emptyIntegrationsSnapshot(),
  badges = { badges: [], fromApi: false },
  sports,
  feed,
  nowIso,
  initialFollowedSports = [],
  initialActiveSport = null,
  initialTab = null,
}: SportsHubProps) {
  const router = useRouter();
  const knownSlugs = useMemo(() => sports.map((sport) => sport.slug), [sports]);
  const padelLocked = lockedActivity?.padel ?? historyItems.length;
  const golfLocked = lockedActivity?.golf ?? golfHistoryItems.length;
  const dartsLocked = lockedActivity?.darts ?? dartsHistoryItems.length;
  const activityError = lockedActivity?.error ?? historyError;
  const gamesKnown = !activityError;
  const gamesPlayed = padelLocked + golfLocked + dartsLocked;
  const seedFollowed = useMemo(() => {
    const seeds: string[] = [...initialFollowedSports];
    if (padelLocked > 0) seeds.push("padel");
    if (golfLocked > 0) seeds.push("golf");
    if (dartsLocked > 0) seeds.push("darts");
    return seeds;
  }, [dartsLocked, golfLocked, initialFollowedSports, padelLocked]);
  const [prefs, setPrefs] = useHubPreferences(
    user.id,
    knownSlugs,
    seedFollowed,
    initialActiveSport,
  );
  const [tab, setTab] = useState<HubTabId>(() => parseHubTabParam(initialTab));
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
  const recentDarts = takeHubPreview(dartsHistoryItems, HUB_RECENT_LOCK_LIMIT);
  const displayName = athleteDisplayName(user);
  const handle = athleteHandle(user);
  const connectedCount = hubConnectedCount(integrations.providers);
  const showSportControl = hubShowsSportControl(tab);
  const youHistoryEmpty =
    recentPadel.length === 0 &&
    !historyError &&
    recentGolf.length === 0 &&
    !golfHistoryError &&
    recentDarts.length === 0 &&
    !dartsHistoryError;

  function selectTab(id: HubTabId) {
    if (id === "play") return;
    setTab(id);
  }

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
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5 sm:px-6 lg:max-w-5xl lg:px-8">
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
                    <GolfHandicapIndexField />
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
                      Locked padel, golf, and darts results.
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

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                          Darts
                        </p>
                        {dartsHistoryItems.length > 0 ? (
                          <Link
                            href={HUB_DARTS_HISTORY_HREF}
                            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                          >
                            View all
                          </Link>
                        ) : null}
                      </div>
                      {dartsHistoryError ? (
                        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-6 sm:px-8">
                          <p className="text-sm text-red-300">
                            {dartsHistoryError}
                          </p>
                        </div>
                      ) : recentDarts.length > 0 ? (
                        <DartsHistoryList
                          items={recentDarts}
                          playerUserId={user.id}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-zinc-500">
                          No locked darts games yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {youHistoryEmpty ? (
                    <p className="mt-6 text-sm leading-relaxed text-zinc-500">
                      Start or capture a result from{" "}
                      <Link
                        href={HUB_PLAY_HREF}
                        className="font-medium text-emerald-300 hover:text-emerald-200"
                      >
                        Play
                      </Link>{" "}
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
              description="Friends, communities, and teams — short lists, then See all."
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
          <TeamsPanel
            initial={myTeams}
            compact
            previewLimit={HUB_PEOPLE_PREVIEW_LIMIT}
            className="mt-8"
            hubSport={active}
          />
        </div>
      </div>

      <HubBottomNav
        active={tab}
        friendRequestCount={friendRequestCount}
        onSelectTab={selectTab}
      />
    </div>
  );
}
