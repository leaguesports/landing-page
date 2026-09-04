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
  const [history, golfHistory, followedVenues, friends] = await Promise.all([
    lookupPlayerHistory(user.id, { cookie }),
    lookupPlayerGolfHistory(user.id, { cookie }),
    listFollowedVenues({ cookie }),
    listFriends({ cookie }),
  ]);
  const hub = await getDashboardHub({
    followedVenueSlugs: followedVenues.map((venue) => venue.slug),
  });
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
