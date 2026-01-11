"use client";

import Link from "next/link";
import { useState, ReactNode } from "react";

// Sport types
type SportType = "racing" | "golf" | "padel" | "darts" | "pool";

interface SportConfig {
  id: SportType;
  name: string;
  icon: ReactNode;
  gradient: string;
  bgPattern: string;
  description: string;
}

const sports: SportConfig[] = [
  {
    id: "racing",
    name: "Sim Racing",
    icon: (
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
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    gradient: "from-red-500 to-rose-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)",
    description: "Virtual motorsport racing",
  },
  {
    id: "golf",
    name: "Sim Golf",
    icon: (
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
          d="M3 21h18M9 8h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
        />
      </svg>
    ),
    gradient: "from-emerald-500 to-green-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
    description: "Indoor golf simulation",
  },
  {
    id: "padel",
    name: "Padel",
    icon: (
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
          d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
        />
      </svg>
    ),
    gradient: "from-amber-500 to-orange-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)",
    description: "Court racket sport",
  },
  {
    id: "darts",
    name: "Darts",
    icon: (
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
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    gradient: "from-sky-500 to-blue-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)",
    description: "Precision throwing",
  },
  {
    id: "pool",
    name: "Pool",
    icon: (
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
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 10a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"
        />
      </svg>
    ),
    gradient: "from-slate-500 to-gray-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(100, 116, 139, 0.15) 0%, transparent 50%)",
    description: "Billiards & pool",
  },
];

// Sport-specific data
const sportData: Record<
  SportType,
  {
    stats: {
      primary: { label: string; value: string; trend?: string };
      secondary: { label: string; value: string }[];
    };
    recentMatches: {
      id: string;
      opponent: string | null;
      result: "win" | "loss" | "solo";
      score: string;
      date: string;
      details?: string;
    }[];
    skills: {
      name: string;
      level: number;
      trend: "up" | "down" | "stable";
      change: number;
    }[];
    challenges: {
      id: string;
      title: string;
      progress: number;
      reward: string;
    }[];
    quickTips: string[];
  }
> = {
  racing: {
    stats: {
      primary: { label: "Best Lap", value: "1:32.456", trend: "-0.8s" },
      secondary: [
        { label: "Races", value: "24" },
        { label: "Podiums", value: "18" },
        { label: "Wins", value: "8" },
        { label: "Avg Position", value: "P3.2" },
      ],
    },
    recentMatches: [
      {
        id: "1",
        opponent: "GT Championship",
        result: "win",
        score: "P1 / 20",
        date: "Jan 10",
        details: "Spa-Francorchamps",
      },
      {
        id: "2",
        opponent: "Community Race",
        result: "win",
        score: "P2 / 24",
        date: "Jan 8",
        details: "Monza",
      },
      {
        id: "3",
        opponent: "Time Trial",
        result: "solo",
        score: "1:32.456",
        date: "Jan 7",
        details: "Nordschleife",
      },
    ],
    skills: [
      { name: "Lap Consistency", level: 85, trend: "up", change: 3 },
      { name: "Racecraft", level: 72, trend: "up", change: 5 },
      { name: "Qualifying Pace", level: 78, trend: "stable", change: 0 },
      { name: "Tire Management", level: 65, trend: "up", change: 8 },
    ],
    challenges: [
      {
        id: "1",
        title: "Complete 10 clean laps at Spa",
        progress: 70,
        reward: "Track Master Badge",
      },
      {
        id: "2",
        title: "Achieve sub 1:30 at Monza",
        progress: 45,
        reward: "Speed Demon Badge",
      },
    ],
    quickTips: [
      "Focus on corner exit speed for faster lap times",
      "Practice the Eau Rouge complex for Spa mastery",
    ],
  },
  golf: {
    stats: {
      primary: { label: "Handicap", value: "12.4", trend: "-1.2" },
      secondary: [
        { label: "Rounds", value: "32" },
        { label: "Avg Score", value: "84" },
        { label: "Best Round", value: "76" },
        { label: "Eagles", value: "3" },
      ],
    },
    recentMatches: [
      {
        id: "1",
        opponent: null,
        result: "solo",
        score: "82 (+10)",
        date: "Jan 9",
        details: "Pebble Beach",
      },
      {
        id: "2",
        opponent: "Sunday League",
        result: "win",
        score: "78 (+6)",
        date: "Jan 5",
        details: "St Andrews",
      },
      {
        id: "3",
        opponent: null,
        result: "solo",
        score: "85 (+13)",
        date: "Jan 3",
        details: "Augusta National",
      },
    ],
    skills: [
      { name: "Driving", level: 75, trend: "up", change: 4 },
      { name: "Iron Play", level: 68, trend: "stable", change: 1 },
      { name: "Short Game", level: 82, trend: "up", change: 6 },
      { name: "Putting", level: 71, trend: "down", change: -2 },
    ],
    challenges: [
      {
        id: "1",
        title: "Break 80 on any course",
        progress: 85,
        reward: "Single Digits Badge",
      },
      {
        id: "2",
        title: "Make 5 birdies in a round",
        progress: 60,
        reward: "Birdie Hunter Badge",
      },
    ],
    quickTips: [
      "Practice your putting stroke consistency",
      "Focus on course management over distance",
    ],
  },
  padel: {
    stats: {
      primary: { label: "Win Rate", value: "68%", trend: "+5%" },
      secondary: [
        { label: "Matches", value: "45" },
        { label: "Wins", value: "31" },
        { label: "Streak", value: "5W" },
        { label: "Ranking", value: "#12" },
      ],
    },
    recentMatches: [
      {
        id: "1",
        opponent: "Alex Thompson",
        result: "win",
        score: "6-4, 6-3",
        date: "Jan 9",
      },
      {
        id: "2",
        opponent: "Sarah Chen",
        result: "loss",
        score: "4-6, 3-6",
        date: "Jan 7",
      },
      {
        id: "3",
        opponent: "Mike Rodriguez",
        result: "win",
        score: "6-2, 6-4",
        date: "Jan 5",
      },
    ],
    skills: [
      { name: "Serve", level: 78, trend: "up", change: 8 },
      { name: "Bandeja", level: 65, trend: "up", change: 12 },
      { name: "Wall Play", level: 72, trend: "stable", change: 2 },
      { name: "Net Game", level: 80, trend: "up", change: 5 },
    ],
    challenges: [
      {
        id: "1",
        title: "Win 5 matches in a row",
        progress: 100,
        reward: "Hot Streak Badge",
      },
      {
        id: "2",
        title: "Play 50 matches this month",
        progress: 90,
        reward: "Dedicated Player Badge",
      },
    ],
    quickTips: [
      "Work on your bandeja for better court control",
      "Practice wall returns to extend rallies",
    ],
  },
  darts: {
    stats: {
      primary: { label: "Average", value: "78.5", trend: "+3.2" },
      secondary: [
        { label: "Legs Won", value: "124" },
        { label: "180s", value: "18" },
        { label: "Checkout %", value: "42%" },
        { label: "Best Leg", value: "14 darts" },
      ],
    },
    recentMatches: [
      {
        id: "1",
        opponent: "Marcus Williams",
        result: "win",
        score: "3-1",
        date: "Jan 8",
      },
      {
        id: "2",
        opponent: "Club Tournament",
        result: "win",
        score: "2nd Place",
        date: "Jan 5",
      },
      {
        id: "3",
        opponent: "Practice Session",
        result: "solo",
        score: "Avg 82.3",
        date: "Jan 4",
      },
    ],
    skills: [
      { name: "Treble 20", level: 76, trend: "up", change: 5 },
      { name: "Doubles", level: 68, trend: "up", change: 8 },
      { name: "Consistency", level: 72, trend: "stable", change: 1 },
      { name: "Checkout Routes", level: 65, trend: "up", change: 4 },
    ],
    challenges: [
      {
        id: "1",
        title: "Hit 5 x 180s in a session",
        progress: 60,
        reward: "Maximum Badge",
      },
      {
        id: "2",
        title: "Achieve 85+ average",
        progress: 80,
        reward: "Pro Average Badge",
      },
    ],
    quickTips: [
      "Practice your doubles for better checkouts",
      "Work on a consistent throwing stance",
    ],
  },
  pool: {
    stats: {
      primary: { label: "Win Rate", value: "62%", trend: "+4%" },
      secondary: [
        { label: "Frames", value: "89" },
        { label: "Run Outs", value: "24" },
        { label: "Break %", value: "38%" },
        { label: "Safety %", value: "71%" },
      ],
    },
    recentMatches: [
      {
        id: "1",
        opponent: "Jake Morrison",
        result: "win",
        score: "5-3",
        date: "Jan 9",
      },
      {
        id: "2",
        opponent: "League Match",
        result: "loss",
        score: "3-5",
        date: "Jan 6",
      },
      {
        id: "3",
        opponent: "Practice",
        result: "solo",
        score: "12 Run Outs",
        date: "Jan 5",
      },
    ],
    skills: [
      { name: "Break Shot", level: 70, trend: "up", change: 6 },
      { name: "Position Play", level: 75, trend: "up", change: 4 },
      { name: "Safety Play", level: 68, trend: "stable", change: 2 },
      { name: "Pressure Shots", level: 62, trend: "up", change: 7 },
    ],
    challenges: [
      {
        id: "1",
        title: "Complete 5 run outs in a row",
        progress: 40,
        reward: "Clear Table Badge",
      },
      {
        id: "2",
        title: "Win a league match",
        progress: 100,
        reward: "League Champion Badge",
      },
    ],
    quickTips: [
      "Focus on cue ball position for run outs",
      "Practice your break to control the table",
    ],
  },
};

interface DashboardProps {
  userName?: string;
}

export default function Dashboard({ userName = "Player" }: DashboardProps) {
  const [selectedSport, setSelectedSport] = useState<SportType>("padel");

  const currentSport = sports.find((s) => s.id === selectedSport)!;
  const data = sportData[selectedSport];

  const getResultColor = (result: string) => {
    switch (result) {
      case "win":
        return "text-emerald-400";
      case "loss":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getResultBg = (result: string) => {
    switch (result) {
      case "win":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "loss":
        return "bg-red-500/10 border-red-500/20";
      default:
        return "bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto"
      style={{ background: currentSport.bgPattern }}
    >
      {/* Welcome Header with Sport Context */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading mb-1">
              Welcome back, <span className="gradient-text">{userName}</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Track your progress and improve your game
            </p>
          </div>
          <Link
            href="/quickplay"
            className={`hidden sm:flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r ${currentSport.gradient} text-white font-medium hover:opacity-90 transition-opacity`}
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Play {currentSport.name}
          </Link>
        </div>
      </div>

      {/* Sport Selector */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sports.map((sport) => {
            const isSelected = selectedSport === sport.id;
            return (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap ${
                  isSelected
                    ? `border-transparent bg-gradient-to-r ${sport.gradient} text-white`
                    : "border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white"
                }`}
              >
                <div className={isSelected ? "text-white" : "text-slate-400"}>
                  {sport.icon}
                </div>
                <span className="font-medium">{sport.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Stats & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Primary Stat Card */}
          <div
            className={`glass-card rounded-2xl p-6 relative overflow-hidden`}
          >
            <div
              className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${currentSport.gradient} opacity-10 blur-3xl`}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentSport.gradient} flex items-center justify-center text-white`}
                  >
                    {currentSport.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {currentSport.name}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {currentSport.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {data.stats.primary.value}
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-sm text-slate-400">
                      {data.stats.primary.label}
                    </span>
                    {data.stats.primary.trend && (
                      <span className="text-sm text-emerald-400">
                        {data.stats.primary.trend}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {data.stats.secondary.map((stat, idx) => (
                  <div
                    key={idx}
                    className="text-center p-3 rounded-xl bg-slate-800/50"
                  >
                    <div className="text-xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <Link
              href="/quickplay"
              className="glass-card rounded-xl p-4 hover:border-emerald-500/30 transition-all group text-center"
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
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
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="font-medium text-white text-sm">Casual</div>
            </Link>
            <Link
              href="/quickplay"
              className="glass-card rounded-xl p-4 hover:border-amber-500/30 transition-all group text-center"
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="font-medium text-white text-sm">Practice</div>
            </Link>
            <Link
              href="/quickplay"
              className="glass-card rounded-xl p-4 hover:border-red-500/30 transition-all group text-center"
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
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
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div className="font-medium text-white text-sm">Compete</div>
            </Link>
          </div>

          {/* Recent Matches */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="font-bold text-white">
                Recent {currentSport.name} Activity
              </h3>
              <Link
                href="/history"
                className="text-sm text-primary hover:text-primary-light"
              >
                View all →
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {data.recentMatches.map((match) => (
                <div
                  key={match.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${getResultBg(
                    match.result
                  )}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentSport.gradient} flex items-center justify-center text-white`}
                  >
                    {currentSport.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">
                        {match.opponent || "Solo Session"}
                      </span>
                      {match.result !== "solo" && (
                        <span
                          className={`text-xs font-medium uppercase ${getResultColor(
                            match.result
                          )}`}
                        >
                          {match.result}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>{match.score}</span>
                      {match.details && (
                        <>
                          <span>•</span>
                          <span>{match.details}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">{match.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Skills & Challenges */}
        <div className="space-y-6">
          {/* Skills Progress */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Skill Progress</h3>
              <Link
                href="/quickplay"
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                Practice →
              </Link>
            </div>
            <div className="space-y-4">
              {data.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          skill.trend === "up"
                            ? "text-emerald-400"
                            : skill.trend === "down"
                            ? "text-red-400"
                            : "text-slate-400"
                        }`}
                      >
                        {skill.change > 0 ? "+" : ""}
                        {skill.change}%
                      </span>
                      {skill.trend === "up" && (
                        <svg
                          className="w-3 h-3 text-emerald-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                      )}
                      {skill.trend === "down" && (
                        <svg
                          className="w-3 h-3 text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${currentSport.gradient} transition-all duration-500`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Challenges</h3>
              <span className="text-xs text-slate-500">
                {currentSport.name}
              </span>
            </div>
            <div className="space-y-4">
              {data.challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-4 rounded-xl bg-slate-800/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      {challenge.title}
                    </span>
                    {challenge.progress === 100 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        Complete!
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-500 ${
                        challenge.progress === 100
                          ? "bg-emerald-500"
                          : `bg-gradient-to-r ${currentSport.gradient}`
                      }`}
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {challenge.progress}%
                    </span>
                    <span className="text-xs text-amber-400">
                      {challenge.reward}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Tips for {currentSport.name}
            </h3>
            <div className="space-y-3">
              {data.quickTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30"
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentSport.gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Communities Link */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-white mb-3">
              Find {currentSport.name} Communities
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Connect with other {currentSport.name.toLowerCase()} players and
              join events
            </p>
            <Link
              href="/communities"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Browse Communities
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Play Button */}
      <div className="fixed bottom-6 left-4 right-4 sm:hidden z-40">
        <Link
          href="/quickplay"
          className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r ${currentSport.gradient} text-white font-semibold shadow-lg`}
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
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Play {currentSport.name}
        </Link>
      </div>
    </div>
  );
}
