"use client";

import { SportIcon } from "@/components/icons/sports";
import {
  lookupOnboardingVenues,
  type OnboardingVenueOption,
} from "@/app/onboarding/actions";
import {
  requestFriend,
  type FriendUser,
} from "@/lib/friends/friends";
import {
  searchUsers,
  type UserSearchResult,
} from "@/lib/friends/search";
import { updatePreferences } from "@/lib/preferences/preferences";
import { SPORT_CATALOG, type SportDefinition } from "@/lib/sports/catalog";
import { followVenue } from "@/lib/venues/follow";
import {
  ArrowRight,
  Check,
  LoaderCircle,
  MapPin,
  Search,
  SkipForward,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useState,
  useTransition,
  type FormEvent,
} from "react";

type Step = "sports" | "venues" | "friends";

const STEPS: { id: Step; title: string; blurb: string }[] = [
  {
    id: "sports",
    title: "Pick your sports",
    blurb: "We’ll tune your hub, venues, and fixtures around what you follow.",
  },
  {
    id: "venues",
    title: "Favourite venues",
    blurb: "Follow courts, clubs, and watch spots so they surface first.",
  },
  {
    id: "friends",
    title: "Find friends",
    blurb: "Search by name or @handle and send a request to play together.",
  },
];

type OnboardingWizardProps = {
  displayName: string;
  sports?: SportDefinition[];
};

export function OnboardingWizard({
  displayName,
  sports = SPORT_CATALOG,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("sports");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<OnboardingVenueOption[]>(
    [],
  );
  const [venues, setVenues] = useState<OnboardingVenueOption[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [friendQuery, setFriendQuery] = useState("");
  const deferredQuery = useDeferredValue(friendQuery.trim());
  const [friendResults, setFriendResults] = useState<UserSearchResult[]>([]);
  const [friendSearchPending, setFriendSearchPending] = useState(false);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const stepIndex = STEPS.findIndex((item) => item.id === step);
  const current = STEPS[stepIndex]!;

  useEffect(() => {
    if (step !== "venues") return;
    let cancelled = false;
    setVenuesLoading(true);
    void lookupOnboardingVenues(selectedSports)
      .then((next) => {
        if (!cancelled) setVenues(next);
      })
      .catch(() => {
        if (!cancelled) setVenues([]);
      })
      .finally(() => {
        if (!cancelled) setVenuesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSports, step]);

  useEffect(() => {
    if (step !== "friends") return;
    if (deferredQuery.length < 2) {
      setFriendResults([]);
      setFriendSearchPending(false);
      return;
    }

    let cancelled = false;
    setFriendSearchPending(true);
    const handle = window.setTimeout(() => {
      void searchUsers(deferredQuery, 8).then((result) => {
        if (cancelled) return;
        setFriendSearchPending(false);
        if (result.ok) {
          setFriendResults(result.users);
          setError(null);
        } else {
          setFriendResults([]);
          setError(result.error);
        }
      });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [deferredQuery, step]);

  function toggleSport(slug: string) {
    setSelectedSports((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  }

  function toggleVenue(venue: OnboardingVenueOption) {
    setSelectedVenues((current) => {
      if (current.some((item) => item.cmsId === venue.cmsId)) {
        return current.filter((item) => item.cmsId !== venue.cmsId);
      }
      return [...current, venue];
    });
  }

  function goNext() {
    setError(null);
    setMessage(null);
    if (step === "sports") {
      if (selectedSports.length === 0) {
        setError("Pick at least one sport — or skip for now.");
        return;
      }
      setStep("venues");
      return;
    }
    if (step === "venues") {
      setStep("friends");
    }
  }

  function finish(mode: "complete" | "skip") {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const prefsResult = await updatePreferences({
        sports: selectedSports,
        activeSport:
          selectedSports.length === 1 ? selectedSports[0]! : selectedSports[0] ?? null,
        completeOnboarding: mode === "complete",
        skipOnboarding: mode === "skip",
      });

      if (!prefsResult.ok) {
        setError(prefsResult.error);
        return;
      }

      for (const venue of selectedVenues) {
        await followVenue({
          cmsId: venue.cmsId,
          name: venue.name,
          slug: venue.slug,
        });
      }

      router.replace("/");
      router.refresh();
    });
  }

  function onAddFriend(user: FriendUser) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await requestFriend(user.handle);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRequestedIds((current) =>
        current.includes(user.id) ? current : [...current, user.id],
      );
      setMessage(
        result.status === "accepted"
          ? `You’re now friends with @${user.handle}`
          : `Request sent to @${user.handle}`,
      );
    });
  }

  function onFriendSearchSubmit(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="animate-rise">
        <p className="font-display text-3xl tracking-wide text-white sm:text-4xl">
          LEAGUE
          <span className="text-[var(--color-brand)]">SPORTS</span>
        </p>
        <p className="mt-3 text-sm text-zinc-400">
          Welcome{displayName ? `, ${displayName.split(" ")[0]}` : ""}. A quick
          setup makes your feed feel like yours.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2" aria-label="Onboarding progress">
        {STEPS.map((item, index) => {
          const active = index === stepIndex;
          const done = index < stepIndex;
          return (
            <div key={item.id} className="flex flex-1 items-center gap-2">
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  active
                    ? "bg-[var(--color-brand)] text-zinc-950"
                    : done
                      ? "bg-emerald-400/20 text-emerald-300"
                      : "bg-white/8 text-zinc-500",
                ].join(" ")}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < STEPS.length - 1 ? (
                <div
                  className={[
                    "h-px flex-1",
                    done ? "bg-emerald-400/40" : "bg-white/10",
                  ].join(" ")}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <section className="mt-8 rounded-3xl border border-white/8 bg-[#141814] p-6 sm:p-8">
        <h1 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
          {current.title}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">{current.blurb}</p>

        {step === "sports" ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sports.map((sport) => {
              const selected = selectedSports.includes(sport.slug);
              return (
                <button
                  key={sport.slug}
                  type="button"
                  onClick={() => toggleSport(sport.slug)}
                  className={[
                    "flex min-h-24 flex-col items-start justify-between rounded-3xl border px-4 py-4 text-left transition-colors",
                    selected
                      ? "border-[var(--color-brand)]/50 bg-[var(--color-brand)]/10"
                      : "border-white/8 bg-white/3 hover:border-white/16",
                  ].join(" ")}
                >
                  <span className="text-[var(--color-brand)]">
                    <SportIcon sportSlug={sport.slug} />
                  </span>
                  <span className="mt-3 text-sm font-medium text-white">
                    {sport.name}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {step === "venues" ? (
          <div className="mt-6 space-y-3">
            {venuesLoading ? (
              <p className="flex items-center gap-2 text-sm text-zinc-400">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Finding venues for your sports…
              </p>
            ) : venues.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No venues matched yet — you can follow venues later from the
                directory.
              </p>
            ) : (
              venues.map((venue) => {
                const selected = selectedVenues.some(
                  (item) => item.cmsId === venue.cmsId,
                );
                return (
                  <button
                    key={venue.cmsId}
                    type="button"
                    onClick={() => toggleVenue(venue)}
                    className={[
                      "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-[var(--color-brand)]/50 bg-[var(--color-brand)]/10"
                        : "border-white/8 bg-white/3 hover:border-white/16",
                    ].join(" ")}
                  >
                    <span>
                      <span className="block text-sm font-medium text-white">
                        {venue.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3" />
                        {venue.city ?? "South Africa"}
                      </span>
                    </span>
                    {selected ? (
                      <Check className="h-4 w-4 text-[var(--color-brand)]" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        ) : null}

        {step === "friends" ? (
          <div className="mt-6 space-y-4">
            <form onSubmit={onFriendSearchSubmit} className="relative">
              <label className="sr-only" htmlFor="onboarding-friend-search">
                Search friends
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="onboarding-friend-search"
                value={friendQuery}
                onChange={(event) => setFriendQuery(event.target.value)}
                placeholder="Search by name or @handle"
                className="min-h-12 w-full rounded-full border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-[var(--color-brand)]/50 focus:outline-none"
              />
            </form>

            {friendSearchPending ? (
              <p className="flex items-center gap-2 text-sm text-zinc-400">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Searching…
              </p>
            ) : null}

            {!friendSearchPending &&
            deferredQuery.length >= 2 &&
            friendResults.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No players matched. Try another handle — friends can always be
                added later from the hub.
              </p>
            ) : null}

            <ul className="space-y-2">
              {friendResults.map((user) => {
                const already =
                  requestedIds.includes(user.id) ||
                  user.relationship === "friend" ||
                  user.relationship === "outgoing";
                return (
                  <li
                    key={user.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="h-10 w-10 rounded-full border border-white/10 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 font-display text-lg text-emerald-300">
                          {user.displayName.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-zinc-500">@{user.handle}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={pending || already}
                      onClick={() => onAddFriend(user)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/12 px-3 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {already ? (
                        <>
                          <Users className="h-3.5 w-3.5" />
                          {user.relationship === "friend" ? "Friends" : "Sent"}
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          Add
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm text-rose-300" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 text-sm text-emerald-300" role="status">
            {message}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => finish("skip")}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-50"
          >
            <SkipForward className="h-4 w-4" />
            Skip for now
          </button>

          {step !== "friends" ? (
            <button
              type="button"
              disabled={pending}
              onClick={goNext}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--color-brand)] px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => finish("complete")}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--color-brand)] px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-50"
            >
              {pending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : null}
              Finish setup
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
