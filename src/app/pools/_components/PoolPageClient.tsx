"use client";

import { getLeaderboard, getPool, PoolApiError } from "@/lib/pool-api";
import { getPoolMemberId } from "@/lib/pool-storage";
import {
  findCurrentMember,
  getPoolUiState,
  predictionToFormState,
  SCORING_RULES,
} from "@/lib/pool-utils";
import type { Leaderboard, PoolView } from "@/types/pool";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Loader2, Trophy } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import JoinForm from "./JoinForm";
import LeaderboardTable from "./LeaderboardTable";
import MemberList from "./MemberList";
import PoolHeader from "./PoolHeader";
import PredictionForm from "./PredictionForm";
import SharePoolButton from "./SharePoolButton";
import SubmitResultForm from "./SubmitResultForm";

type Tab = "pool" | "leaderboard";

export default function PoolPageClient({
  inviteCode,
  initialTab = "pool",
}: {
  inviteCode: string;
  initialTab?: Tab;
}) {
  const [pool, setPool] = useState<PoolView | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadPool = useCallback(async () => {
    try {
      const data = await getPool(inviteCode);
      setPool(data);
      setError(null);
      setNotFound(false);
      return data;
    } catch (err) {
      if (err instanceof PoolApiError && err.status === 404) {
        setNotFound(true);
      } else if (err instanceof PoolApiError) {
        setError(err.message);
      } else {
        setError("Could not load pool. Please try again.");
      }
      return null;
    }
  }, [inviteCode]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard(inviteCode);
      setLeaderboard(data);
    } catch {
      // Leaderboard may not be available pre-results
    }
  }, [inviteCode]);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setMemberId(getPoolMemberId(inviteCode));
      const data = await loadPool();
      if (data?.fixture.status === "FINISHED") {
        await loadLeaderboard();
      }
      setIsLoading(false);
    }
    init();
  }, [inviteCode, loadPool, loadLeaderboard]);

  useEffect(() => {
    function handleFocus() {
      loadPool();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadPool]);

  async function handleRefresh() {
    const data = await loadPool();
    if (data?.fixture.status === "FINISHED") {
      await loadLeaderboard();
    }
  }

  function handleJoined(id: string) {
    setMemberId(id);
    handleRefresh();
  }

  function handleResultSubmitted(lb: Leaderboard) {
    setLeaderboard(lb);
    handleRefresh();
    setTab("leaderboard");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" aria-label="Loading" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Pool not found</h1>
        <p className="mt-2 text-zinc-400">
          This invite link is invalid or has expired.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-500"
        >
          Go home
        </Link>
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="mt-2 text-zinc-400">{error ?? "Could not load pool"}</p>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            loadPool().finally(() => setIsLoading(false));
          }}
          className="mt-6 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15"
        >
          Try again
        </button>
      </div>
    );
  }

  const uiState = getPoolUiState(pool);
  const isJoined = !!memberId;
  const currentMember = findCurrentMember(pool, memberId);
  const existingPrediction = currentMember?.prediction
    ? predictionToFormState(currentMember.prediction)
    : null;

  const showSubmitResult =
    isJoined &&
    uiState !== "results" &&
    !pool.predictionsOpen &&
    pool.fixture.status !== "FINISHED" &&
    pool.fixture.status !== "CANCELLED" &&
    pool.fixture.status !== "POSTPONED";

  const winners = leaderboard?.winner ?? [];
  const showWinnerBanner = uiState === "results" && winners.length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <PoolHeader pool={pool} />

      {isJoined && currentMember && (
        <p className="mt-4 text-sm text-zinc-400">
          You&apos;re playing as{" "}
          <span className="font-semibold text-white">{currentMember.displayName}</span>
        </p>
      )}

      {showWinnerBanner && (
        <div className="mt-6 rounded-2xl border border-green-500/30 bg-linear-to-r from-green-600/20 to-emerald-700/20 p-5 text-center">
          <Trophy className="mx-auto h-8 w-8 text-green-400" aria-hidden />
          <p className="mt-2 text-lg font-bold text-white">
            {winners.length === 1 ? "Winner!" : "Winners!"}
          </p>
          <p className="mt-1 text-green-300">
            {winners.map((w) => w.displayName).join(", ")}
            {winners.length === 1 ? " takes the pool" : " share the top spot"}
            {winners[0] && ` with ${winners[0].totalPoints} pts`}
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
        <button
          type="button"
          onClick={() => setTab("pool")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "pool"
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Pool
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("leaderboard");
            loadLeaderboard();
          }}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "leaderboard"
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Leaderboard
        </button>
      </div>

      {tab === "pool" ? (
        <div className="mt-6 space-y-6">
          <SharePoolButton inviteCode={pool.inviteCode} />

          {uiState === "open" && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-sm text-zinc-400">Kickoff in</p>
              <CountdownTimer
                targetDate={pool.fixture.matchDate}
                completedLabel="Kickoff!"
                className="mt-2"
              />
            </div>
          )}

          {uiState === "locked" && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
              <p className="font-medium text-amber-300">Match in progress</p>
              <p className="mt-1 text-sm text-zinc-400">
                Predictions are locked. All picks are now visible.
              </p>
            </div>
          )}

          {!isJoined && (
            <JoinForm inviteCode={inviteCode} onJoined={handleJoined} />
          )}

          {isJoined && memberId && uiState === "open" && (
            <PredictionForm
              inviteCode={inviteCode}
              homeTeamName={pool.fixture.homeTeamName}
              awayTeamName={pool.fixture.awayTeamName}
              poolMemberId={memberId}
              existingPrediction={existingPrediction}
              predictionsOpen={pool.predictionsOpen}
              onSubmitted={handleRefresh}
            />
          )}

          {isJoined && uiState === "locked" && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="font-medium text-amber-300">Predictions closed</p>
              <p className="mt-1 text-sm text-zinc-400">
                Kickoff has passed. All picks are now visible below.
              </p>
            </div>
          )}

          {showSubmitResult && (
            <SubmitResultForm
              inviteCode={inviteCode}
              homeTeamName={pool.fixture.homeTeamName}
              awayTeamName={pool.fixture.awayTeamName}
              onSubmitted={handleResultSubmitted}
            />
          )}

          <MemberList pool={pool} currentMemberId={memberId} />

          <p className="text-xs text-zinc-600">
            {SCORING_RULES[pool.scoringRule].description}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {leaderboard ? (
            <>
              {leaderboard.winner.length > 0 && (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-center">
                  <p className="text-sm text-zinc-400">Champion</p>
                  <p className="mt-1 text-xl font-bold text-green-400">
                    {leaderboard.winner.map((w) => w.displayName).join(", ")}
                  </p>
                </div>
              )}
              <LeaderboardTable
                members={leaderboard.members}
                homeTeamName={leaderboard.fixture.homeTeamName}
                awayTeamName={leaderboard.fixture.awayTeamName}
                winners={leaderboard.winner}
                showPoints={leaderboard.fixture.status === "FINISHED"}
              />
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-500">
                {uiState === "results"
                  ? "Loading leaderboard…"
                  : "Full rankings appear after the final result is submitted."}
              </p>
              <LeaderboardTable
                members={pool.members}
                homeTeamName={pool.fixture.homeTeamName}
                awayTeamName={pool.fixture.awayTeamName}
                showPoints={uiState === "results"}
                highlightHidden={uiState === "open"}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
