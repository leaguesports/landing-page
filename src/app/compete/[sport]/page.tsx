"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getSportBySlug, type SportType } from "@/config/sports";
import { useSessionContext } from "@/contexts/SessionContext";

// Mock players - replace with API
const mockPlayers = [
  { id: "1", name: "Alex Thompson", avatar: "AT", rank: "#12", winRate: "68%" },
  { id: "2", name: "Sarah Chen", avatar: "SC", rank: "#8", winRate: "72%" },
  {
    id: "3",
    name: "Mike Rodriguez",
    avatar: "MR",
    rank: "#15",
    winRate: "61%",
  },
  { id: "4", name: "Emma Wilson", avatar: "EW", rank: "#5", winRate: "78%" },
  { id: "5", name: "James Lee", avatar: "JL", rank: "#23", winRate: "55%" },
];

// Match formats per sport
const matchFormats: Record<
  string,
  { id: string; name: string; description: string }[]
> = {
  racing: [
    {
      id: "sprint",
      name: "Sprint Race",
      description: "10 lap race, qualifying determines grid",
    },
    {
      id: "feature",
      name: "Feature Race",
      description: "25 lap race with pit strategy",
    },
    { id: "time-attack", name: "Time Attack", description: "Best lap wins" },
  ],
  golf: [
    {
      id: "stroke",
      name: "Stroke Play",
      description: "Lowest total strokes wins",
    },
    {
      id: "match",
      name: "Match Play",
      description: "Hole by hole competition",
    },
    {
      id: "stableford",
      name: "Stableford",
      description: "Points-based scoring",
    },
  ],
  padel: [
    { id: "best-of-3", name: "Best of 3", description: "First to 2 sets wins" },
    { id: "single-set", name: "Single Set", description: "One set to 6 games" },
    {
      id: "tiebreak",
      name: "Tiebreak Match",
      description: "Tiebreak to 10 points",
    },
  ],
  darts: [
    { id: "501", name: "501", description: "Classic 501 double out" },
    { id: "301", name: "301", description: "Quick 301 double out" },
    {
      id: "cricket",
      name: "Cricket",
      description: "Close numbers and hit bullseye",
    },
  ],
  pool: [
    { id: "8-ball", name: "8-Ball", description: "Classic 8-ball rules" },
    { id: "9-ball", name: "9-Ball", description: "Rotation game to 9" },
    {
      id: "straight",
      name: "Straight Pool",
      description: "First to 100 points",
    },
  ],
};

export default function CompetePage() {
  const params = useParams();
  const router = useRouter();
  const sportSlug = params.sport as string;
  const sport = getSportBySlug(sportSlug);
  const { startSession, isLoading } = useSessionContext();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
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

  const formats = matchFormats[sport.id] || [];

  // Sport-specific player requirements
  const minPlayers = sport.id === "padel" ? 2 : 1;
  const canStart =
    selectedPlayers.length >= minPlayers && selectedFormat !== "";

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleStartMatch = async () => {
    if (!canStart) return;

    setIsStarting(true);
    try {
      await startSession(sport.id as SportType, selectedPlayers, "competitive");
      router.push("/session");
    } catch (error) {
      console.error("Failed to start competitive match:", error);
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
                  <h1 className="font-bold text-white">
                    Competitive {sport.name}
                  </h1>
                  <p className="text-xs text-slate-400">
                    Stats will be tracked
                  </p>
                </div>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium flex items-center gap-1">
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
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Ranked
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Your Stats */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
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
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Competitive Match
              </h2>
              <p className="text-slate-400">
                This match will affect your ranking
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-800/50 text-center">
              <div className="text-2xl font-bold text-white">#12</div>
              <div className="text-xs text-slate-500">Your Rank</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 text-center">
              <div className="text-2xl font-bold text-white">68%</div>
              <div className="text-xs text-slate-500">Win Rate</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 text-center">
              <div className="text-2xl font-bold text-emerald-400">5W</div>
              <div className="text-xs text-slate-500">Streak</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 text-center">
              <div className="text-2xl font-bold text-white">45</div>
              <div className="text-xs text-slate-500">Matches</div>
            </div>
          </div>
        </div>

        {/* Match Format Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Match Format</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {formats.map((format) => {
              const isSelected = selectedFormat === format.id;
              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-red-500/20 border-2 border-red-500/50"
                      : "glass-card hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{format.name}</h3>
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-red-400"
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
                  </div>
                  <p className="text-sm text-slate-400">{format.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Opponent Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Select Opponent{minPlayers > 1 ? "s" : ""}
              </h2>
              <p className="text-sm text-slate-400">
                Choose who you&apos;re competing against
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

          <div className="space-y-3">
            {mockPlayers.map((player) => {
              const isSelected = selectedPlayers.includes(player.id);
              return (
                <button
                  key={player.id}
                  onClick={() => togglePlayer(player.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isSelected
                      ? "bg-red-500/20 border-2 border-red-500/50"
                      : "glass-card hover:border-slate-600"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                      isSelected
                        ? "bg-red-500 text-white"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {player.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{player.name}</div>
                    <div className="text-sm text-slate-400">
                      Rank: {player.rank} • Win Rate: {player.winRate}
                    </div>
                  </div>
                  {isSelected && (
                    <svg
                      className="w-6 h-6 text-red-400"
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
          </div>
        </div>

        {/* Match Preview */}
        {selectedPlayers.length > 0 && selectedFormat && (
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-white mb-4">Match Preview</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                  You
                </div>
                <div className="font-medium text-white">You</div>
                <div className="text-sm text-slate-400">#12</div>
              </div>
              <div className="text-center px-8">
                <div className="text-2xl font-bold text-slate-500 mb-1">VS</div>
                <div className="text-sm text-slate-400">
                  {formats.find((f) => f.id === selectedFormat)?.name}
                </div>
              </div>
              <div className="text-center">
                {selectedPlayers.length === 1 ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                      {
                        mockPlayers.find((p) => p.id === selectedPlayers[0])
                          ?.avatar
                      }
                    </div>
                    <div className="font-medium text-white">
                      {
                        mockPlayers.find((p) => p.id === selectedPlayers[0])
                          ?.name
                      }
                    </div>
                    <div className="text-sm text-slate-400">
                      {
                        mockPlayers.find((p) => p.id === selectedPlayers[0])
                          ?.rank
                      }
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex -space-x-4 justify-center mb-2">
                      {selectedPlayers.slice(0, 3).map((id) => (
                        <div
                          key={id}
                          className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-bold border-2 border-slate-900"
                        >
                          {mockPlayers.find((p) => p.id === id)?.avatar}
                        </div>
                      ))}
                    </div>
                    <div className="font-medium text-white">
                      {selectedPlayers.length} Opponents
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Start Button */}
      <div className="fixed bottom-6 left-4 right-4 max-w-5xl mx-auto z-40">
        <button
          onClick={handleStartMatch}
          disabled={!canStart || isStarting || isLoading}
          className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 ${
            canStart
              ? "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90"
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
              Starting Match...
            </>
          ) : !selectedFormat ? (
            "Select a match format"
          ) : selectedPlayers.length < minPlayers ? (
            `Select ${minPlayers - selectedPlayers.length} more opponent${
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
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Start Ranked Match
            </>
          )}
        </button>
      </div>
    </div>
  );
}
