"use client";

import { useParams } from "next/navigation";
import { getSportBySlug } from "@/config/sports";

export default function SportStatsPage() {
  const params = useParams();
  const sportSlug = params.sport as string;
  const sport = getSportBySlug(sportSlug);

  if (!sport) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-2">
        {sport.name} Statistics
      </h1>
      <p className="text-slate-400 mb-8">
        Your performance data and analytics
      </p>

      <div className="glass-card rounded-2xl p-8 text-center">
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-white mb-2">
          Stats Coming Soon
        </h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Detailed statistics and performance analytics will be available here.
          Keep playing to build your history!
        </p>
      </div>
    </div>
  );
}

