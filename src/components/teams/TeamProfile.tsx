"use client";

import { TeamAvatar } from "@/components/teams/TeamAvatar";
import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import type { Friend } from "@/lib/friends/friends";
import { TeamMatchesSection } from "@/components/team-matches/TeamMatchesSection";
import { TeamTournamentsSection } from "@/components/tournaments/TeamTournamentsSection";
import type { PublicTeamMatch } from "@/lib/team-matches/team-matches";
import type { PublicTournamentSummary } from "@/lib/tournaments/tournaments";
import {
  TEAM_SPORTS,
  canAppointCaptains,
  canDeleteTeam,
  canEditTeam,
  canInvite,
  canLeave,
  canRemoveMember,
  canTransferOwnership,
  createTeamInviteLink,
  deleteTeam,
  formatMemberCount,
  formatTeamRole,
  formatTeamSport,
  inviteTeamMembers,
  leaveTeam,
  removeTeamMember,
  teamJoinHref,
  transferTeamOwnership,
  updateTeam,
  updateTeamMemberRole,
  type KnownTeamSport,
  type PublicTeam,
  type PublicTeamMember,
} from "@/lib/teams/teams";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type TeamProfileProps = {
  team: PublicTeam;
  friends: Friend[];
  matches?: PublicTeamMatch[];
  tournaments?: PublicTournamentSummary[];
};

function sendToLogin(id: string) {
  const returnTo =
    typeof window === "undefined"
      ? `/teams/${id}`
      : relativeAuthReturnTo() || `/teams/${id}`;
  window.location.href = getLoginPageHref(returnTo);
}

function inviteUrl(token: string): string {
  const path = teamJoinHref(token);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function TeamProfile({
  team,
  friends,
  matches = [],
  tournaments = [],
}: TeamProfileProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [current, setCurrent] = useState(team);
  const [name, setName] = useState(team.name);
  const [sport, setSport] = useState(team.sport);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [transferUserId, setTransferUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const role = current.myRole;
  const memberIds = useMemo(
    () => new Set(current.members.map((member) => member.id)),
    [current.members],
  );
  const invitableFriends = friends.filter((friend) => !memberIds.has(friend.id));
  const transferTargets = current.members.filter(
    (member) => member.status === "active" && member.id !== user?.id,
  );

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  function applyTeam(next: PublicTeam) {
    setCurrent(next);
    setName(next.name);
    setSport(next.sport);
    router.refresh();
  }

  function handleAuthFailure(status: number) {
    if (status === 401) {
      sendToLogin(current.id);
      return true;
    }
    return false;
  }

  function onSaveDetails() {
    clearFeedback();
    if (!canEditTeam(role)) return;
    startTransition(() => {
      void updateTeam(current.id, { name, sport }).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        applyTeam(result.value);
        setMessage("Team updated.");
      });
    });
  }

  function toggleFriend(id: string) {
    setSelectedFriendIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id],
    );
  }

  function onInviteFriends() {
    clearFeedback();
    if (!canInvite(role)) return;
    startTransition(() => {
      void inviteTeamMembers(current.id, selectedFriendIds).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        applyTeam(result.value);
        setSelectedFriendIds([]);
        setMessage("Friends added to the roster.");
      });
    });
  }

  function onCreateInviteLink() {
    clearFeedback();
    if (!canInvite(role)) return;
    startTransition(() => {
      void createTeamInviteLink(current.id).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        setCurrent({ ...current, inviteLink: result.value });
        setMessage("Invite link ready.");
      });
    });
  }

  async function onCopyInviteLink() {
    const token = current.inviteLink?.token;
    if (!token) return;
    try {
      await navigator.clipboard.writeText(inviteUrl(token));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the invite link");
    }
  }

  function onChangeRole(member: PublicTeamMember, nextRole: "captain" | "member") {
    clearFeedback();
    if (!canAppointCaptains(role)) return;
    startTransition(() => {
      void updateTeamMemberRole(current.id, member.id, nextRole).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        applyTeam(result.value);
        setMessage(
          nextRole === "captain"
            ? `${member.displayName} is now a captain.`
            : `${member.displayName} is now a member.`,
        );
      });
    });
  }

  function onRemove(member: PublicTeamMember) {
    clearFeedback();
    if (!canRemoveMember(role, member.role)) return;
    startTransition(() => {
      void removeTeamMember(current.id, member.id).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        applyTeam(result.value);
        setMessage(`Removed ${member.displayName}.`);
      });
    });
  }

  function onLeave() {
    clearFeedback();
    if (!canLeave(role)) {
      setError("Transfer ownership before leaving.");
      return;
    }
    startTransition(() => {
      void leaveTeam(current.id).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        router.push("/teams");
        router.refresh();
      });
    });
  }

  function onTransfer() {
    clearFeedback();
    if (!canTransferOwnership(role)) return;
    startTransition(() => {
      void transferTeamOwnership(current.id, transferUserId).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        applyTeam(result.value);
        setTransferUserId("");
        setMessage("Ownership transferred. You’re now a captain.");
      });
    });
  }

  function onDelete() {
    clearFeedback();
    if (!canDeleteTeam(role)) return;
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(`Delete ${current.name}? This cannot be undone.`);
    if (!confirmed) return;
    startTransition(() => {
      void deleteTeam(current.id).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        router.push("/teams");
        router.refresh();
      });
    });
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
        <p className="text-sm text-zinc-400">Sign in to manage this team.</p>
        <button
          type="button"
          onClick={() => sendToLogin(current.id)}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TeamMatchesSection team={current} matches={matches} />
      <TeamTournamentsSection team={current} tournaments={tournaments} />

      {canEditTeam(role) ? (
        <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Team details
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="edit-team-name"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Name
              </label>
              <input
                id="edit-team-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="edit-team-sport"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Sport
              </label>
              <select
                id="edit-team-sport"
                value={sport}
                onChange={(event) => setSport(event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                {TEAM_SPORTS.includes(sport as KnownTeamSport) ? null : (
                  <option value={sport}>{formatTeamSport(sport)}</option>
                )}
                {TEAM_SPORTS.map((option) => (
                  <option key={option} value={option}>
                    {formatTeamSport(option)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={onSaveDetails}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            Save
          </button>
        </section>
      ) : null}

      {canInvite(role) ? (
        <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Invite
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
            Accepted friends join as active members. Anyone with the link can
            join.
          </p>

          <div className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200">Friends</h3>
            {invitableFriends.length === 0 ? (
              <p className="rounded-2xl border border-white/8 bg-[#101410] px-4 py-3 text-sm text-zinc-400">
                No accepted friends left to add. Share a join link instead.
              </p>
            ) : (
              <>
                <ul className="max-h-64 space-y-1 overflow-y-auto overscroll-contain">
                  {invitableFriends.map((friend) => {
                    const selected = selectedFriendIds.includes(friend.id);
                    return (
                      <li key={friend.id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleFriend(friend.id)}
                          className={[
                            "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors",
                            selected
                              ? "border-emerald-400/50 bg-emerald-400/10"
                              : "border-white/8 bg-[#101410] hover:border-white/16",
                          ].join(" ")}
                        >
                          <TeamAvatar
                            name={friend.displayName}
                            avatarUrl={friend.avatarUrl}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white">
                              {friend.displayName}
                            </span>
                            <span className="block truncate text-xs text-zinc-500">
                              @{friend.handle}
                            </span>
                          </span>
                          <span
                            className={[
                              "text-xs font-medium",
                              selected ? "text-emerald-300" : "text-zinc-600",
                            ].join(" ")}
                          >
                            {selected ? "Selected" : "Add"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  disabled={pending || selectedFriendIds.length === 0}
                  onClick={onInviteFriends}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                >
                  Add to roster
                </button>
              </>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200">Invite link</h3>
            {current.inviteLink ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  readOnly
                  value={inviteUrl(current.inviteLink.token)}
                  className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-zinc-300"
                />
                <button
                  type="button"
                  onClick={() => void onCopyInviteLink()}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white/5"
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                No active link yet. Create one to share.
              </p>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={onCreateInviteLink}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-60"
            >
              {current.inviteLink ? "Regenerate link" : "Create invite link"}
            </button>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="team-roster-heading">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Roster
          </p>
          <h2
            id="team-roster-heading"
            className="mt-1 font-display text-2xl tracking-wide text-white"
          >
            {formatMemberCount(current.memberCount)}
          </h2>
        </div>
        <ul className="space-y-2">
          {current.members.map((member) => {
            const showAppoint =
              canAppointCaptains(role) &&
              member.role === "member" &&
              member.status === "active";
            const showDemote =
              canAppointCaptains(role) && member.role === "captain";
            const showRemove = canRemoveMember(role, member.role);
            return (
              <li
                key={`${member.id}-${member.joinedAt}`}
                className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <TeamAvatar
                    name={member.displayName}
                    avatarUrl={member.avatarUrl}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {member.displayName}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      @{member.handle}
                      {member.status === "invited" ? " · invited" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                    {formatTeamRole(member.role)}
                  </span>
                  {showAppoint ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onChangeRole(member, "captain")}
                      className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white disabled:opacity-60"
                    >
                      Make captain
                    </button>
                  ) : null}
                  {showDemote ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onChangeRole(member, "member")}
                      className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white disabled:opacity-60"
                    >
                      Make member
                    </button>
                  ) : null}
                  {showRemove ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onRemove(member)}
                      className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-60"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
        <h2 className="font-display text-2xl tracking-wide text-white">
          Team settings
        </h2>
        <div className="mt-4 space-y-4">
          {canTransferOwnership(role) ? (
            <div>
              <p className="mb-2 text-sm text-zinc-400">
                Transfer ownership to an active teammate. You’ll become a
                captain.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={transferUserId}
                  onChange={(event) => setTransferUserId(event.target.value)}
                  className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
                >
                  <option value="">Select a teammate</option>
                  {transferTargets.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.displayName} ({formatTeamRole(member.role)})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={pending || !transferUserId}
                  onClick={onTransfer}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-60"
                >
                  Transfer ownership
                </button>
              </div>
            </div>
          ) : null}

          {canLeave(role) ? (
            <button
              type="button"
              disabled={pending}
              onClick={onLeave}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-60"
            >
              Leave team
            </button>
          ) : role === "owner" ? (
            <p className="text-sm text-zinc-500">
              Owners transfer first — leave is hidden so the team keeps an
              owner.
            </p>
          ) : null}

          {canDeleteTeam(role) ? (
            <button
              type="button"
              disabled={pending}
              onClick={onDelete}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-400/30 px-5 text-sm font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-60"
            >
              Delete team
            </button>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-300" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
