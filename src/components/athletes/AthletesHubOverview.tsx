import type { AuthUser } from "@/lib/api-client";
import { listBadges } from "@/lib/badges/api";
import {
  formatCommunitySport,
  formatMemberCount,
  listMyCommunities,
} from "@/lib/communities/communities";
import { listFriends } from "@/lib/friends/friends";
import { lookupPlayerGolfHistory } from "@/lib/golf/lookup-history";
import {
  formatProviderStatus,
  listIntegrations,
} from "@/lib/integrations/integrations";
import { lookupPlayerHistory } from "@/lib/padel/lookup-history";
import {
  activeEnrollment,
  listTrainingPlans,
  planById,
} from "@/lib/training/training";
import {
  ATHLETE_LIVE_HREFS,
  athleteDisplayName,
  athleteHandle,
  athletePaths,
} from "@/lib/athletes/overview";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type AthletesHubOverviewProps = {
  user: AuthUser;
  cookie: string;
};

export async function AthletesHubOverview({
  user,
  cookie,
}: AthletesHubOverviewProps) {
  const [
    padelHistory,
    golfHistory,
    friends,
    myCommunities,
    badges,
    training,
    integrations,
  ] = await Promise.all([
    lookupPlayerHistory(user.id, { cookie }),
    lookupPlayerGolfHistory(user.id, { cookie }),
    listFriends({ cookie }),
    listMyCommunities({ cookie }),
    listBadges({ cookie }),
    listTrainingPlans({ cookie }),
    listIntegrations({ cookie }),
  ]);

  const padelLocked = padelHistory.error ? null : padelHistory.items.length;
  const golfLocked = golfHistory.error ? null : golfHistory.items.length;
  const activityError =
    [padelHistory.error, golfHistory.error].filter(Boolean).join(" · ") || null;
  const active = activeEnrollment(training.enrollments);
  const activePlan = active ? planById(training.plans, active.planId) : null;
  const connected = integrations.providers.filter(
    (provider) => provider.status === "connected",
  );
  const name = athleteDisplayName(user);
  const handle = athleteHandle(user);
  const paths = athletePaths({
    padelLocked,
    golfLocked,
    badgeCount: badges.fromApi ? badges.badges.length : null,
    friendCount: friends.friends.length,
    communityCount: myCommunities.length,
    trainingActiveTitle: activePlan?.title ?? null,
    connectedIntegrations: connected.length,
    connectableIntegrations: integrations.providers.length,
  });

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Your athlete tools
          </p>
          <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
            Welcome back, {name}
          </h1>
          {handle ? (
            <p className="mt-3 text-sm text-zinc-500">{handle}</p>
          ) : null}
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            These counts come from your account. Open the hub for games,
            progress, and badges — or jump into a live scorecard.
          </p>
          {activityError ? (
            <p className="mt-3 text-sm text-amber-200/90" role="status">
              Some game history could not load: {activityError}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={ATHLETE_LIVE_HREFS.hub}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
            >
              Open your hub
            </Link>
            <Link
              href={ATHLETE_LIVE_HREFS.padelNew}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
            >
              Start padel
            </Link>
            <Link
              href={ATHLETE_LIVE_HREFS.golfNew}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Start golf
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Hub sections
          </p>
          <h2 className="mt-1 font-display text-3xl tracking-wide text-white">
            Your live paths
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {paths.map((path) => (
              <li key={path.id}>
                <Link
                  href={path.href}
                  className="flex h-full flex-col justify-between rounded-3xl border border-white/8 bg-[#141814] px-5 py-5 transition-colors hover:border-white/16"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-medium text-white">
                        {path.title}
                      </h3>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-emerald-300"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {path.description}
                    </p>
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    {path.stat}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ATHLETE_LIVE_HREFS.padelHistory}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Padel history
            </Link>
            <Link
              href={ATHLETE_LIVE_HREFS.golfHistory}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Golf history
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Communities
            </p>
            <h2 className="mt-1 font-display text-2xl tracking-wide text-white">
              Groups you joined
            </h2>
            {myCommunities.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
                <p className="text-sm leading-relaxed text-zinc-400">
                  You have not joined a community yet. Discover open groups or
                  start one.
                </p>
                <Link
                  href={ATHLETE_LIVE_HREFS.communities}
                  className="mt-4 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
                >
                  Browse communities
                </Link>
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {myCommunities.slice(0, 4).map((community) => (
                  <li key={community.id}>
                    <Link
                      href={`/communities/${community.id}`}
                      className="flex items-start justify-between gap-4 rounded-3xl border border-white/8 bg-[#141814] px-5 py-4 transition-colors hover:border-white/16"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {community.name}
                        </p>
                        <p className="mt-1 truncate text-sm text-zinc-500">
                          {community.city} ·{" "}
                          {formatCommunitySport(community.sport)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium text-emerald-300 tabular-nums">
                        {formatMemberCount(community.memberCount)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Integrations
            </p>
            <h2 className="mt-1 font-display text-2xl tracking-wide text-white">
              Connectable services
            </h2>
            {integrations.providers.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
                <p className="text-sm leading-relaxed text-zinc-400">
                  No connectable services on this environment yet. Import
                  session appears here when the API lists it — we never invent
                  a connected status.
                </p>
                <Link
                  href={ATHLETE_LIVE_HREFS.integrations}
                  className="mt-4 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
                >
                  Open integrations
                </Link>
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {integrations.providers.map((provider) => (
                  <li
                    key={provider.id}
                    className="flex items-start justify-between gap-4 rounded-3xl border border-white/8 bg-[#141814] px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {provider.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {provider.importedSessionCount === 1
                          ? "1 session imported"
                          : `${provider.importedSessionCount} sessions imported`}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                      {formatProviderStatus(provider.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
