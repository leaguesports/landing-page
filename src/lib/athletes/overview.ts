import { getLoginPageHref } from "../auth-return-to.ts";

type AthleteUserName = {
  displayName?: string;
  name?: string;
  handle?: string;
};

/** Post-login resume path for every `/athletes` login CTA. */
export const ATHLETES_RETURN_TO = "/athletes";

export const ATHLETES_LOGIN_HREF = getLoginPageHref(ATHLETES_RETURN_TO);

export const ATHLETE_LIVE_HREFS = {
  hub: "/",
  play: "/play",
  communities: "/communities",
  login: ATHLETES_LOGIN_HREF,
} as const;

export function athleteDisplayName(user: AthleteUserName): string {
  const display = user.displayName?.trim();
  if (display) return display;
  const name = user.name?.trim();
  if (name) return name;
  const handle = user.handle?.trim();
  if (handle) return handle.startsWith("@") ? handle : `@${handle}`;
  return "Athlete";
}

export function athleteHandle(user: Pick<AthleteUserName, "handle">): string | null {
  const handle = user.handle?.trim();
  if (!handle) return null;
  return handle.startsWith("@") ? handle : `@${handle}`;
}

export type AthleteOverviewCounts = {
  friendCount: number;
  communityCount: number;
};

export type AthletePathId = "communities";

export type AthletePath = {
  id: AthletePathId;
  title: string;
  description: string;
  href: string;
  stat: string;
};

export function athletePaths(counts: AthleteOverviewCounts): AthletePath[] {
  return [
    {
      id: "communities",
      title: "Communities",
      description:
        counts.friendCount > 0
          ? `${counts.friendCount} friend${counts.friendCount === 1 ? "" : "s"} on your hub — plus groups you join.`
          : "Groups you joined or created — city crews and regular hit-arounds.",
      href: ATHLETE_LIVE_HREFS.communities,
      stat:
        counts.communityCount === 0
          ? counts.friendCount > 0
            ? `${counts.friendCount} friends on hub`
            : "None yet"
          : `${counts.communityCount} joined`,
    },
  ];
}
