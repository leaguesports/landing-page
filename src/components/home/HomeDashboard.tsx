import { SportsHub } from "@/components/home/SportsHub";
import type { AuthUser } from "@/lib/api-client";
import { listFollowedFixtures } from "@/lib/events/follow";
import { listMyCommunities } from "@/lib/communities/communities";
import { listFriends } from "@/lib/friends/friends";
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
import { redirect } from "next/navigation";

type HomeDashboardProps = {
  user: AuthUser;
  cookie: string;
  initialTab?: string | null;
};

export async function HomeDashboard({
  user,
  cookie,
  initialTab = null,
}: HomeDashboardProps) {
  const preferencesPromise = getPreferences({ cookie });

  const followedVenuesPromise = listFollowedVenues({ cookie });
  const followedSlugsPromise = followedVenuesPromise.then((venues) =>
    venues.map((venue) => venue.slug),
  );
  const followedFixtureRowsPromise = listFollowedFixtures({ cookie });
  const followedFixtureSlugsPromise = followedFixtureRowsPromise.then((rows) =>
    uniqueFollowedFixtureSlugs(rows.map((row) => row.slug)),
  );
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
    hub,
    followedVenues,
    followedFixtureRows,
    followedFixturesResolved,
    friends,
    myCommunities,
  ] = await Promise.all([
    preferencesPromise,
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
  ]);

  const preferences = preferencesResult.ok
    ? preferencesResult.preferences
    : emptyPreferences();

  if (preferencesResult.ok && needsOnboarding(preferences)) {
    redirect("/onboarding");
  }

  const followedFixtures = fixturesToFollowedFeedItems(
    followedFixturesResolved,
  );

  return (
    <SportsHub
      user={user}
      followedVenues={followedVenues}
      followedFixtures={followedFixtures}
      followedFixtureCount={followedFixtureRows.length}
      friends={friends}
      myCommunities={myCommunities}
      sports={hub.sports}
      feed={hub.feed}
      nowIso={new Date().toISOString()}
      initialFollowedSports={preferences.sports}
      initialActiveSport={preferences.activeSport}
      initialTab={initialTab}
    />
  );
}
