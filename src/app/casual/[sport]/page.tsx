"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getSportBySlug, type SportType } from "@/config/sports";
import { useSessionContext } from "@/contexts/SessionContext";

// Mock players - replace with API
const mockPlayers = [
  { id: "1", name: "Alex Thompson", avatar: "AT" },
  { id: "2", name: "Sarah Chen", avatar: "SC" },
  { id: "3", name: "Mike Rodriguez", avatar: "MR" },
  { id: "4", name: "Emma Wilson", avatar: "EW" },
  { id: "5", name: "James Lee", avatar: "JL" },
];

export default function CasualPage() {
  const params = useParams();
  const router = useRouter();
  const sportSlug = params.sport as string;
  const sport = getSportBySlug(sportSlug);
  const { startSession, isLoading } = useSessionContext();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  if (!sport) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Sport not found
          </h1>
          <Link href="/" className="text-primary hover:text-primary-light">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Sport-specific player requirements
  const minPlayers = sport.id === "padel" ? 2 : 0;
  const canStart = selectedPlayers.length >= minPlayers;

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleStartSession = async () => {
    if (!canStart) return;

    setIsStarting(true);
    try {
      await startSession(sport.id as SportType, selectedPlayers, "casual");
      router.push("/session");
    } catch (error) {
      console.error("Failed to start casual session:", error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: sport.bgPattern }}>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center`}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={sport.icon}
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="font-bold text-white">Casual {sport.name}</h1>
                  <p className="text-xs text-slate-400">
                    Just for fun, no pressure
                  </p>
                </div>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
              Casual
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Session Info */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Casual Session</h2>
              <p className="text-slate-400">
                Play for fun without affecting your competitive stats
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-slate-800/50 text-center">
              <div className="text-sm text-slate-400">Mode</div>
              <div className="font-medium text-white">Relaxed</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 text-center">
              <div className="text-sm text-slate-400">Stats</div>
              <div className="font-medium text-slate-400">Not tracked</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 text-center">
              <div className="text-sm text-slate-400">Ranking</div>
              <div className="font-medium text-slate-400">Unaffected</div>
            </div>
          </div>
        </div>

        {/* Player Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Who&apos;s playing?
              </h2>
              <p className="text-sm text-slate-400">
                {minPlayers > 0
                  ? `Select at least ${minPlayers} player${
                      minPlayers > 1 ? "s" : ""
                    } for ${sport.name}`
                  : "Select opponents or play solo"}
              </p>
            </div>
            {selectedPlayers.length > 0 && (
              <button
                onClick={() => setSelectedPlayers([])}
                className="text-sm text-slate-400 hover:text-white"
              >
                Clear selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mockPlayers.map((player) => {
              const isSelected = selectedPlayers.includes(player.id);
              return (
                <button
                  key={player.id}
                  onClick={() => togglePlayer(player.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                    isSelected
                      ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                      : "glass-card hover:border-slate-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      isSelected
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {player.avatar}
                  </div>
                  <span className="font-medium text-white truncate">
                    {player.name}
                  </span>
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-emerald-400 ml-auto shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}

            {/* Add New Player */}
            <button className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-slate-600 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="font-medium text-slate-400">Add Player</span>
            </button>
          </div>
        </div>

        {/* Quick Start Options */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-white mb-4">Quick Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedPlayers([])}
              className={`p-4 rounded-xl text-center transition-all ${
                selectedPlayers.length === 0
                  ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                  : "bg-slate-800/50 hover:bg-slate-800"
              }`}
            >
              <div className="text-2xl mb-1">🎯</div>
              <div className="font-medium text-white">Solo Session</div>
              <div className="text-xs text-slate-400">Practice alone</div>
            </button>
            <button
              onClick={() =>
                setSelectedPlayers(mockPlayers.slice(0, 1).map((p) => p.id))
              }
              className={`p-4 rounded-xl text-center transition-all ${
                selectedPlayers.length === 1
                  ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                  : "bg-slate-800/50 hover:bg-slate-800"
              }`}
            >
              <div className="text-2xl mb-1">👥</div>
              <div className="font-medium text-white">1v1 Match</div>
              <div className="text-xs text-slate-400">
                Play against one opponent
              </div>
            </button>
          </div>
        </div>

        {/* Recent Casual Games */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h3 className="font-bold text-white">Recent Casual Games</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              {
                opponent: "Alex Thompson",
                score: "6-4, 6-3",
                time: "2 days ago",
              },
              {
                opponent: "Solo Session",
                score: "72 strokes",
                time: "3 days ago",
              },
              {
                opponent: "Sarah Chen",
                score: "4-6, 6-4, 6-2",
                time: "5 days ago",
              },
            ].map((game, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sport.gradient} flex items-center justify-center`}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={sport.icon}
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">{game.opponent}</div>
                  <div className="text-sm text-slate-400">{game.score}</div>
                </div>
                <div className="text-sm text-slate-500">{game.time}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Start Button */}
      <div className="fixed bottom-6 left-4 right-4 max-w-5xl mx-auto z-40">
        <button
          onClick={handleStartSession}
          disabled={!canStart || isStarting || isLoading}
          className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 ${
            canStart
              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-90"
              : "bg-slate-700 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isStarting || isLoading ? (
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
              Starting...
            </>
          ) : !canStart ? (
            `Select ${minPlayers - selectedPlayers.length} more player${
              minPlayers - selectedPlayers.length !== 1 ? "s" : ""
            }`
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
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {selectedPlayers.length === 0
                ? "Start Solo Session"
                : `Start with ${selectedPlayers.length} player${
                    selectedPlayers.length !== 1 ? "s" : ""
                  }`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
