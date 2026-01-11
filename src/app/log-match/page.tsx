"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogMatch } from "@/hooks/useSession";

type ActivityType = "racing" | "golf" | "padel" | "esports" | "darts" | "pool";
type MatchType = "casual" | "practice" | "competitive";

interface MatchTypeConfig {
  icon: string;
  label: string;
  description: string;
  color: string;
}

const matchTypeConfig: Record<MatchType, MatchTypeConfig> = {
  casual: {
    icon: "😊",
    label: "Casual",
    description: "Just for fun",
    color: "from-emerald-500 to-green-600",
  },
  practice: {
    icon: "🎯",
    label: "Practice",
    description: "Training session",
    color: "from-amber-500 to-orange-600",
  },
  competitive: {
    icon: "🏆",
    label: "Competitive",
    description: "Ranked match",
    color: "from-red-500 to-rose-600",
  },
};

interface ActivityConfig {
  icon: string;
  gradient: string;
  label: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  soloAllowed: boolean;
}

const activityConfig: Record<ActivityType, ActivityConfig> = {
  racing: {
    icon: "🏎️",
    gradient: "from-red-500 to-rose-600",
    label: "Sim Racing",
    description: "Virtual motorsport races",
    minPlayers: 0,
    maxPlayers: 24,
    soloAllowed: true,
  },
  golf: {
    icon: "⛳",
    gradient: "from-emerald-500 to-green-600",
    label: "Sim Golf",
    description: "Virtual golf sessions",
    minPlayers: 0,
    maxPlayers: 4,
    soloAllowed: true,
  },
  padel: {
    icon: "🎾",
    gradient: "from-amber-500 to-orange-600",
    label: "Padel",
    description: "Doubles court sport",
    minPlayers: 2,
    maxPlayers: 4,
    soloAllowed: false,
  },
  esports: {
    icon: "🎮",
    gradient: "from-violet-500 to-purple-600",
    label: "Esports",
    description: "Competitive gaming",
    minPlayers: 0,
    maxPlayers: 10,
    soloAllowed: true,
  },
  darts: {
    icon: "🎯",
    gradient: "from-sky-500 to-blue-600",
    label: "Darts",
    description: "Darts matches",
    minPlayers: 0,
    maxPlayers: 8,
    soloAllowed: true,
  },
  pool: {
    icon: "🎱",
    gradient: "from-slate-500 to-gray-600",
    label: "Pool",
    description: "Billiards & pool",
    minPlayers: 1,
    maxPlayers: 2,
    soloAllowed: false,
  },
};

interface Member {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away";
}

// Mock members - in real app, fetch from API
const mockMembers: Member[] = [
  { id: "1", name: "Alex Thompson", avatar: "AT", status: "online" },
  { id: "2", name: "Sarah Chen", avatar: "SC", status: "online" },
  { id: "3", name: "Marcus Williams", avatar: "MW", status: "away" },
  { id: "4", name: "Emily Rodriguez", avatar: "ER", status: "offline" },
  { id: "5", name: "David Kim", avatar: "DK", status: "online" },
  { id: "6", name: "Jessica Patel", avatar: "JP", status: "offline" },
  { id: "7", name: "Ryan O'Connor", avatar: "RO", status: "online" },
  { id: "8", name: "Michelle Santos", avatar: "MS", status: "away" },
];

export default function LogMatchPage() {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Step state
  const [step, setStep] = useState(1);

  // Form state
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [matchType, setMatchType] = useState<MatchType>("casual");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerSearch, setPlayerSearch] = useState("");

  // Score state
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [golfStrokes, setGolfStrokes] = useState(72);
  const [racingPosition, setRacingPosition] = useState(1);
  const [padelSets, setPadelSets] = useState<{ my: number; opp: number }[]>([
    { my: 0, opp: 0 },
  ]);

  const [members] = useState<Member[]>(mockMembers);

  // Match logging
  const { isLogging, error, logMatch } = useLogMatch();

  const config = activityType ? activityConfig[activityType] : null;

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(playerSearch.toLowerCase()) &&
      !selectedPlayers.includes(m.id)
  );

  const togglePlayer = (id: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const canProceedToStep2 = activityType !== null;

  const canSubmit = () => {
    if (!activityType || !config) return false;

    // Check minimum players
    if (!config.soloAllowed && selectedPlayers.length < config.minPlayers) {
      return false;
    }

    return true;
  };

  const getPlayerError = () => {
    if (!config) return null;

    if (!config.soloAllowed && selectedPlayers.length < config.minPlayers) {
      return `${config.label} requires at least ${
        config.minPlayers
      } other player${config.minPlayers > 1 ? "s" : ""}`;
    }

    return null;
  };

  // Build score data based on activity type
  const getScoreData = (): Record<string, unknown> => {
    switch (activityType) {
      case "golf":
        return { strokes: golfStrokes };
      case "racing":
        return { position: racingPosition };
      case "padel":
        return { sets: padelSets };
      default:
        return { myScore, opponentScore };
    }
  };

  const handleLogMatch = async () => {
    if (!canSubmit() || !activityType) return;
    const success = await logMatch(
      activityType,
      selectedPlayers,
      getScoreData(),
      matchType
    );
    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="relative min-h-screen noise">
      {/* Background effects */}
      <div className="mesh-gradient" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-slate-950 font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold font-heading">
                League<span className="gradient-text">Sports</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/communities"
                className="text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Communities
              </Link>
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
              >
                {showMobileMenu ? (
                  <svg
                    className="w-6 h-6"
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
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-slate-800/50 bg-slate-900/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/communities"
                className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Communities
              </Link>
              <Link
                href="/login"
                className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
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
            <span>Back to home</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading">
                  Log Match
                </h1>
                <p className="text-slate-400 text-sm">
                  Record a completed match
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                step >= 1
                  ? "bg-primary text-slate-950"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              1
            </div>
            <div
              className={`flex-1 h-1 rounded-full transition-colors ${
                step >= 2 ? "bg-primary" : "bg-slate-700"
              }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                step >= 2
                  ? "bg-primary text-slate-950"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              2
            </div>
            <div
              className={`flex-1 h-1 rounded-full transition-colors ${
                step >= 3 ? "bg-primary" : "bg-slate-700"
              }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                step >= 3
                  ? "bg-primary text-slate-950"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              3
            </div>
          </div>

          {/* Step 1: Activity Selection */}
          {step === 1 && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up">
              <h2 className="text-xl font-bold font-heading mb-2">
                What did you play?
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Select the activity you played
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {(Object.keys(activityConfig) as ActivityType[]).map((type) => {
                  const cfg = activityConfig[type];
                  const isSelected = activityType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setActivityType(type)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all text-center active:scale-95 ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-slate-700 hover:border-slate-600 active:bg-slate-800/50"
                      }`}
                    >
                      <div className="text-3xl sm:text-4xl mb-2">
                        {cfg.icon}
                      </div>
                      <div className="font-medium text-sm sm:text-base">
                        {cfg.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {cfg.soloAllowed
                          ? "Solo or multiplayer"
                          : `${cfg.minPlayers}+ players`}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                className="w-full btn-primary py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Continue</span>
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
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Step 2: Player Selection */}
          {step === 2 && config && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up">
              {/* Activity indicator */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700/50">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl`}
                >
                  {config.icon}
                </div>
                <div>
                  <div className="font-bold">{config.label}</div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-primary hover:underline"
                  >
                    Change activity
                  </button>
                </div>
              </div>

              {/* Match Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Match Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(matchTypeConfig) as MatchType[]).map((type) => {
                    const cfg = matchTypeConfig[type];
                    const isSelected = matchType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setMatchType(type)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <div className="text-xl mb-1">{cfg.icon}</div>
                        <div className="text-sm font-medium">{cfg.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Player Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-300">
                    {config.soloAllowed
                      ? "Who did you play with? (optional)"
                      : "Who did you play against?"}
                  </label>
                  {!config.soloAllowed && (
                    <span className="text-xs text-amber-400">
                      Min {config.minPlayers} player
                      {config.minPlayers > 1 ? "s" : ""} required
                    </span>
                  )}
                </div>

                {/* Selected Players */}
                {selectedPlayers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedPlayers.map((id) => {
                      const member = members.find((m) => m.id === id);
                      if (!member) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/20 border border-primary/30"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-xs font-bold">
                            {member.avatar}
                          </div>
                          <span className="text-sm text-white">
                            {member.name}
                          </span>
                          <button
                            onClick={() => togglePlayer(id)}
                            className="text-slate-400 hover:text-white ml-1"
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Solo indicator for solo-allowed activities */}
                {config.soloAllowed &&
                  selectedPlayers.length === 0 &&
                  !playerSearch && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          Solo Session
                        </div>
                        <div className="text-xs text-slate-500">
                          Add players below or continue solo
                        </div>
                      </div>
                    </div>
                  )}

                {/* Player search */}
                <div className="relative mb-3">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Member list */}
                <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide">
                  {filteredMembers.slice(0, 6).map((member) => (
                    <button
                      key={member.id}
                      onClick={() => togglePlayer(member.id)}
                      disabled={selectedPlayers.length >= config.maxPlayers}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-bold text-sm">
                          {member.avatar}
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                            member.status === "online"
                              ? "bg-green-500"
                              : member.status === "away"
                              ? "bg-amber-500"
                              : "bg-slate-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{member.name}</div>
                        <div className="text-xs text-slate-500 capitalize">
                          {member.status}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  ))}
                </div>

                {/* Error messages */}
                {(getPlayerError() || error) && (
                  <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <svg
                      className="w-5 h-5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>{getPlayerError() || error}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary px-6 py-4 rounded-xl font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canSubmit()}
                  className="flex-1 btn-primary py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Continue to Scores</span>
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Score Recording */}
          {step === 3 && config && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up">
              {/* Activity indicator */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700/50">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl`}
                >
                  {config.icon}
                </div>
                <div>
                  <div className="font-bold">{config.label} - Record Score</div>
                  <div className="text-sm text-slate-400">
                    {selectedPlayers.length > 0
                      ? `vs ${selectedPlayers
                          .map(
                            (id) =>
                              members
                                .find((m) => m.id === id)
                                ?.name.split(" ")[0]
                          )
                          .join(", ")}`
                      : "Solo session"}
                  </div>
                </div>
              </div>

              {/* Activity-specific scoring */}
              {activityType === "golf" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Total Strokes
                  </label>
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() =>
                        setGolfStrokes(Math.max(50, golfStrokes - 1))
                      }
                      className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-2xl transition-colors"
                    >
                      −
                    </button>
                    <div className="text-center">
                      <div className="text-5xl font-bold font-heading">
                        {golfStrokes}
                      </div>
                      <div
                        className={`text-sm mt-1 ${
                          golfStrokes < 72
                            ? "text-emerald-400"
                            : golfStrokes > 72
                            ? "text-red-400"
                            : "text-slate-400"
                        }`}
                      >
                        {golfStrokes < 72
                          ? `${72 - golfStrokes} under par`
                          : golfStrokes > 72
                          ? `${golfStrokes - 72} over par`
                          : "Even par"}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setGolfStrokes(Math.min(150, golfStrokes + 1))
                      }
                      className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-2xl transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {activityType === "racing" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Finishing Position
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setRacingPosition(pos)}
                        className={`py-4 rounded-xl text-center font-bold transition-all ${
                          racingPosition === pos
                            ? pos === 1
                              ? "bg-amber-500 text-white"
                              : pos === 2
                              ? "bg-slate-400 text-slate-900"
                              : pos === 3
                              ? "bg-amber-700 text-white"
                              : "bg-primary text-slate-950"
                            : "bg-slate-800 hover:bg-slate-700"
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
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {[6, 7, 8, 9, 10].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setRacingPosition(pos)}
                        className={`py-3 rounded-lg text-center font-medium transition-all ${
                          racingPosition === pos
                            ? "bg-slate-600 text-white"
                            : "bg-slate-800/50 text-slate-500 hover:bg-slate-700"
                        }`}
                      >
                        P{pos}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activityType === "padel" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Set Scores
                  </label>
                  {padelSets.map((set, idx) => (
                    <div key={idx} className="flex items-center gap-4 mb-3">
                      <span className="text-sm text-slate-400 w-16">
                        Set {idx + 1}
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() => {
                            const newSets = [...padelSets];
                            newSets[idx] = {
                              ...newSets[idx],
                              my: Math.max(0, newSets[idx].my - 1),
                            };
                            setPadelSets(newSets);
                          }}
                          className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
                        >
                          −
                        </button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-bold text-emerald-400">
                            {set.my}
                          </span>
                          <span className="text-slate-500 mx-2">-</span>
                          <span className="text-2xl font-bold text-red-400">
                            {set.opp}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const newSets = [...padelSets];
                            newSets[idx] = {
                              ...newSets[idx],
                              opp: Math.max(0, newSets[idx].opp - 1),
                            };
                            setPadelSets(newSets);
                          }}
                          className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
                        >
                          −
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newSets = [...padelSets];
                            newSets[idx] = {
                              ...newSets[idx],
                              my: Math.min(7, newSets[idx].my + 1),
                            };
                            setPadelSets(newSets);
                          }}
                          className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center text-sm font-medium"
                        >
                          You+
                        </button>
                        <button
                          onClick={() => {
                            const newSets = [...padelSets];
                            newSets[idx] = {
                              ...newSets[idx],
                              opp: Math.min(7, newSets[idx].opp + 1),
                            };
                            setPadelSets(newSets);
                          }}
                          className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center text-sm font-medium"
                        >
                          Opp+
                        </button>
                      </div>
                    </div>
                  ))}
                  {padelSets.length < 3 && (
                    <button
                      onClick={() =>
                        setPadelSets([...padelSets, { my: 0, opp: 0 }])
                      }
                      className="text-primary text-sm hover:underline"
                    >
                      + Add another set
                    </button>
                  )}
                </div>
              )}

              {(activityType === "darts" ||
                activityType === "pool" ||
                activityType === "esports") && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Final Score
                  </label>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <div className="text-sm text-emerald-400 mb-2">You</div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setMyScore(Math.max(0, myScore - 1))}
                          className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xl"
                        >
                          −
                        </button>
                        <div className="text-4xl font-bold w-16 text-center">
                          {myScore}
                        </div>
                        <button
                          onClick={() => setMyScore(myScore + 1)}
                          className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center text-xl"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {selectedPlayers.length > 0 && (
                      <>
                        <div className="text-3xl text-slate-500">vs</div>
                        <div className="text-center">
                          <div className="text-sm text-red-400 mb-2">
                            Opponent
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                setOpponentScore(Math.max(0, opponentScore - 1))
                              }
                              className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xl"
                            >
                              −
                            </button>
                            <div className="text-4xl font-bold w-16 text-center">
                              {opponentScore}
                            </div>
                            <button
                              onClick={() =>
                                setOpponentScore(opponentScore + 1)
                              }
                              className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center text-xl"
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

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary px-6 py-4 rounded-xl font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleLogMatch}
                  disabled={isLogging}
                  className="flex-1 btn-primary py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLogging ? (
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
                      <span>Saving...</span>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Save Match</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
