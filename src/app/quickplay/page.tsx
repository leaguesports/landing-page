"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@/contexts/SessionContext";

type ActivityType = "racing" | "golf" | "padel" | "esports" | "darts" | "pool";
type MatchType = "casual" | "practice" | "competitive";

// Drill/Objective system for practice mode
interface DrillObjective {
  id: string;
  name: string;
  description: string;
  icon: string;
  configurable?: {
    label: string;
    type: "number" | "time" | "percentage";
    default: number;
    min?: number;
    max?: number;
    unit?: string;
  }[];
}

const drillsByActivity: Record<ActivityType, DrillObjective[]> = {
  racing: [
    {
      id: "lap-consistency",
      name: "Lap Consistency",
      description: "Maintain consistent lap times within a target variance",
      icon: "🔄",
      configurable: [
        {
          label: "Number of laps",
          type: "number",
          default: 10,
          min: 3,
          max: 50,
        },
        {
          label: "Target variance",
          type: "time",
          default: 0.5,
          min: 0.1,
          max: 5,
          unit: "sec",
        },
      ],
    },
    {
      id: "hot-laps",
      name: "Hot Laps",
      description: "Set your fastest lap time",
      icon: "🔥",
      configurable: [
        {
          label: "Number of attempts",
          type: "number",
          default: 5,
          min: 1,
          max: 20,
        },
      ],
    },
    {
      id: "endurance",
      name: "Endurance Run",
      description: "Complete a set number of laps without major errors",
      icon: "⏱️",
      configurable: [
        { label: "Total laps", type: "number", default: 20, min: 5, max: 100 },
      ],
    },
    {
      id: "sector-focus",
      name: "Sector Focus",
      description: "Practice specific track sections",
      icon: "📍",
    },
    {
      id: "racecraft",
      name: "Racecraft",
      description: "Practice overtaking and defending",
      icon: "🏁",
    },
  ],
  golf: [
    {
      id: "putting-drill",
      name: "Putting Drill",
      description: "Practice putts from various distances",
      icon: "🕳️",
      configurable: [
        {
          label: "Number of putts",
          type: "number",
          default: 20,
          min: 5,
          max: 50,
        },
        {
          label: "Target make %",
          type: "percentage",
          default: 70,
          min: 50,
          max: 100,
          unit: "%",
        },
      ],
    },
    {
      id: "driving-range",
      name: "Driving Range",
      description: "Work on your long game",
      icon: "🏌️",
      configurable: [
        {
          label: "Number of drives",
          type: "number",
          default: 20,
          min: 5,
          max: 50,
        },
      ],
    },
    {
      id: "approach-shots",
      name: "Approach Shots",
      description: "Practice iron shots to the green",
      icon: "🎯",
      configurable: [
        {
          label: "Number of shots",
          type: "number",
          default: 15,
          min: 5,
          max: 30,
        },
      ],
    },
    {
      id: "short-game",
      name: "Short Game",
      description: "Chipping and pitching practice",
      icon: "⛳",
    },
    {
      id: "course-management",
      name: "Course Management",
      description: "Strategic play through specific holes",
      icon: "🗺️",
    },
  ],
  padel: [
    {
      id: "serve-practice",
      name: "Serve Practice",
      description: "Improve your serve accuracy and power",
      icon: "💨",
      configurable: [
        {
          label: "Number of serves",
          type: "number",
          default: 30,
          min: 10,
          max: 100,
        },
        {
          label: "Target accuracy",
          type: "percentage",
          default: 70,
          min: 50,
          max: 100,
          unit: "%",
        },
      ],
    },
    {
      id: "volley-drill",
      name: "Volley Drill",
      description: "Net play and reaction training",
      icon: "🎾",
      configurable: [
        {
          label: "Duration",
          type: "number",
          default: 15,
          min: 5,
          max: 30,
          unit: "min",
        },
      ],
    },
    {
      id: "bandeja-practice",
      name: "Bandeja Practice",
      description: "Master the signature padel overhead shot",
      icon: "🌀",
    },
    {
      id: "wall-play",
      name: "Wall Play",
      description: "Practice using the glass walls",
      icon: "🧱",
    },
    {
      id: "rally-endurance",
      name: "Rally Endurance",
      description: "Maintain long rallies without errors",
      icon: "🔁",
      configurable: [
        {
          label: "Target rally length",
          type: "number",
          default: 20,
          min: 10,
          max: 100,
          unit: "shots",
        },
      ],
    },
  ],
  esports: [
    {
      id: "aim-training",
      name: "Aim Training",
      description: "Improve your accuracy and reaction time",
      icon: "🎯",
      configurable: [
        {
          label: "Duration",
          type: "number",
          default: 15,
          min: 5,
          max: 60,
          unit: "min",
        },
      ],
    },
    {
      id: "mechanics-drill",
      name: "Mechanics Drill",
      description: "Practice game-specific mechanics",
      icon: "⚙️",
    },
    {
      id: "strategy-review",
      name: "Strategy Review",
      description: "Study and practice specific strategies",
      icon: "🧠",
    },
    {
      id: "warm-up",
      name: "Warm-up Routine",
      description: "Standard pre-game warm-up exercises",
      icon: "🔥",
      configurable: [
        {
          label: "Duration",
          type: "number",
          default: 10,
          min: 5,
          max: 30,
          unit: "min",
        },
      ],
    },
  ],
  darts: [
    {
      id: "double-practice",
      name: "Double Practice",
      description: "Focus on hitting doubles for checkouts",
      icon: "✌️",
      configurable: [
        {
          label: "Number of throws",
          type: "number",
          default: 50,
          min: 20,
          max: 100,
        },
      ],
    },
    {
      id: "triple-20",
      name: "Triple 20 Practice",
      description: "Maximize your scoring potential",
      icon: "🎯",
      configurable: [
        {
          label: "Number of throws",
          type: "number",
          default: 30,
          min: 10,
          max: 100,
        },
      ],
    },
    {
      id: "checkout-drills",
      name: "Checkout Drills",
      description: "Practice common checkout combinations",
      icon: "✅",
    },
    {
      id: "around-the-board",
      name: "Around the Board",
      description: "Hit each number in sequence",
      icon: "🔄",
    },
  ],
  pool: [
    {
      id: "break-practice",
      name: "Break Practice",
      description: "Perfect your opening break shot",
      icon: "💥",
      configurable: [
        {
          label: "Number of breaks",
          type: "number",
          default: 20,
          min: 5,
          max: 50,
        },
      ],
    },
    {
      id: "position-play",
      name: "Position Play",
      description: "Work on cue ball control",
      icon: "📍",
    },
    {
      id: "safety-drills",
      name: "Safety Drills",
      description: "Practice defensive play",
      icon: "🛡️",
    },
    {
      id: "run-out-practice",
      name: "Run-out Practice",
      description: "Clear the table from specific layouts",
      icon: "🏃",
    },
    {
      id: "long-shots",
      name: "Long Shot Practice",
      description: "Improve accuracy on difficult long pots",
      icon: "📏",
      configurable: [
        {
          label: "Number of shots",
          type: "number",
          default: 25,
          min: 10,
          max: 50,
        },
      ],
    },
  ],
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

export default function QuickplayPage() {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Step state - Step 0 is mode selection
  const [step, setStep] = useState(0);

  // Form state
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [matchType, setMatchType] = useState<MatchType | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerSearch, setPlayerSearch] = useState("");

  // Drill state for practice mode
  const [selectedDrills, setSelectedDrills] = useState<string[]>([]);
  const [drillConfigs, setDrillConfigs] = useState<
    Record<string, Record<string, number>>
  >({});

  const [members] = useState<Member[]>(mockMembers);

  // Session context
  const {
    isLoading: isStartingSession,
    error,
    startSession,
    clearError,
  } = useSessionContext();

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

  // Drill management
  const availableDrills = activityType ? drillsByActivity[activityType] : [];

  const toggleDrill = (drillId: string) => {
    setSelectedDrills((prev) => {
      const isSelected = prev.includes(drillId);
      if (isSelected) {
        // Remove drill and its config
        setDrillConfigs((configs) => {
          const newConfigs = { ...configs };
          delete newConfigs[drillId];
          return newConfigs;
        });
        return prev.filter((id) => id !== drillId);
      } else {
        // Add drill with default config
        const drill = availableDrills.find((d) => d.id === drillId);
        if (drill?.configurable) {
          const defaultConfig: Record<string, number> = {};
          drill.configurable.forEach((cfg) => {
            defaultConfig[cfg.label] = cfg.default;
          });
          setDrillConfigs((configs) => ({
            ...configs,
            [drillId]: defaultConfig,
          }));
        }
        return [...prev, drillId];
      }
    });
  };

  const updateDrillConfig = (drillId: string, label: string, value: number) => {
    setDrillConfigs((configs) => ({
      ...configs,
      [drillId]: {
        ...configs[drillId],
        [label]: value,
      },
    }));
  };

  const canProceedToStep2 = activityType !== null;

  const canSubmit = () => {
    if (!activityType || !config || !matchType) return false;

    // Check minimum players (relaxed for practice mode - can practice solo)
    if (
      matchType !== "practice" &&
      !config.soloAllowed &&
      selectedPlayers.length < config.minPlayers
    ) {
      return false;
    }

    // Competitive mode always requires opponents
    if (matchType === "competitive" && selectedPlayers.length === 0) {
      return false;
    }

    // Practice mode requires at least one drill selected
    if (matchType === "practice" && selectedDrills.length === 0) {
      return false;
    }

    return true;
  };

  const getPlayerError = () => {
    if (!config) return null;

    // Don't show player error in practice mode (solo practice is allowed)
    if (matchType === "practice") return null;

    if (!config.soloAllowed && selectedPlayers.length < config.minPlayers) {
      return `${config.label} requires at least ${
        config.minPlayers
      } other player${config.minPlayers > 1 ? "s" : ""}`;
    }

    return null;
  };

  // Build drill data for practice session
  const buildPracticeDrills = () => {
    return selectedDrills.map((drillId) => {
      const drill = availableDrills.find((d) => d.id === drillId);
      return {
        id: drillId,
        name: drill?.name || drillId,
        config: drillConfigs[drillId] || {},
      };
    });
  };

  const handleStartSession = async () => {
    if (!canSubmit() || !activityType || !matchType) return;
    clearError();

    const practiceData =
      matchType === "practice"
        ? {
            drills: buildPracticeDrills(),
          }
        : undefined;

    const newSession = await startSession(
      activityType,
      selectedPlayers,
      matchType,
      practiceData
    );
    if (newSession) {
      router.push("/session");
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
                href="/log-match"
                className="text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Log Match
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
                href="/log-match"
                className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Log Match
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

          {/* Header - Dynamic based on mode */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  matchType === "practice"
                    ? "bg-gradient-to-br from-amber-500 to-orange-500"
                    : matchType === "competitive"
                    ? "bg-gradient-to-br from-red-500 to-rose-600"
                    : "bg-gradient-to-br from-emerald-500 to-green-600"
                }`}
              >
                {matchType === "practice" ? (
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ) : matchType === "competitive" ? (
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
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                ) : step === 0 ? (
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ) : (
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
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading">
                  {matchType === "practice"
                    ? "Practice Session"
                    : matchType === "competitive"
                    ? "Competitive Match"
                    : step === 0
                    ? "Start Session"
                    : "Casual Play"}
                </h1>
                <p className="text-slate-400 text-sm">
                  {matchType === "practice"
                    ? "Train and improve your skills"
                    : matchType === "competitive"
                    ? "Ranked match with full tracking"
                    : step === 0
                    ? "Choose how you want to play"
                    : "Just for fun, no pressure"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps - Only show after mode selection */}
          {step > 0 && (
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
            </div>
          )}

          {/* Step 0: Mode Selection */}
          {step === 0 && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up">
              <h2 className="text-xl font-bold font-heading mb-2">
                How do you want to play?
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Choose the type of session you want to start
              </p>

              <div className="grid gap-4">
                {/* Casual Play */}
                <button
                  onClick={() => {
                    setMatchType("casual");
                    setStep(1);
                  }}
                  className="group relative p-6 rounded-2xl border-2 border-slate-700 hover:border-emerald-500/50 transition-all text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0">
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
                    <div className="flex-1">
                      <div className="font-bold text-lg text-white mb-1">
                        Casual Play
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        Just for fun — play without any pressure. Great for
                        warming up or friendly matches.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-1 rounded bg-slate-800">
                          Solo OK
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-800">
                          No Rankings
                        </span>
                      </div>
                    </div>
                    <svg
                      className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Practice */}
                <button
                  onClick={() => {
                    setMatchType("practice");
                    setStep(1);
                  }}
                  className="group relative p-6 rounded-2xl border-2 border-slate-700 hover:border-amber-500/50 transition-all text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
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
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-white mb-1">
                        Practice
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        Train with specific drills and objectives. Track your
                        progress and build skills.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-1 rounded bg-slate-800">
                          Skill Tracking
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-800">
                          Custom Drills
                        </span>
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                          Recommended
                        </span>
                      </div>
                    </div>
                    <svg
                      className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Competitive */}
                <button
                  onClick={() => {
                    setMatchType("competitive");
                    setStep(1);
                  }}
                  className="group relative p-6 rounded-2xl border-2 border-slate-700 hover:border-red-500/50 transition-all text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0">
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
                    <div className="flex-1">
                      <div className="font-bold text-lg text-white mb-1">
                        Competitive
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        Ranked matches that affect your stats. Full score
                        tracking and leaderboard impact.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-1 rounded bg-slate-800">
                          Ranked
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-800">
                          Stats Tracked
                        </span>
                        <span className="px-2 py-1 rounded bg-red-500/20 text-red-400">
                          Opponents Required
                        </span>
                      </div>
                    </div>
                    <svg
                      className="w-6 h-6 text-slate-500 group-hover:text-red-400 transition-colors shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Alternative action */}
              <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                <p className="text-slate-400 text-sm mb-3">
                  Already finished playing?
                </p>
                <Link
                  href="/log-match"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Log a completed match instead
                </Link>
              </div>
            </div>
          )}

          {/* Step 1: Activity Selection */}
          {step === 1 && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up">
              {/* Mode indicator */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => {
                    setStep(0);
                    setMatchType(null);
                    setActivityType(null);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
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
                </button>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    matchType === "practice"
                      ? "bg-amber-500/20 text-amber-400"
                      : matchType === "competitive"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {matchType === "practice"
                    ? "Practice Mode"
                    : matchType === "competitive"
                    ? "Competitive Mode"
                    : "Casual Mode"}
                </div>
              </div>

              <h2 className="text-xl font-bold font-heading mb-2">
                What are you{" "}
                {matchType === "practice" ? "practicing" : "playing"}?
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {matchType === "practice"
                  ? "Choose an activity to practice"
                  : matchType === "competitive"
                  ? "Select the activity for your ranked match"
                  : "Select the activity for your session"}
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
                          ? matchType === "practice"
                            ? "border-amber-500 bg-amber-500/10"
                            : matchType === "competitive"
                            ? "border-red-500 bg-red-500/10"
                            : "border-emerald-500 bg-emerald-500/10"
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
                        {matchType === "practice"
                          ? `${
                              drillsByActivity[type]?.length || 0
                            } drills available`
                          : cfg.soloAllowed
                          ? "Solo or multiplayer"
                          : `${cfg.minPlayers}+ players`}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(0);
                    setMatchType(null);
                    setActivityType(null);
                  }}
                  className="btn-secondary px-6 py-4 rounded-xl font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  className={`flex-1 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    matchType === "practice"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      : matchType === "competitive"
                      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                      : "btn-primary"
                  }`}
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
            </div>
          )}

          {/* Step 2: Mode-specific configuration & Start */}
          {step === 2 && config && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up">
              {/* Header with activity and mode */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl`}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <div className="font-bold">{config.label}</div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      Change activity
                    </button>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    matchType === "practice"
                      ? "bg-amber-500/20 text-amber-400"
                      : matchType === "competitive"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {matchType === "practice"
                    ? "Practice"
                    : matchType === "competitive"
                    ? "Competitive"
                    : "Casual"}
                </div>
              </div>

              {/* Player Selection - Hidden for Practice mode (shown after drills) */}
              {matchType !== "practice" && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-300">
                      {config.soloAllowed
                        ? "Playing with (optional)"
                        : "Select opponents"}
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
                            Add players below or start solo
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
                          <div className="font-medium text-sm">
                            {member.name}
                          </div>
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
              )}

              {/* Practice Mode: Drill Selection */}
              {matchType === "practice" && (
                <div className="mb-6 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      className="w-6 h-6 text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <h3 className="text-lg font-bold font-heading">
                      Select Your Drills
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    Choose one or more drills to focus on during your practice
                    session
                  </p>

                  {/* Drill Cards */}
                  <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                    {availableDrills.map((drill) => {
                      const isSelected = selectedDrills.includes(drill.id);
                      const config = drillConfigs[drill.id] || {};
                      return (
                        <div
                          key={drill.id}
                          className={`rounded-xl border-2 transition-all overflow-hidden ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10"
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <button
                            onClick={() => toggleDrill(drill.id)}
                            className="w-full p-4 text-left flex items-start gap-3"
                          >
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${
                                isSelected ? "bg-amber-500/20" : "bg-slate-800"
                              }`}
                            >
                              {drill.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white">
                                {drill.name}
                              </div>
                              <div className="text-sm text-slate-400">
                                {drill.description}
                              </div>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-amber-500 border-amber-500"
                                  : "border-slate-600"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>

                          {/* Configurable options when selected */}
                          {isSelected && drill.configurable && (
                            <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 bg-slate-900/30">
                              <div className="grid gap-3">
                                {drill.configurable.map((cfg) => (
                                  <div
                                    key={cfg.label}
                                    className="flex items-center justify-between gap-4"
                                  >
                                    <label className="text-sm text-slate-300">
                                      {cfg.label}
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const current =
                                            config[cfg.label] ?? cfg.default;
                                          const min = cfg.min ?? 0;
                                          const step =
                                            cfg.type === "time" ? 0.1 : 1;
                                          updateDrillConfig(
                                            drill.id,
                                            cfg.label,
                                            Math.max(min, current - step)
                                          );
                                        }}
                                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                                      >
                                        −
                                      </button>
                                      <div className="w-16 text-center">
                                        <span className="font-mono text-white">
                                          {cfg.type === "time"
                                            ? (
                                                config[cfg.label] ?? cfg.default
                                              ).toFixed(1)
                                            : config[cfg.label] ?? cfg.default}
                                        </span>
                                        {cfg.unit && (
                                          <span className="text-xs text-slate-500 ml-1">
                                            {cfg.unit}
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const current =
                                            config[cfg.label] ?? cfg.default;
                                          const max = cfg.max ?? 999;
                                          const step =
                                            cfg.type === "time" ? 0.1 : 1;
                                          updateDrillConfig(
                                            drill.id,
                                            cfg.label,
                                            Math.min(max, current + step)
                                          );
                                        }}
                                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Drill summary */}
                  {selectedDrills.length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-300">
                          {selectedDrills.length} drill
                          {selectedDrills.length !== 1 ? "s" : ""} selected
                        </span>
                        <button
                          onClick={() => {
                            setSelectedDrills([]);
                            setDrillConfigs({});
                          }}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Practice mode requires drills */}
                  {selectedDrills.length === 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-2">
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Select at least one drill to start your practice session
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary px-6 py-4 rounded-xl font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleStartSession}
                  disabled={!canSubmit() || isStartingSession}
                  className="flex-1 btn-primary py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isStartingSession ? (
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
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span>
                        Start{" "}
                        {matchType === "practice"
                          ? "Practice"
                          : selectedPlayers.length === 0 && config.soloAllowed
                          ? "Solo "
                          : ""}
                        Session
                      </span>
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
