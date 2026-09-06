import { SportsHub } from "@/components/home/SportsHub";
import type { AuthUser } from "@/lib/api-client";
import { listBadges } from "@/lib/badges/api";
import { listFollowedFixtures } from "@/lib/events/follow";
import { listMyCommunities } from "@/lib/communities/communities";
import { listFriends } from "@/lib/friends/friends";
import { listIntegrations } from "@/lib/integrations/integrations";
import { listTrainingPlans } from "@/lib/training/training";
import { lookupPlayerGolfHistory } from "@/lib/golf/lookup-history";
import { lookupPlayerHistory } from "@/lib/padel/lookup-history";
import {
  emptyPreferences,
  getPreferences,
  needsOnboarding,
} from "@/lib/preferences/preferences";
import { getDashboardHub } from "@/lib/sports/dashboard-feed";
import {
  fixturesToFollowedFeedItems,
  uniqueFollowedFixtureSlugs,
} from "@/lib/sports/hub-feed";
import { listFollowedVenues } from "@/lib/venues/follow";
import {
  getUpcomingFixtures,
  resolveFollowedFixtures,
} from "@/services/events";
import type { PadelHistoryItem } from "@/types/padel-match";
import { redirect } from "next/navigation";

type HomeDashboardProps = {
  user: AuthUser;
  cookie: string;
};

export async function HomeDashboard({ user, cookie }: HomeDashboardProps) {
  const preferencesPromise = getPreferences({ cookie });

  // Start follow I/O immediately; hub generic Sanity reads do not wait on it.
  const followedVenuesPromise = listFollowedVenues({ cookie });
  const followedSlugsPromise = followedVenuesPromise.then((venues) =>
    venues.map((venue) => venue.slug),
  );
  const followedFixtureRowsPromise = listFollowedFixtures({ cookie });
  const followedFixtureSlugsPromise = followedFixtureRowsPromise.then((rows) =>
    uniqueFollowedFixtureSlugs(rows.map((row) => row.slug)),
  );
  // Shared upcoming list — hub preference matches + followed resolution reuse it.
  const upcomingFixturesPromise = getUpcomingFixtures({ limit: 48 }).catch(
    () => [],
  );
  const followedFixturesPromise = followedFixtureSlugsPromise.then((slugs) =>
    resolveFollowedFixtures(slugs, {
      upcomingFixtures: upcomingFixturesPromise,
    }),
  );

  const preferredSportsPromise = preferencesPromise.then((result) =>
    result.ok ? result.preferences.sports : [],
  );

  const [
    preferencesResult,
    history,
    golfHistory,
    hub,
    followedVenues,
    followedFixtureRows,
    followedFixturesResolved,
    friends,
    myCommunities,
    badges,
    training,
    integrations,
  ] = await Promise.all([
    preferencesPromise,
    lookupPlayerHistory(user.id, { cookie }),
    lookupPlayerGolfHistory(user.id, { cookie }),
    getDashboardHub({
      followedVenueSlugs: followedSlugsPromise,
      preferredSports: preferredSportsPromise,
      excludeFixtureSlugs: followedFixtureSlugsPromise,
      upcomingFixtures: upcomingFixturesPromise,
    }),
    followedVenuesPromise,
    followedFixtureRowsPromise,
    followedFixturesPromise,
    listFriends({ cookie }),
    listMyCommunities({ cookie }),
    listBadges({ cookie }),
    listTrainingPlans({ cookie }),
    listIntegrations({ cookie }),
  ]);

  const preferences = preferencesResult.ok
    ? preferencesResult.preferences
    : emptyPreferences();

  // Only force onboarding when the API confirms an incomplete profile.
  if (preferencesResult.ok && needsOnboarding(preferences)) {
    redirect("/onboarding");
  }

  const items: PadelHistoryItem[] = history.error ? [] : history.items;
  const padelCount = history.error ? 0 : history.items.length;
  const golfCount = golfHistory.error ? 0 : golfHistory.items.length;
  const activityError =
    [history.error, golfHistory.error].filter(Boolean).join(" · ") || null;

  const followedFixtures = fixturesToFollowedFeedItems(
    followedFixturesResolved,
  );

  return (
    <SportsHub
      user={user}
      historyError={history.error}
      historyItems={items}
      lockedActivity={{
        padel: padelCount,
        golf: golfCount,
        error: activityError,
      }}
      followedVenues={followedVenues}
      followedFixtures={followedFixtures}
      followedFixtureCount={followedFixtureRows.length}
      friends={friends}
      myCommunities={myCommunities}
      badges={badges}
      training={training}
      integrations={integrations}
      sports={hub.sports}
      feed={hub.feed}
      nowIso={new Date().toISOString()}
      initialFollowedSports={preferences.sports}
      initialActiveSport={preferences.activeSport}
    />
  );
}
