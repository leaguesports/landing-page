"use client";

import { CommunitiesPanel } from "@/components/home/CommunitiesPanel";
import { FriendsPanel } from "@/components/home/FriendsPanel";
import { HubBottomNav } from "@/components/hub/HubBottomNav";
import { FriendsSnapshotSeed } from "@/components/providers/AppSessionProvider";
import { GolfHandicapIndexField } from "@/components/golf/GolfHandicapIndexField";
import { VenueLeaderboardPreference } from "@/components/venue-leaderboards/VenueLeaderboardPreference";
import type { AuthUser } from "@/lib/api-client";
import {
  athleteDisplayName,
  athleteHandle,
} from "@/lib/athletes/overview";
import type { MyCommunity } from "@/lib/communities/communities";
import {
  emptyFriendsSnapshot,
  type FriendsSnapshot,
} from "@/lib/friends/friends";
import { updatePreferences } from "@/lib/preferences/preferences";
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
  HUB_PEOPLE_PREVIEW_LIMIT,
  hubEventsHref,
  hubForYouEmptyCtas,
  hubShowsSportControl,
  parseHubTabParam,
  type HubTabId,
} from "@/lib/sports/hub-ia";
import {
  filterFeedByVenueSlugs,
  formatHubWhen,
  type HubFeedItem,
} from "@/lib/sports/hub-feed";
import type { FollowedVenue } from "@/lib/venues/follow";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  Flag,
  Heart,
  ListFilter,
  Sparkles,
  Tv,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const HUB_PREFS_EVENT = "leaguesports-hub-prefs";

const HUB_ICON_BTN =
  "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#101410] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/8 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50";

const HUB_ICON_BTN_ACTIVE =
  "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-400/10 text-emerald-200 transition-colors hover:border-emerald-400/50 hover:bg-emerald-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50";

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

type SportsHubProps = {
  user: AuthUser;
  followedVenues?: FollowedVenue[];
  /** Resolved fixtures the user follows — personal broadcast calendar (#106). */
  followedFixtures?: HubFeedItem[];
  /** Raw follow count from the API (may exceed resolved CMS rows). */
  followedFixtureCount?: number;
  friends?: FriendsSnapshot;
  /** Prefetched `GET /api/me/communities` — empty on failure. */
  myCommunities?: MyCommunity[];
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
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
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
  }, [open]);

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
        description="Scopes Home and Play."
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

export function SportsHub({
  user,
  followedVenues = [],
  followedFixtures = [],
  followedFixtureCount = 0,
  friends = emptyFriendsSnapshot(),
  myCommunities = [],
  sports,
  feed,
  nowIso,
  initialFollowedSports = [],
  initialActiveSport = null,
  initialTab = null,
}: SportsHubProps) {
  const knownSlugs = useMemo(() => sports.map((sport) => sport.slug), [sports]);
  const seedFollowed = initialFollowedSports;
  const [prefs, setPrefs] = useHubPreferences(
    user.id,
    knownSlugs,
    seedFollowed,
    initialActiveSport,
  );
  const [tab, setTab] = useState<HubTabId>(() => parseHubTabParam(initialTab));
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
  const activeSport =
    active === ALL_SPORTS_SLUG
      ? null
      : sports.find((sport) => sport.slug === active) ?? null;
  const displayName = athleteDisplayName(user);
  const handle = athleteHandle(user);
  const showSportControl = hubShowsSportControl(tab);

  function selectTab(id: HubTabId) {
    if (id === "play") return;
    setTab(id);
  }

  function focusSport(slug: string) {
    setPrefs(selectHubSport(prefs, slug, knownSlugs));
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

      {showSportControl ? (
        <div className="sticky top-16 z-30 border-b border-white/5 bg-[#0c0f0c]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5 sm:px-6 lg:max-w-5xl lg:px-8">
            <HubSportControl
              active={active}
              sports={sports}
              onChange={focusSport}
            />
            <p className="truncate text-sm text-zinc-400">
              {activeSport ? activeSport.name : "All sports"}
            </p>
          </div>
        </div>
      ) : null}

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
                    href={hubEventsHref(active)}
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
                    {hubForYouEmptyCtas(active).map((cta, index) => (
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
                description="Your profile and preferences."
              />

              <div className="max-w-md">
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

                  <VenueLeaderboardPreference />
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
              description="Friends and communities."
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

      <HubBottomNav
        active={tab}
        friendRequestCount={friendRequestCount}
        onSelectTab={selectTab}
      />
    </div>
  );
}
