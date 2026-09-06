import { CommunityAvatar } from "@/components/communities/CommunityAvatar";
import { CommunityJoinLeave } from "@/components/communities/CommunityJoinLeave";
import {
  formatCommunitySport,
  formatMemberCount,
  getCommunity,
} from "@/lib/communities/communities";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type CommunityPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: CommunityPageProps): Promise<Metadata> {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const community = await getCommunity(id, { cookie });
  if (!community) {
    return {
      title: "Community",
      description: "Community on LeagueSports.",
    };
  }
  return {
    title: community.name,
    description: `${community.name} in ${community.city} — ${formatMemberCount(community.memberCount)}.`,
  };
}

export default async function CommunityDetailPage({
  params,
}: CommunityPageProps) {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const community = await getCommunity(id, { cookie });

  if (!community) {
    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Communities
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
            Community not found
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            This group may have been removed, or the communities API hasn’t
            been migrated on this environment yet.
          </p>
          <Link
            href="/communities"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Browse communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/communities"
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Communities
        </Link>

        <header className="mt-6 rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {community.city}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
            {community.name}
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            {formatCommunitySport(community.sport)} ·{" "}
            {formatMemberCount(community.memberCount)}
          </p>
          <div className="mt-6">
            <CommunityJoinLeave community={community} />
          </div>
        </header>

        <section className="mt-10" aria-labelledby="community-members-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Members
              </p>
              <h2
                id="community-members-heading"
                className="mt-1 font-display text-2xl tracking-wide text-white"
              >
                {formatMemberCount(community.memberCount)}
              </h2>
            </div>
          </div>

          {community.members.length === 0 ? (
            <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
              <p className="text-sm text-zinc-400">
                No member profiles yet. Counts still come from the API.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {community.members.map((member) => (
                <li
                  key={`${member.id}-${member.joinedAt}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <CommunityAvatar
                      name={member.displayName}
                      avatarUrl={member.avatarUrl}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {member.displayName}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        @{member.handle}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
