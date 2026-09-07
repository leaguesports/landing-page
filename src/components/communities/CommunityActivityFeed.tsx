import { CommunityChallengeLink } from "@/components/communities/CommunityChallengeLink";
import {
  challengeGuestFromActivity,
  communityChallengeHref,
  formatActivitySport,
  formatActivityWhen,
  type CommunityActivityItem,
} from "@/lib/communities/communities";
import Link from "next/link";

export function CommunityActivityFeed({
  communityId,
  items,
}: {
  communityId: string;
  items: CommunityActivityItem[];
}) {
  const startHref = communityChallengeHref({ communityId });

  return (
    <section className="mt-10" aria-labelledby="community-activity-heading">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Activity
          </p>
          <h2
            id="community-activity-heading"
            className="mt-1 font-display text-2xl tracking-wide text-white"
          >
            Recent results
          </h2>
        </div>
        <Link
          href={startHref}
          className="shrink-0 text-sm font-medium text-emerald-300 hover:text-emerald-200"
        >
          Start a match
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            No locked matches yet —{" "}
            <Link
              href={startHref}
              className="font-medium text-emerald-300 hover:text-emerald-200"
            >
              start one
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={`${item.sport}-${item.id}`}
              className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                    {formatActivitySport(item.sport)}
                  </span>
                  <time
                    dateTime={item.lockedAt}
                    className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500"
                  >
                    {formatActivityWhen(item.lockedAt) || "Locked"}
                  </time>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-white">{item.summary}</p>
              {item.venueName ? (
                <p className="mt-1 text-sm text-zinc-400">{item.venueName}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                <Link
                  href={item.path}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-zinc-300 hover:text-white"
                >
                  Open {item.kind === "round" ? "round" : "match"}
                </Link>
                <CommunityChallengeLink
                  communityId={communityId}
                  guestName={challengeGuestFromActivity(item)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
