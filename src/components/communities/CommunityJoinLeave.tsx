"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  isSoleOwnerLeaveBlocked,
  joinCommunity,
  leaveCommunity,
  type Community,
} from "@/lib/communities/communities";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type CommunityJoinLeaveProps = {
  community: Community;
};

function communityReturnTo(id: string): string {
  if (typeof window === "undefined") return `/communities/${id}`;
  return relativeAuthReturnTo() || `/communities/${id}`;
}

function sendToLogin(id: string) {
  window.location.href = getLoginPageHref(communityReturnTo(id));
}

export function CommunityJoinLeave({ community }: CommunityJoinLeaveProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [current, setCurrent] = useState(community);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hideLeave = isSoleOwnerLeaveBlocked(current);

  function onJoin() {
    setError(null);
    setMessage(null);

    if (!isAuthenticated) {
      sendToLogin(current.id);
      return;
    }

    startTransition(() => {
      void joinCommunity(current.id).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin(current.id);
            return;
          }
          setError(result.error);
          return;
        }
        setCurrent(result.value);
        setMessage("You’re in.");
        router.refresh();
      });
    });
  }

  function onLeave() {
    setError(null);
    setMessage(null);

    startTransition(() => {
      void leaveCommunity(current.id).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin(current.id);
            return;
          }
          setError(result.error);
          return;
        }
        setCurrent({
          ...current,
          joined: false,
          role: null,
          memberCount: Math.max(0, current.memberCount - 1),
          members: user?.id
            ? current.members.filter((member) => member.id !== user.id)
            : current.members,
        });
        setMessage("You’ve left this community.");
        router.refresh();
      });
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {current.joined ? (
          hideLeave ? (
            <p className="text-sm text-zinc-400">
              You’re the owner. Transfer is coming later — leave is hidden so
              the group stays open.
            </p>
          ) : (
            <button
              type="button"
              disabled={pending || authLoading}
              onClick={onLeave}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-60"
            >
              Leave
            </button>
          )
        ) : (
          <button
            type="button"
            disabled={pending || authLoading}
            onClick={onJoin}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
          >
            {isAuthenticated ? "Join" : "Sign in to join"}
          </button>
        )}
        {current.joined && current.role ? (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-emerald-200">
            {current.role}
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm text-emerald-300" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
