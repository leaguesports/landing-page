import { CommunityAvatar } from "@/components/communities/CommunityAvatar";
import { CommunityChallengeLink } from "@/components/communities/CommunityChallengeLink";
import type { CommunityMember } from "@/lib/communities/communities";

export function CommunityMembersList({
  communityId,
  members,
}: {
  communityId: string;
  members: CommunityMember[];
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
        <p className="text-sm text-zinc-400">
          No member profiles yet. Counts still come from the API.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {members.map((member) => (
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
              <p className="truncate text-xs text-zinc-500">@{member.handle}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              {member.role}
            </span>
            <CommunityChallengeLink
              communityId={communityId}
              guestName={member.displayName}
              hideForUserId={member.id}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
