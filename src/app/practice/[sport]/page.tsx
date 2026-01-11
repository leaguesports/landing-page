"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  getSportBySlug,
  sportDrills,
  type SportType,
  type Drill,
} from "@/config/sports";
import { useSessionContext } from "@/contexts/SessionContext";

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const sportSlug = params.sport as string;
  const sport = getSportBySlug(sportSlug);
  const { startSession, isLoading } = useSessionContext();

  const [selectedDrills, setSelectedDrills] = useState<string[]>([]);
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

  const drills = sportDrills[sport.id as SportType] || [];

  const toggleDrill = (drillId: string) => {
    setSelectedDrills((prev) =>
      prev.includes(drillId)
        ? prev.filter((id) => id !== drillId)
        : [...prev, drillId]
    );
  };

  const handleStartPractice = async () => {
    if (selectedDrills.length === 0) return;

    setIsStarting(true);
    try {
      const selectedDrillData = drills
        .filter((d) => selectedDrills.includes(d.id))
        .map((d) => ({
          id: d.id,
          name: d.name,
          config: { targetValue: 100 },
          progress: 0,
        }));

      await startSession(sport.id as SportType, [], "practice", {
        drills: selectedDrillData,
      });
      router.push("/session");
    } catch (error) {
      console.error("Failed to start practice session:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const getDifficultyColor = (difficulty: Drill["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "intermediate":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
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
                    {sport.name} Practice
                  </h1>
                  <p className="text-xs text-slate-400">
                    Select drills to practice
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                {selectedDrills.length} drill
                {selectedDrills.length !== 1 ? "s" : ""} selected
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-xs text-slate-500">Day Streak</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">23</div>
            <div className="text-xs text-slate-500">Sessions</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">87</div>
            <div className="text-xs text-slate-500">Drills Done</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">+12%</div>
            <div className="text-xs text-slate-500">Improvement</div>
          </div>
        </div>

        {/* Drill Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Available Drills</h2>
            <button
              onClick={() =>
                setSelectedDrills(
                  selectedDrills.length === drills.length
                    ? []
                    : drills.map((d) => d.id)
                )
              }
              className="text-sm text-primary hover:text-primary-light"
            >
              {selectedDrills.length === drills.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {drills.map((drill) => {
              const isSelected = selectedDrills.includes(drill.id);
              return (
                <button
                  key={drill.id}
                  onClick={() => toggleDrill(drill.id)}
                  className={`glass-card rounded-xl p-5 text-left transition-all ${
                    isSelected
                      ? `border-2 border-${sport.gradientFrom} ring-2 ring-${sport.gradientFrom}/20`
                      : "border-2 border-transparent hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">
                          {drill.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(
                            drill.difficulty
                          )}`}
                        >
                          {drill.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        {drill.description}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? `bg-gradient-to-br ${sport.gradient} border-transparent`
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
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {drill.duration && (
                      <div className="flex items-center gap-1">
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
                        {drill.duration}
                      </div>
                    )}
                    {drill.metrics && (
                      <div className="flex items-center gap-1">
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        {drill.metrics.slice(0, 2).join(", ")}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Practice Sessions */}
        <div className="glass-card rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h3 className="font-bold text-white">Recent Practice Sessions</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              {
                drill: "Lap Consistency",
                result: "8/10 laps within target",
                improvement: "+5%",
                time: "2 days ago",
              },
              {
                drill: "Qualifying Pace",
                result: "New PB: 1:32.456",
                improvement: "-0.3s",
                time: "3 days ago",
              },
              {
                drill: "Tire Management",
                result: "Completed 15 lap stint",
                improvement: "+8%",
                time: "5 days ago",
              },
            ].map((session, idx) => (
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">{session.drill}</div>
                  <div className="text-sm text-slate-400">{session.result}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-emerald-400">
                    {session.improvement}
                  </div>
                  <div className="text-xs text-slate-500">{session.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Start Button */}
      <div className="fixed bottom-6 left-4 right-4 max-w-5xl mx-auto z-40">
        <button
          onClick={handleStartPractice}
          disabled={selectedDrills.length === 0 || isStarting || isLoading}
          className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 ${
            selectedDrills.length > 0
              ? `bg-gradient-to-r ${sport.gradient} text-white hover:opacity-90`
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
              Start Practice ({selectedDrills.length} drill
              {selectedDrills.length !== 1 ? "s" : ""})
            </>
          )}
        </button>
      </div>
    </div>
  );
}
