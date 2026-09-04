import { SportsHub } from "@/components/home/SportsHub";
import type { AuthUser } from "@/lib/api-client";
import { listFriends } from "@/lib/friends/friends";
import { lookupPlayerGolfHistory } from "@/lib/golf/lookup-history";
import { lookupPlayerHistory } from "@/lib/padel/lookup-history";
import { getDashboardHub } from "@/lib/sports/dashboard-feed";
import { listFollowedVenues } from "@/lib/venues/follow";
import type { GolfHistoryItem } from "@/types/golf-round";
import type { PadelHistoryItem } from "@/types/padel-match";

type HomeDashboardProps = {
  user: AuthUser;
  cookie: string;
};

export async function HomeDashboard({ user, cookie }: HomeDashboardProps) {
  // Start follow I/O immediately; hub generic Sanity reads do not wait on it.
  const followedVenuesPromise = listFollowedVenues({ cookie });
  const followedSlugsPromise = followedVenuesPromise.then((venues) =>
    venues.map((venue) => venue.slug),
  );

  const [history, golfHistory, hub, followedVenues, friends] =
    await Promise.all([
      lookupPlayerHistory(user.id, { cookie }),
      lookupPlayerGolfHistory(user.id, { cookie }),
      getDashboardHub({ followedVenueSlugs: followedSlugsPromise }),
      followedVenuesPromise,
      listFriends({ cookie }),
    ]);
  const items: PadelHistoryItem[] = history.error ? [] : history.items;
  const golfItems: GolfHistoryItem[] = golfHistory.error
    ? []
    : golfHistory.items;

  return (
    <SportsHub
      user={user}
      historyError={history.error}
      historyItems={items}
      golfHistoryItems={golfItems}
      followedVenues={followedVenues}
      friends={friends}
      sports={hub.sports}
      feed={hub.feed}
      nowIso={new Date().toISOString()}
    />
  );
}
