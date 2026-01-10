"use client";

import { useSessionContext } from "@/contexts/SessionContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const activityConfig: Record<
  string,
  { icon: string; label: string; gradient: string; bgPattern: string }
> = {
  racing: {
    icon: "🏎️",
    label: "Sim Racing",
    gradient: "from-red-500 to-rose-600",
    bgPattern:
      "radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)",
  },
  golf: {
    icon: "⛳",
    label: "Sim Golf",
    gradient: "from-emerald-500 to-green-600",
    bgPattern:
      "radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
  },
  padel: {
    icon: "🎾",
    label: "Padel",
    gradient: "from-amber-500 to-orange-600",
    bgPattern:
      "radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)",
  },
  esports: {
    icon: "🎮",
    label: "Esports",
    gradient: "from-violet-500 to-purple-600",
    bgPattern:
      "radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
  },
  darts: {
    icon: "🎯",
    label: "Darts",
    gradient: "from-sky-500 to-blue-600",
    bgPattern:
      "radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)",
  },
  pool: {
    icon: "🎱",
    label: "Pool",
    gradient: "from-slate-500 to-gray-600",
    bgPattern:
      "radial-gradient(circle at 20% 80%, rgba(100, 116, 139, 0.15) 0%, transparent 50%)",
  },
};

export default function SessionPage() {
  const router = useRouter();
  const {
    session,
    isFetchingSession,
    elapsedTimeFormatted,
    score,
    updateScore,
    isEnding,
    endSession,
    error,
    clearError,
  } = useSessionContext();

  // Redirect to home if no active session
  useEffect(() => {
    if (!isFetchingSession && !session) {
      router.push("/");
    }
  }, [session, isFetchingSession, router]);

  if (isFetchingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const config = activityConfig[session.activityType] || {
    icon: "🎯",
    label: session.activityType,
    gradient: "from-slate-500 to-gray-600",
    bgPattern:
      "radial-gradient(circle at 20% 80%, rgba(100, 116, 139, 0.15) 0%, transparent 50%)",
  };

  const handleEndSession = async () => {
    const success = await endSession();
    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: config.bgPattern }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
                Live Session
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Session Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br ${config.gradient} items-center justify-center text-5xl mb-4 shadow-lg`}
          >
            {config.icon}
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2">
            {config.label}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="font-mono text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              {elapsedTimeFormatted}
            </div>
          </div>
          {session.players.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {session.players.map((player, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm"
                >
                  {player}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Scoring Section */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8">
          {/* Golf Scoring */}
          {session.activityType === "golf" && (
            <div className="space-y-8">
              <div className="text-center">
                <label className="block text-sm font-medium text-slate-400 mb-4">
                  Total Strokes
                </label>
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={() =>
                      updateScore({
                        golfStrokes: Math.max(1, (score.golfStrokes || 72) - 1),
                      })
                    }
                    className="w-20 h-20 rounded-2xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-4xl font-bold transition-colors"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <div className="text-7xl font-bold font-heading">
                      {score.golfStrokes || 72}
                    </div>
                    <div
                      className={`text-lg mt-2 font-medium ${
                        (score.golfStrokes || 72) < 72
                          ? "text-emerald-400"
                          : (score.golfStrokes || 72) > 72
                          ? "text-red-400"
                          : "text-slate-400"
                      }`}
                    >
                      {(score.golfStrokes || 72) < 72
                        ? `${72 - (score.golfStrokes || 72)} under par`
                        : (score.golfStrokes || 72) > 72
                        ? `${(score.golfStrokes || 72) - 72} over par`
                        : "Even par"}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      updateScore({
                        golfStrokes: Math.min(
                          200,
                          (score.golfStrokes || 72) + 1
                        ),
                      })
                    }
                    className="w-20 h-20 rounded-2xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center text-4xl font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick adjustment buttons */}
              <div className="flex justify-center gap-3">
                {[-5, -3, -1, 1, 3, 5].map((adj) => (
                  <button
                    key={adj}
                    onClick={() =>
                      updateScore({
                        golfStrokes: Math.max(
                          1,
                          Math.min(200, (score.golfStrokes || 72) + adj)
                        ),
                      })
                    }
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                      adj < 0
                        ? "bg-slate-700 hover:bg-slate-600"
                        : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    }`}
                  >
                    {adj > 0 ? `+${adj}` : adj}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Racing Scoring */}
          {session.activityType === "racing" && (
            <div className="space-y-8">
              <div className="text-center">
                <label className="block text-sm font-medium text-slate-400 mb-4">
                  Finishing Position
                </label>
                <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                  {[1, 2, 3, 4, 5].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updateScore({ racingPosition: pos })}
                      className={`py-6 rounded-2xl text-center font-bold transition-all text-2xl ${
                        score.racingPosition === pos
                          ? pos === 1
                            ? "bg-gradient-to-br from-amber-400 to-amber-500 text-amber-900 scale-105 shadow-lg shadow-amber-500/30"
                            : pos === 2
                            ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 scale-105 shadow-lg"
                            : pos === 3
                            ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white scale-105 shadow-lg"
                            : "bg-gradient-to-br from-primary to-emerald-500 text-slate-950 scale-105 shadow-lg shadow-primary/30"
                          : "bg-slate-700 hover:bg-slate-600"
                      }`}
                    >
                      {pos === 1
                        ? "🥇"
                        : pos === 2
                        ? "🥈"
                        : pos === 3
                        ? "🥉"
                        : `P${pos}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extended positions */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3 text-center">
                  Other Positions
                </label>
                <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto">
                  {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updateScore({ racingPosition: pos })}
                      className={`py-3 rounded-xl text-center font-semibold transition-all ${
                        score.racingPosition === pos
                          ? "bg-primary text-slate-950"
                          : "bg-slate-800 hover:bg-slate-700"
                      }`}
                    >
                      P{pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Padel Scoring */}
          {session.activityType === "padel" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Set Scores
                </label>
                <div className="flex justify-center gap-4 text-sm text-slate-500">
                  <span className="text-emerald-400">You</span>
                  <span>vs</span>
                  <span className="text-red-400">Opponent</span>
                </div>
              </div>

              {(score.padelSets || [{ my: 0, opp: 0 }]).map((set, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 rounded-2xl p-4 sm:p-6"
                >
                  <div className="text-center text-sm text-slate-500 mb-4">
                    Set {idx + 1}
                  </div>
                  <div className="flex items-center justify-center gap-4 sm:gap-8">
                    {/* My Score */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const newSets = [...(score.padelSets || [])];
                          newSets[idx] = {
                            ...newSets[idx],
                            my: Math.max(0, newSets[idx].my - 1),
                          };
                          updateScore({ padelSets: newSets });
                        }}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-2xl"
                      >
                        −
                      </button>
                      <span className="text-5xl sm:text-6xl font-bold w-16 text-center text-emerald-400">
                        {set.my}
                      </span>
                      <button
                        onClick={() => {
                          const newSets = [...(score.padelSets || [])];
                          newSets[idx] = {
                            ...newSets[idx],
                            my: Math.min(7, newSets[idx].my + 1),
                          };
                          updateScore({ padelSets: newSets });
                        }}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center text-2xl"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-3xl text-slate-600 font-bold">-</div>

                    {/* Opponent Score */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const newSets = [...(score.padelSets || [])];
                          newSets[idx] = {
                            ...newSets[idx],
                            opp: Math.max(0, newSets[idx].opp - 1),
                          };
                          updateScore({ padelSets: newSets });
                        }}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-2xl"
                      >
                        −
                      </button>
                      <span className="text-5xl sm:text-6xl font-bold w-16 text-center text-red-400">
                        {set.opp}
                      </span>
                      <button
                        onClick={() => {
                          const newSets = [...(score.padelSets || [])];
                          newSets[idx] = {
                            ...newSets[idx],
                            opp: Math.min(7, newSets[idx].opp + 1),
                          };
                          updateScore({ padelSets: newSets });
                        }}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center text-2xl"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {(score.padelSets || []).length < 3 && (
                <button
                  onClick={() =>
                    updateScore({
                      padelSets: [
                        ...(score.padelSets || []),
                        { my: 0, opp: 0 },
                      ],
                    })
                  }
                  className="w-full py-4 rounded-xl border-2 border-dashed border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300 font-medium transition-colors"
                >
                  + Add Set
                </button>
              )}
            </div>
          )}

          {/* Generic Scoring (darts, pool, esports) */}
          {["darts", "pool", "esports"].includes(session.activityType) && (
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-8 sm:gap-16">
                {/* My Score */}
                <div className="text-center">
                  <div className="text-sm font-medium text-emerald-400 mb-4">
                    You
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={() =>
                        updateScore({ myScore: (score.myScore || 0) + 1 })
                      }
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center text-3xl font-bold"
                    >
                      +
                    </button>
                    <span className="text-6xl sm:text-7xl font-bold">
                      {score.myScore || 0}
                    </span>
                    <button
                      onClick={() =>
                        updateScore({
                          myScore: Math.max(0, (score.myScore || 0) - 1),
                        })
                      }
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-3xl font-bold"
                    >
                      −
                    </button>
                  </div>
                </div>

                {session.players.length > 0 && (
                  <>
                    <div className="text-4xl text-slate-600 font-bold">vs</div>

                    {/* Opponent Score */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-red-400 mb-4">
                        Opponent
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        <button
                          onClick={() =>
                            updateScore({
                              opponentScore: (score.opponentScore || 0) + 1,
                            })
                          }
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center text-3xl font-bold"
                        >
                          +
                        </button>
                        <span className="text-6xl sm:text-7xl font-bold">
                          {score.opponentScore || 0}
                        </span>
                        <button
                          onClick={() =>
                            updateScore({
                              opponentScore: Math.max(
                                0,
                                (score.opponentScore || 0) - 1
                              ),
                            })
                          }
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-3xl font-bold"
                        >
                          −
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quick increment buttons */}
              <div className="flex justify-center gap-2">
                {[1, 5, 10].map((val) => (
                  <button
                    key={val}
                    onClick={() =>
                      updateScore({ myScore: (score.myScore || 0) + val })
                    }
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-semibold"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* End Session Button */}
        <div className="flex justify-center">
          <button
            onClick={handleEndSession}
            disabled={isEnding}
            className="px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-red-500/25"
          >
            {isEnding ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Ending Session...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                <span>End Session</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
