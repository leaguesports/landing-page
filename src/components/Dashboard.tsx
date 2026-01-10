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
        <Link
          href="/quickplay"
          className="glass-card rounded-2xl p-5 hover:border-amber-500/30 transition-all group"
        >
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="font-semibold text-white">Quickplay</div>
          <div className="text-xs text-slate-500">Start live session</div>
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
                Start tracking or log a completed match
              </p>
              <div className="space-y-2">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Start Live Session
                </Link>
                <Link
                  href="/log-match"
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
