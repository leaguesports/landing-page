"use client";

import Link from "next/link";
import { useState } from "react";
import { sportsList, sportDrills, type SportConfig } from "@/config/sports";

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Activities" },
    { id: "simulation", name: "Simulation" },
    { id: "racket", name: "Racket Sports" },
    { id: "precision", name: "Precision" },
    { id: "team", name: "Team Sports" },
  ];

  // Map sports to categories
  const sportCategories: Record<string, string[]> = {
    simulation: ["racing", "golf"],
    racket: ["padel", "tennis", "squash"],
    precision: ["darts", "pool", "bowling"],
    team: ["soccer", "rugby", "netball", "cricket"],
  };

  // Filter sports based on search and category
  const filteredSports = sportsList.filter((sport) => {
    const matchesSearch =
      sport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sport.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      sportCategories[selectedCategory]?.includes(sport.id);

    return matchesSearch && matchesCategory;
  });

  // Mock stats per sport
  const sportStats: Record<
    string,
    { players: string; matches: string; communities: string }
  > = {
    racing: { players: "12.5K", matches: "45K", communities: "128" },
    golf: { players: "8.2K", matches: "32K", communities: "95" },
    padel: { players: "15.8K", matches: "67K", communities: "234" },
    darts: { players: "6.4K", matches: "28K", communities: "76" },
    pool: { players: "4.9K", matches: "19K", communities: "52" },
    cricket: { players: "9.3K", matches: "38K", communities: "112" },
    bowling: { players: "5.7K", matches: "24K", communities: "68" },
    tennis: { players: "18.2K", matches: "72K", communities: "198" },
    squash: { players: "7.1K", matches: "31K", communities: "84" },
    soccer: { players: "25.4K", matches: "89K", communities: "312" },
    rugby: { players: "11.8K", matches: "42K", communities: "156" },
    netball: { players: "8.9K", matches: "35K", communities: "94" },
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
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
              <div>
                <h1 className="font-bold text-white text-lg">Activities</h1>
                <p className="text-xs text-slate-400">
                  Browse and discover sports
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
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
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white placeholder-slate-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSports.map((sport) => (
            <SportCard
              key={sport.id}
              sport={sport}
              stats={sportStats[sport.id]}
              drillCount={sportDrills[sport.id]?.length || 0}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredSports.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No activities found
            </h3>
            <p className="text-slate-400">
              Try adjusting your search or filter
            </p>
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-6">Coming Soon</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Tennis",
                icon: "🎾",
                description: "Court tennis tracking",
              },
              {
                name: "Bowling",
                icon: "🎳",
                description: "Strike and spare tracking",
              },
              {
                name: "Table Tennis",
                icon: "🏓",
                description: "Ping pong matches",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="glass-card rounded-xl p-5 opacity-60"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Notify me when available →
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

interface SportCardProps {
  sport: SportConfig;
  stats: { players: string; matches: string; communities: string };
  drillCount: number;
}

function SportCard({ sport, stats, drillCount }: SportCardProps) {
  return (
    <div
      className="glass-card rounded-2xl overflow-hidden group hover:border-slate-600 transition-all"
      style={{ background: sport.bgPattern }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center shadow-lg`}
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
          <div className="flex gap-1">
            <span className="px-2 py-1 rounded-full bg-slate-800/80 text-xs text-slate-400">
              {drillCount} drills
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{sport.name}</h3>
        <p className="text-sm text-slate-400">{sport.description}</p>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-t border-slate-700/50 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{stats.players}</div>
          <div className="text-xs text-slate-500">Players</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{stats.matches}</div>
          <div className="text-xs text-slate-500">Matches</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {stats.communities}
          </div>
          <div className="text-xs text-slate-500">Groups</div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 grid grid-cols-3 gap-2">
        <Link
          href={`/casual/${sport.slug}`}
          className="flex items-center justify-center gap-1 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sm font-medium text-white transition-colors"
        >
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
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Casual
        </Link>
        <Link
          href={`/practice/${sport.slug}`}
          className="flex items-center justify-center gap-1 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sm font-medium text-white transition-colors"
        >
          <svg
            className="w-4 h-4 text-amber-400"
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
        <Link
          href={`/compete/${sport.slug}`}
          className="flex items-center justify-center gap-1 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sm font-medium text-white transition-colors"
        >
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
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          Compete
        </Link>
      </div>
    </div>
  );
}
