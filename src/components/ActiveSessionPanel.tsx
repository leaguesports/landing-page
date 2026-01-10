"use client";

import { useSessionContextSafe } from "@/contexts/SessionContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const activityConfig: Record<
  string,
  { icon: string; label: string; gradient: string }
> = {
  racing: {
    icon: "🏎️",
    label: "Sim Racing",
    gradient: "from-red-500 to-rose-600",
  },
  golf: {
    icon: "⛳",
    label: "Sim Golf",
    gradient: "from-emerald-500 to-green-600",
  },
  padel: {
    icon: "🎾",
    label: "Padel",
    gradient: "from-amber-500 to-orange-600",
  },
  esports: {
    icon: "🎮",
    label: "Esports",
    gradient: "from-violet-500 to-purple-600",
  },
  darts: {
    icon: "🎯",
    label: "Darts",
    gradient: "from-sky-500 to-blue-600",
  },
  pool: {
    icon: "🎱",
    label: "Pool",
    gradient: "from-slate-500 to-gray-600",
  },
};

export default function ActiveSessionPanel() {
  const sessionContext = useSessionContextSafe();
  const pathname = usePathname();

  // Don't render if no context or no active session
  if (!sessionContext || !sessionContext.session) {
    return null;
  }

  const {
    session,
    elapsedTimeFormatted,
    score,
    updateScore,
    isPanelExpanded,
    setPanelExpanded,
    isPanelMinimized,
    setPanelMinimized,
    isEnding,
    endSession,
    error,
  } = sessionContext;

  // Don't show panel on pages that have their own session UI
  const isOnSessionPage =
    pathname === "/session" ||
    pathname === "/quickplay" ||
    pathname === "/log-match";

  if (isOnSessionPage) {
    return null;
  }

  const config = activityConfig[session.activityType] || {
    icon: "🎯",
    label: session.activityType,
    gradient: "from-slate-500 to-gray-600",
  };

  // Minimized view - just a small floating button
  if (isPanelMinimized) {
    return (
      <button
        onClick={() => setPanelMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:scale-105 transition-transform"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="text-lg">{config.icon}</span>
        <span className="font-mono font-bold">{elapsedTimeFormatted}</span>
      </button>
    );
  }

  // Collapsed view - compact bar
  if (!isPanelExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50 glass-card rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10 overflow-hidden animate-fade-in-up">
        <div className="flex items-center gap-3 p-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
              Live
            </span>
          </div>

          {/* Activity icon */}
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-xl`}
          >
            {config.icon}
          </div>

          {/* Timer */}
          <div className="text-right">
            <div className="font-mono text-xl font-bold text-white">
              {elapsedTimeFormatted}
            </div>
            <div className="text-xs text-slate-400">{config.label}</div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-2 pl-3 border-l border-slate-700">
            <button
              onClick={() => setPanelExpanded(true)}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              title="Expand scoring"
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
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
            <button
              onClick={() => setPanelMinimized(true)}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              title="Minimize"
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
                  d="M20 12H4"
                />
              </svg>
            </button>
            {!isOnSessionPage && (
              <Link
                href="/session"
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                title="Go to full scoring view"
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Expanded view - full scoring panel
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 glass-card rounded-2xl border border-emerald-500/30 shadow-xl shadow-emerald-500/10 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-xl`}
          >
            {config.icon}
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              {config.label}
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="font-mono text-lg font-bold text-primary">
              {elapsedTimeFormatted}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPanelExpanded(false)}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            title="Collapse"
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Score Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {/* Golf Scoring */}
        {session.activityType === "golf" && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 text-center">
              Total Strokes
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  updateScore({
                    golfStrokes: Math.max(1, (score.golfStrokes || 72) - 1),
                  })
                }
                className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-2xl transition-colors"
              >
                −
              </button>
              <div className="text-center">
                <div className="text-4xl font-bold font-heading">
                  {score.golfStrokes || 72}
                </div>
                <div
                  className={`text-xs mt-1 ${
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
                    golfStrokes: Math.min(200, (score.golfStrokes || 72) + 1),
                  })
                }
                className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center text-2xl transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Racing Scoring */}
        {session.activityType === "racing" && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 text-center">
              Position
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((pos) => (
                <button
                  key={pos}
                  onClick={() => updateScore({ racingPosition: pos })}
                  className={`py-3 rounded-xl text-center font-bold transition-all ${
                    score.racingPosition === pos
                      ? pos === 1
                        ? "bg-amber-500 text-white"
                        : pos === 2
                        ? "bg-slate-400 text-slate-900"
                        : pos === 3
                        ? "bg-amber-700 text-white"
                        : "bg-primary text-slate-950"
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
        )}

        {/* Padel Scoring */}
        {session.activityType === "padel" && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Set Scores
            </label>
            <div className="space-y-2">
              {(score.padelSets || [{ my: 0, opp: 0 }]).map((set, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2"
                >
                  <span className="text-xs text-slate-500 w-10">
                    Set {idx + 1}
                  </span>
                  <div className="flex items-center gap-1 flex-1 justify-center">
                    <button
                      onClick={() => {
                        const newSets = [...(score.padelSets || [])];
                        newSets[idx] = {
                          ...newSets[idx],
                          my: Math.max(0, newSets[idx].my - 1),
                        };
                        updateScore({ padelSets: newSets });
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-sm"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold w-8 text-center text-emerald-400">
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
                      className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-slate-500 font-bold">-</span>
                  <div className="flex items-center gap-1 flex-1 justify-center">
                    <button
                      onClick={() => {
                        const newSets = [...(score.padelSets || [])];
                        newSets[idx] = {
                          ...newSets[idx],
                          opp: Math.max(0, newSets[idx].opp - 1),
                        };
                        updateScore({ padelSets: newSets });
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-sm"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold w-8 text-center text-red-400">
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
                      className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center text-sm"
                    >
                      +
                    </button>
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
                  className="w-full py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-slate-500 text-sm"
                >
                  + Add Set
                </button>
              )}
            </div>
          </div>
        )}

        {/* Generic Scoring (darts, pool, esports) */}
        {["darts", "pool", "esports"].includes(session.activityType) && (
          <div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-xs text-emerald-400 mb-2">You</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateScore({
                        myScore: Math.max(0, (score.myScore || 0) - 1),
                      })
                    }
                    className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-xl"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold w-12 text-center">
                    {score.myScore || 0}
                  </span>
                  <button
                    onClick={() =>
                      updateScore({ myScore: (score.myScore || 0) + 1 })
                    }
                    className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
              {session.players.length > 0 && (
                <>
                  <div className="text-2xl text-slate-500">vs</div>
                  <div className="text-center">
                    <div className="text-xs text-red-400 mb-2">Opp</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateScore({
                            opponentScore: Math.max(
                              0,
                              (score.opponentScore || 0) - 1
                            ),
                          })
                        }
                        className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-xl"
                      >
                        −
                      </button>
                      <span className="text-3xl font-bold w-12 text-center">
                        {score.opponentScore || 0}
                      </span>
                      <button
                        onClick={() =>
                          updateScore({
                            opponentScore: (score.opponentScore || 0) + 1,
                          })
                        }
                        className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <button
          onClick={endSession}
          disabled={isEnding}
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isEnding ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
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
              <span>Ending...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
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
    </div>
  );
}
