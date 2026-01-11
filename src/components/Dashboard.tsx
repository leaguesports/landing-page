"use client";

import Link from "next/link";
import { useState } from "react";
import { sportsList, type SportConfig } from "@/config/sports";

// Mock data for user's sports library
const userSportsData: Record<
  string,
  {
    lastPlayed: string;
    totalHours: number;
    recentActivity: string;
    isInstalled: boolean;
  }
> = {
  racing: {
    lastPlayed: "2 hours ago",
    totalHours: 48,
    recentActivity: "P1 at Spa",
    isInstalled: true,
  },
  golf: {
    lastPlayed: "Yesterday",
    totalHours: 32,
    recentActivity: "Shot 82 at Pebble Beach",
    isInstalled: true,
  },
  padel: {
    lastPlayed: "3 hours ago",
    totalHours: 65,
    recentActivity: "Won vs Alex 6-4, 6-3",
    isInstalled: true,
  },
  darts: {
    lastPlayed: "5 days ago",
    totalHours: 12,
    recentActivity: "Hit first 180!",
    isInstalled: true,
  },
  pool: {
    lastPlayed: "1 week ago",
    totalHours: 8,
    recentActivity: "League match",
    isInstalled: true,
  },
};

// Recent activity across all sports
const recentActivity = [
  {
    sport: "padel",
    type: "Match",
    result: "Won",
    details: "vs Alex Thompson • 6-4, 6-3",
    time: "3 hours ago",
  },
  {
    sport: "racing",
    type: "Race",
    result: "P1",
    details: "GT Championship at Spa",
    time: "5 hours ago",
  },
  {
    sport: "golf",
    type: "Round",
    result: "82",
    details: "Pebble Beach • 18 holes",
    time: "Yesterday",
  },
  {
    sport: "padel",
    type: "Practice",
    result: "Done",
    details: "Bandeja drills completed",
    time: "2 days ago",
  },
];

interface DashboardProps {
  userName?: string;
}

export default function Dashboard({ userName = "Player" }: DashboardProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "hours" | "name">("recent");

  // Sort sports based on selected option
  const sortedSports = [...sportsList].sort((a, b) => {
    const dataA = userSportsData[a.id];
    const dataB = userSportsData[b.id];
    if (sortBy === "hours") {
      return (dataB?.totalHours || 0) - (dataA?.totalHours || 0);
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    // Default: sort by recent
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Welcome back, <span className="gradient-text">{userName}</span>
        </h1>
        <p className="text-slate-400">Your sports library</p>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">165</div>
              <div className="text-xs text-slate-500">Total Hours</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">247</div>
              <div className="text-xs text-slate-500">Total Matches</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-xs text-slate-500">Day Streak</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-violet-400"
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
              <div className="text-2xl font-bold text-white">23</div>
              <div className="text-xs text-slate-500">Achievements</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Library */}
        <div className="lg:col-span-2">
          {/* Library Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Your Library</h2>
            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "recent" | "hours" | "name")
                }
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-primary"
              >
                <option value="recent">Recently Played</option>
                <option value="hours">Most Played</option>
                <option value="name">Name</option>
              </select>

              {/* View Toggle */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${
                    viewMode === "grid"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400"
                  }`}
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded ${
                    viewMode === "list"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400"
                  }`}
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Sports Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {sortedSports.map((sport) => (
                <SportCard key={sport.id} sport={sport} />
              ))}
              {/* Add New Sport */}
              <Link
                href="/activities"
                className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-primary transition-colors min-h-[180px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
                  <svg
                    className="w-7 h-7 text-slate-400"
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
                <span className="font-medium text-slate-400">
                  Browse More Sports
                </span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSports.map((sport) => (
                <SportListItem key={sport.id} sport={sport} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Recent Activity */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50">
              <h3 className="font-bold text-white">Recent Activity</h3>
            </div>
            <div className="p-4 space-y-3">
              {recentActivity.map((activity, idx) => {
                const sport = sportsList.find((s) => s.id === activity.sport);
                return (
                  <Link
                    key={idx}
                    href={`/play/${activity.sport}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sport?.gradient} flex items-center justify-center shrink-0`}
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
                          d={sport?.icon}
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-slate-500">
                          {activity.type}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            activity.result === "Won" ||
                            activity.result === "P1"
                              ? "text-emerald-400"
                              : activity.result === "Lost"
                              ? "text-red-400"
                              : "text-slate-400"
                          }`}
                        >
                          {activity.result}
                        </span>
                      </div>
                      <p className="text-sm text-white truncate">
                        {activity.details}
                      </p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-slate-700/50">
              <Link
                href="/history"
                className="text-sm text-primary hover:text-primary-light"
              >
                View all activity →
              </Link>
            </div>
          </div>

          {/* Quick Launch */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4">Quick Launch</h3>
            <div className="space-y-2">
              {sortedSports.slice(0, 3).map((sport) => (
                <Link
                  key={sport.id}
                  href={`/play/${sport.slug}`}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${sport.gradient} hover:opacity-90 transition-opacity`}
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
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  </svg>
                  <span className="font-medium text-white">{sport.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Communities Preview */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Your Communities</h3>
              <Link
                href="/communities"
                className="text-sm text-primary hover:text-primary-light"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { name: "Sunday Sim Racing", members: 24, sport: "racing" },
                { name: "Padel Club NYC", members: 48, sport: "padel" },
              ].map((community, idx) => {
                const sport = sportsList.find((s) => s.id === community.sport);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sport?.gradient} flex items-center justify-center`}
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
                          d={sport?.icon}
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">
                        {community.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {community.members} members
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SportCard({ sport }: { sport: SportConfig }) {
  const data = userSportsData[sport.id];

  return (
    <Link
      href={`/play/${sport.slug}`}
      className="glass-card rounded-2xl overflow-hidden group hover:border-slate-600 transition-all"
      style={{ background: sport.bgPattern }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
          >
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
                d={sport.icon}
              />
            </svg>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${sport.gradient} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
          >
            <svg
              className="w-4 h-4 text-white"
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
            </svg>
            <span className="text-sm font-medium text-white">Play</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{sport.name}</h3>
        <p className="text-sm text-slate-400 mb-4">{sport.description}</p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-500">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {data?.totalHours || 0}h played
          </div>
          <div className="text-slate-400">{data?.lastPlayed || "Never"}</div>
        </div>
      </div>

      {/* Recent Activity Bar */}
      {data?.recentActivity && (
        <div className="px-5 py-3 bg-slate-800/50 border-t border-slate-700/50">
          <p className="text-xs text-slate-400 truncate">
            <span className="text-slate-500">Last:</span> {data.recentActivity}
          </p>
        </div>
      )}
    </Link>
  );
}

function SportListItem({ sport }: { sport: SportConfig }) {
  const data = userSportsData[sport.id];

  return (
    <Link
      href={`/play/${sport.slug}`}
      className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-slate-600 transition-all group"
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center shrink-0`}
      >
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
            d={sport.icon}
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white">{sport.name}</h3>
        <p className="text-sm text-slate-400 truncate">
          {data?.recentActivity || sport.description}
        </p>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm text-slate-400">{data?.totalHours || 0}h</div>
        <div className="text-xs text-slate-500">
          {data?.lastPlayed || "Never played"}
        </div>
      </div>
      <div
        className={`px-3 py-2 rounded-lg bg-gradient-to-r ${sport.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
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
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
        </svg>
      </div>
    </Link>
  );
}
