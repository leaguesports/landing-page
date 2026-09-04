import { SportsHub } from "@/components/home/SportsHub";
import type { AuthUser } from "@/lib/api-client";
import { lookupPlayerHistory } from "@/lib/padel/lookup-history";
import { getDashboardHub } from "@/lib/sports/dashboard-feed";
import type { PadelHistoryItem } from "@/types/padel-match";

type HomeDashboardProps = {
  user: AuthUser;
  cookie: string;
};

export async function HomeDashboard({ user, cookie }: HomeDashboardProps) {
  const [history, hub] = await Promise.all([
    lookupPlayerHistory(user.id, { cookie }),
    getDashboardHub(),
  ]);
  const items: PadelHistoryItem[] = history.error ? [] : history.items;

  return (
    <SportsHub
      user={user}
      historyError={history.error}
      historyItems={items}
      sports={hub.sports}
      feed={hub.feed}
      nowIso={new Date().toISOString()}
    />
  );
}
