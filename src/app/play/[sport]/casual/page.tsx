"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getSportBySlug, type SportType } from "@/config/sports";
import { useSessionContext } from "@/contexts/SessionContext";

const mockPlayers = [
  { id: "1", name: "Alex Thompson", avatar: "AT" },
  { id: "2", name: "Sarah Chen", avatar: "SC" },
  { id: "3", name: "Mike Rodriguez", avatar: "MR" },
  { id: "4", name: "Emma Wilson", avatar: "EW" },
  { id: "5", name: "James Lee", avatar: "JL" },
];

export default function SportCasualPage() {
  const params = useParams();
  const router = useRouter();
  const sportSlug = params.sport as string;
  const sport = getSportBySlug(sportSlug);
  const { startSession, isLoading } = useSessionContext();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  if (!sport) return null;

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
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">Casual Play</h1>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
            Relaxed
          </span>
        </div>
        <p className="text-slate-400">
          Play for fun without affecting your competitive stats
        </p>
      </div>

      {/* Info Card */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-slate-800/50">
            <div className="text-sm text-slate-400">Mode</div>
            <div className="font-medium text-white">Relaxed</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50">
            <div className="text-sm text-slate-400">Stats</div>
            <div className="font-medium text-slate-500">Not tracked</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50">
            <div className="text-sm text-slate-400">Ranking</div>
            <div className="font-medium text-slate-500">Unaffected</div>
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
                  }`
                : "Select opponents or play solo"}
            </p>
          </div>
          {selectedPlayers.length > 0 && (
            <button
              onClick={() => setSelectedPlayers([])}
              className="text-sm text-slate-400 hover:text-white"
            >
              Clear
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

      {/* Quick Options */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h3 className="font-bold text-white mb-4">Quick Start</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedPlayers([])}
            className={`p-4 rounded-xl text-center transition-all ${
              selectedPlayers.length === 0
                ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                : "bg-slate-800/50 hover:bg-slate-800"
            }`}
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-slate-700 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
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
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-slate-700 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="font-medium text-white">1v1 Match</div>
            <div className="text-xs text-slate-400">
              Play against one opponent
            </div>
          </button>
        </div>
      </div>

      {/* Floating Start Button */}
      <div className="fixed bottom-24 md:bottom-6 left-4 right-4 max-w-5xl mx-auto z-40">
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
