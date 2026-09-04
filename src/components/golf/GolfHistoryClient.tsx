"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { GolfHistoryList } from "@/components/golf/GolfHistoryList";
import { useAuth } from "@/hooks/useAuth";
import {
  GOLF_API_UNAVAILABLE,
  GolfApiError,
  listPlayerGolfHistory,
} from "@/lib/golf/api-round";
import { golfPlayerHistoryPath } from "@/lib/golf/history";
import type { GolfHistoryItem } from "@/types/golf-round";

function historyErrorMessage(error: unknown): string {
  if (error instanceof GolfApiError) return error.message;
  if (error instanceof Error) return error.message;
  return GOLF_API_UNAVAILABLE;
}

export function GolfHistoryClient() {
  const searchParams = useSearchParams();
  const sharedId = searchParams.get("playerUserId")?.trim() || "";
  const { isAuthenticated, user, isLoading, signIn } = useAuth();
  const playerUserId = sharedId || user?.id || "";
  const viewingOwn =
    Boolean(user?.id) && (!sharedId || sharedId === user?.id);

  const [items, setItems] = useState<GolfHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (userId: string) => {
    setLoadingList(true);
    setError(null);
    try {
      setItems(await listPlayerGolfHistory(userId));
    } catch (err) {
      setItems(null);
      setError(historyErrorMessage(err));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!playerUserId) {
      setItems(null);
      setError(null);
      return;
    }
    void load(playerUserId);
  }, [load, playerUserId]);

  async function handleShare() {
    if (!playerUserId || typeof window === "undefined") return;
    const url = `${window.location.origin}${golfPlayerHistoryPath(playerUserId)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const waitingForAuth = !sharedId && isLoading;
  const needsSignIn = !playerUserId && !isLoading;

  return (
    <div className="space-y-6">
      {waitingForAuth || loadingList ? (
        <p className="text-sm text-zinc-500">Loading locked rounds…</p>
      ) : needsSignIn ? (
        <div className="space-y-4 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            Locked rounds are listed by account. Guest names are not a history
            list — sign in, or open a shareable player link.
          </p>
          <button
            type="button"
            onClick={() => signIn("/golf/history")}
            className="inline-flex min-h-12 items-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Sign in
          </button>
        </div>
      ) : error ? (
        <p className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </p>
      ) : items && items.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No locked rounds yet. Finish a live scorecard to write the first
          result.
        </p>
      ) : items ? (
        <GolfHistoryList items={items} />
      ) : null}

      {viewingOwn && playerUserId && !error ? (
        <button
          type="button"
          onClick={() => void handleShare()}
          className="text-sm font-medium text-zinc-400 hover:text-white"
        >
          {copied ? "Copied share link" : "Copy shareable history link"}
        </button>
      ) : null}

      {!isAuthenticated && sharedId ? (
        <p className="text-sm text-zinc-500">
          This is a shared player list.{" "}
          <Link href="/login" className="text-emerald-300 hover:text-emerald-200">
            Sign in
          </Link>{" "}
          to see your own locked rounds.
        </p>
      ) : null}
    </div>
  );
}
