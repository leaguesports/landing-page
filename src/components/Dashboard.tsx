"use client";

import Link from "next/link";
import { useState } from "react";

// Mock data - replace with API calls
const mockMatchHistory = [
  {
    id: "1",
    activity: "padel",
    activityIcon: "🎾",
    opponent: "Alex Thompson",
    result: "win",
    score: "6-4, 6-3",
    date: "2026-01-09",
    time: "14:30",
  },
  {
    id: "2",
    activity: "golf",
    activityIcon: "⛳",
    opponent: null,
    result: "solo",
    score: "72 strokes (Even par)",
    date: "2026-01-08",
    time: "10:00",
  },
  {
    id: "3",
    activity: "padel",
    activityIcon: "🎾",
    opponent: "Sarah Chen",
    result: "loss",
    score: "4-6, 3-6",
    date: "2026-01-07",
    time: "18:00",
  },
  {
    id: "4",
    activity: "racing",
    activityIcon: "🏎️",
    opponent: "Community Race",
    result: "win",
    score: "P2 / 24",
    date: "2026-01-06",
    time: "20:00",
  },
  {
    id: "5",
    activity: "darts",
    activityIcon: "🎯",
    opponent: "Marcus Williams",
    result: "win",
    score: "3 - 1",
    date: "2026-01-05",
    time: "21:30",
  },
];

const mockFeed = [
  {
    id: "1",
    type: "challenge",
    content: "New challenge available: Score under 80 in sim golf",
    time: "2 hours ago",
    icon: "🏆",
  },
  {
    id: "2",
    type: "event",
    content: "Sunday Sim Golf is hosting a tournament this weekend",
    time: "5 hours ago",
    icon: "📅",
  },
  {
    id: "3",
    type: "achievement",
    content: "You've reached a 5-match win streak in Padel!",
    time: "1 day ago",
    icon: "🔥",
  },
  {
    id: "4",
    type: "leaderboard",
    content: "You moved up to #3 in your Padel community",
    time: "2 days ago",
    icon: "📈",
  },
];

const mockStats = {
  totalMatches: 47,
  wins: 32,
  losses: 15,
  winRate: 68,
  currentStreak: 3,
  streakType: "win",
  favoriteActivity: "Padel",
};

// Practice progression data
const mockPracticeData = {
  practiceStreak: 5,
  totalPracticeSessions: 23,
  totalDrillsCompleted: 87,
  thisWeekMinutes: 180,
  lastWeekMinutes: 120,
  weeklyGoalMinutes: 300,
  skills: [
    {
      id: "padel-serve",
      name: "Serve Accuracy",
      activity: "padel",
      activityIcon: "🎾",
      currentLevel: 78,
      previousLevel: 65,
      improvement: 13,
      trend: "up" as const,
      lastPracticed: "2 days ago",
    },
    {
      id: "racing-consistency",
      name: "Lap Consistency",
      activity: "racing",
      activityIcon: "🏎️",
      currentLevel: 85,
      previousLevel: 82,
      improvement: 3,
      trend: "up" as const,
      lastPracticed: "1 day ago",
    },
    {
      id: "golf-putting",
      name: "Putting",
      activity: "golf",
      activityIcon: "⛳",
      currentLevel: 62,
      previousLevel: 58,
      improvement: 4,
      trend: "up" as const,
      lastPracticed: "3 days ago",
    },
    {
      id: "padel-volley",
      name: "Net Play",
      activity: "padel",
      activityIcon: "🎾",
      currentLevel: 71,
      previousLevel: 74,
      improvement: -3,
      trend: "down" as const,
      lastPracticed: "5 days ago",
    },
  ],
  recentPractice: [
    {
      id: "p1",
      activity: "racing",
      activityIcon: "🏎️",
      drillName: "Lap Consistency",
      duration: "45 min",
      date: "2026-01-09",
      result: "10/10 laps within target",
      improvement: "+2% consistency",
    },
    {
      id: "p2",
      activity: "padel",
      activityIcon: "🎾",
      drillName: "Serve Practice",
      duration: "30 min",
      date: "2026-01-08",
      result: "82% accuracy (target: 70%)",
      improvement: "+8% from last session",
    },
    {
      id: "p3",
      activity: "golf",
      activityIcon: "⛳",
      drillName: "Putting Drill",
      duration: "25 min",
      date: "2026-01-07",
      result: "18/20 putts made",
      improvement: "New personal best!",
    },
  ],
  // Performance correlation data - shows how practice affects competitive results
  performanceCorrelation: [
    { week: "W1", practiceHours: 2, winRate: 45 },
    { week: "W2", practiceHours: 3, winRate: 52 },
    { week: "W3", practiceHours: 4, winRate: 58 },
    { week: "W4", practiceHours: 5, winRate: 68 },
  ],
};

interface DashboardProps {
  userName?: string;
}

export default function Dashboard({ userName = "Player" }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "feed">("recent");

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
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">
          Welcome back, <span className="gradient-text">{userName}</span>
        </h1>
        <p className="text-slate-400">
          Ready to play? Log a match or check out what&apos;s happening.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* Practice */}
        <Link
          href="/quickplay"
          className="glass-card rounded-2xl p-5 hover:border-amber-500/30 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-2 right-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
              Train
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
          </div>
          <div className="font-semibold text-white">Practice</div>
          <div className="text-xs text-slate-500">Drills & skills</div>
        </Link>

        {/* Competitive */}
        <Link
          href="/quickplay"
          className="glass-card rounded-2xl p-5 hover:border-red-500/30 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-2 right-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
              Ranked
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
          </div>
          <div className="font-semibold text-white">Compete</div>
          <div className="text-xs text-slate-500">Ranked matches</div>
        </Link>

        {/* Casual Play */}
        <Link
          href="/quickplay"
          className="glass-card rounded-2xl p-5 hover:border-emerald-500/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
          </div>
          <div className="font-semibold text-white">Casual</div>
          <div className="text-xs text-slate-500">Just for fun</div>
        </Link>

        <Link
          href="/log-match"
          className="glass-card rounded-2xl p-5 hover:border-violet-500/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
          <div className="font-semibold text-white">Log Match</div>
          <div className="text-xs text-slate-500">Record completed</div>
        </Link>

        <Link
          href="/communities"
          className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg
              className="w-6 h-6 text-slate-950"
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
          </div>
          <div className="font-semibold text-white">Communities</div>
          <div className="text-xs text-slate-500">Browse & join</div>
        </Link>

        <Link
          href="/session"
          className="glass-card rounded-2xl p-5 hover:border-emerald-500/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="font-semibold text-white">Active Session</div>
          <div className="text-xs text-slate-500">View scoring</div>
        </Link>

        <Link
          href="/stats"
          className="glass-card rounded-2xl p-5 hover:border-sky-500/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="font-semibold text-white">My Stats</div>
          <div className="text-xs text-slate-500">View analytics</div>
        </Link>

        <Link
          href="/history"
          className="glass-card rounded-2xl p-5 hover:border-rose-500/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="font-semibold text-white">History</div>
          <div className="text-xs text-slate-500">All matches</div>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          Your Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 rounded-xl bg-slate-800/30">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {mockStats.totalMatches}
            </div>
            <div className="text-xs text-slate-500">Total Matches</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-slate-800/30">
            <div className="text-2xl md:text-3xl font-bold text-emerald-400">
              {mockStats.wins}
            </div>
            <div className="text-xs text-slate-500">Wins</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-slate-800/30">
            <div className="text-2xl md:text-3xl font-bold text-red-400">
              {mockStats.losses}
            </div>
            <div className="text-xs text-slate-500">Losses</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-slate-800/30">
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {mockStats.winRate}%
            </div>
            <div className="text-xs text-slate-500">Win Rate</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-slate-800/30">
            <div className="text-2xl md:text-3xl font-bold text-amber-400 flex items-center justify-center gap-1">
              {mockStats.currentStreak}
              <span className="text-lg">🔥</span>
            </div>
            <div className="text-xs text-slate-500">Win Streak</div>
          </div>
        </div>
      </div>

      {/* Practice Progress Section */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-400"
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
            Practice Progress
          </h2>
          <Link
            href="/quickplay"
            className="text-sm text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            Start Practice
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Practice Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-amber-400">
                {mockPracticeData.practiceStreak}
              </span>
              <span className="text-lg">🔥</span>
            </div>
            <div className="text-xs text-slate-400">Day Streak</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50">
            <div className="text-2xl font-bold text-white">
              {mockPracticeData.totalDrillsCompleted}
            </div>
            <div className="text-xs text-slate-400">Drills Completed</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50">
            <div className="text-2xl font-bold text-white">
              {Math.floor(mockPracticeData.thisWeekMinutes / 60)}h{" "}
              {mockPracticeData.thisWeekMinutes % 60}m
            </div>
            <div className="text-xs text-slate-400">This Week</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-emerald-400">
                +
                {Math.round(
                  ((mockPracticeData.thisWeekMinutes -
                    mockPracticeData.lastWeekMinutes) /
                    mockPracticeData.lastWeekMinutes) *
                    100
                )}
                %
              </div>
              <svg
                className="w-5 h-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="text-xs text-slate-400">vs Last Week</div>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="mb-6 p-4 rounded-xl bg-slate-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">
              Weekly Practice Goal
            </span>
            <span className="text-sm text-slate-400">
              {Math.floor(mockPracticeData.thisWeekMinutes / 60)}h /{" "}
              {Math.floor(mockPracticeData.weeklyGoalMinutes / 60)}h
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (mockPracticeData.thisWeekMinutes /
                    mockPracticeData.weeklyGoalMinutes) *
                    100
                )}%`,
              }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {Math.round(
              (mockPracticeData.thisWeekMinutes /
                mockPracticeData.weeklyGoalMinutes) *
                100
            )}
            % complete
          </div>
        </div>

        {/* Skill Progress */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
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
            Skill Progression
          </h3>
          <div className="grid gap-3">
            {mockPracticeData.skills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{skill.activityIcon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">
                        {skill.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            skill.trend === "up"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {skill.improvement > 0 ? "+" : ""}
                          {skill.improvement}%
                        </span>
                        {skill.trend === "up" ? (
                          <svg
                            className="w-4 h-4 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                    {/* Previous level (faded) */}
                    <div className="relative h-full">
                      <div
                        className="absolute inset-y-0 left-0 bg-slate-600"
                        style={{ width: `${skill.previousLevel}%` }}
                      />
                      <div
                        className={`absolute inset-y-0 left-0 ${
                          skill.trend === "up"
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                            : "bg-gradient-to-r from-amber-500 to-orange-500"
                        }`}
                        style={{ width: `${skill.currentLevel}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white w-10 text-right">
                    {skill.currentLevel}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Last practiced {skill.lastPracticed}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice → Performance Correlation */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-primary/10 border border-emerald-500/20">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Practice Impact on Performance
          </h3>
          <div className="flex items-end justify-between gap-2 h-24 mb-2">
            {mockPracticeData.performanceCorrelation.map((week) => (
              <div
                key={week.week}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="w-full flex items-end gap-1 h-16">
                  {/* Practice bar */}
                  <div
                    className="flex-1 rounded-t bg-amber-500/60"
                    style={{ height: `${(week.practiceHours / 5) * 100}%` }}
                    title={`${week.practiceHours}h practice`}
                  />
                  {/* Win rate bar */}
                  <div
                    className="flex-1 rounded-t bg-emerald-500"
                    style={{ height: `${week.winRate}%` }}
                    title={`${week.winRate}% win rate`}
                  />
                </div>
                <span className="text-xs text-slate-500">{week.week}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/60" />
              <span className="text-slate-400">Practice Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-400">Win Rate %</span>
            </div>
          </div>
          <p className="text-center text-xs text-emerald-400 mt-3 font-medium">
            📈 Your win rate increased{" "}
            {mockPracticeData.performanceCorrelation[3].winRate -
              mockPracticeData.performanceCorrelation[0].winRate}
            % as practice time increased!
          </p>
        </div>

        {/* Recent Practice Sessions */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Recent Practice
          </h3>
          <div className="space-y-2">
            {mockPracticeData.recentPractice.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-xl">{session.activityIcon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm">
                    {session.drillName}
                  </div>
                  <div className="text-xs text-slate-400">{session.result}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-400 font-medium">
                    {session.improvement}
                  </div>
                  <div className="text-xs text-slate-500">
                    {session.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Matches / Feed */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-700/50">
              <button
                onClick={() => setActiveTab("recent")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "recent"
                    ? "text-white border-b-2 border-primary bg-primary/5"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Recent Matches
              </button>
              <button
                onClick={() => setActiveTab("feed")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "feed"
                    ? "text-white border-b-2 border-primary bg-primary/5"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Activity Feed
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === "recent" && (
                <div className="space-y-3">
                  {mockMatchHistory.map((match) => (
                    <div
                      key={match.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${getResultBg(
                        match.result
                      )}`}
                    >
                      <div className="text-2xl">{match.activityIcon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white truncate">
                            {match.opponent || "Solo Session"}
                          </span>
                          <span
                            className={`text-xs font-medium uppercase ${getResultColor(
                              match.result
                            )}`}
                          >
                            {match.result === "solo" ? "" : match.result}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400">
                          {match.score}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-slate-400">{match.date}</div>
                        <div className="text-slate-500">{match.time}</div>
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/history"
                    className="block text-center py-3 text-primary hover:text-primary-light text-sm font-medium"
                  >
                    View all matches →
                  </Link>
                </div>
              )}

              {activeTab === "feed" && (
                <div className="space-y-3">
                  {mockFeed.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="text-xl">{item.icon}</div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{item.content}</p>
                        <span className="text-xs text-slate-500">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Start Playing Card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/20 to-transparent blur-2xl" />
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Ready to play?</h3>
              <p className="text-sm text-slate-400 mb-4">
                Choose how you want to play
              </p>
              <div className="space-y-2">
                {/* Practice - Primary action */}
                <Link
                  href="/quickplay"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:opacity-90 transition-opacity"
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Practice
                </Link>

                {/* Competitive & Casual in a row */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/quickplay"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
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
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                    Compete
                  </Link>
                  <Link
                    href="/quickplay"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
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
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Casual
                  </Link>
                </div>

                {/* Log Match */}
                <Link
                  href="/log-match"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors text-sm"
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
                  Log Completed Match
                </Link>
              </div>
            </div>
          </div>

          {/* Favorite Activity */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-3">
              Most Played
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl">
                🎾
              </div>
              <div>
                <div className="font-bold text-white text-lg">
                  {mockStats.favoriteActivity}
                </div>
                <div className="text-sm text-slate-400">
                  23 matches this month
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-3">
              Your Communities
            </h3>
            <div className="space-y-3">
              <Link
                href="/communities/1"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center text-lg font-bold text-emerald-400">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">
                    Sunday Sim Golf
                  </div>
                  <div className="text-xs text-slate-500">24 members</div>
                </div>
              </Link>
              <Link
                href="/communities/2"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-lg font-bold text-amber-400">
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">
                    Padel Club Amsterdam
                  </div>
                  <div className="text-xs text-slate-500">56 members</div>
                </div>
              </Link>
            </div>
            <Link
              href="/communities"
              className="block text-center pt-3 mt-3 border-t border-slate-700/50 text-primary hover:text-primary-light text-sm font-medium"
            >
              Browse all communities →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
