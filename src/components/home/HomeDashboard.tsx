import { SportsHub } from "@/components/home/SportsHub";
import type { AuthUser } from "@/lib/api-client";
import { listFriends } from "@/lib/friends/friends";
import { lookupPlayerHistory } from "@/lib/padel/lookup-history";
import { getDashboardHub } from "@/lib/sports/dashboard-feed";
import { listFollowedVenues } from "@/lib/venues/follow";
import type { PadelHistoryItem } from "@/types/padel-match";

type HomeDashboardProps = {
  user: AuthUser;
  cookie: string;
};

export async function HomeDashboard({ user, cookie }: HomeDashboardProps) {
  const [history, hub, followedVenues, friends] = await Promise.all([
    lookupPlayerHistory(user.id, { cookie }),
    getDashboardHub(),
    listFollowedVenues({ cookie }),
    listFriends({ cookie }),
  ]);
  const items: PadelHistoryItem[] = history.error ? [] : history.items;

  return (
    <SportsHub
      user={user}
      historyError={history.error}
      historyItems={items}
      followedVenues={followedVenues}
      friends={friends}
      sports={hub.sports}
      feed={hub.feed}
      nowIso={new Date().toISOString()}
    />
  );
}
