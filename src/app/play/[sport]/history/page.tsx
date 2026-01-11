"use client";

import { useParams } from "next/navigation";
import { getSportBySlug } from "@/config/sports";

export default function SportHistoryPage() {
  const params = useParams();
  const sportSlug = params.sport as string;
  const sport = getSportBySlug(sportSlug);

  if (!sport) return null;

  const mockHistory = [
    {
      id: "1",
      type: "Competitive",
      result: "Won",
      score: "6-4, 6-3",
      opponent: "Alex Thompson",
      date: "Today, 2:30 PM",
    },
    {
      id: "2",
      type: "Practice",
      result: "Completed",
      score: "3 drills",
      opponent: null,
      date: "Yesterday, 4:15 PM",
    },
    {
      id: "3",
      type: "Casual",
      result: "Lost",
      score: "4-6, 3-6",
      opponent: "Sarah Chen",
      date: "2 days ago",
    },
    {
      id: "4",
      type: "Competitive",
      result: "Won",
      score: "7-5, 6-4",
      opponent: "Mike Rodriguez",
      date: "3 days ago",
    },
    {
      id: "5",
      type: "Practice",
      result: "Completed",
      score: "5 drills",
      opponent: null,
      date: "4 days ago",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Competitive":
        return "bg-red-500/20 text-red-400";
      case "Practice":
        return "bg-amber-500/20 text-amber-400";
      case "Casual":
        return "bg-emerald-500/20 text-emerald-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "Won":
        return "text-emerald-400";
      case "Lost":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-2">Match History</h1>
      <p className="text-slate-400 mb-8">
        Your recent {sport.name.toLowerCase()} sessions
      </p>

      <div className="space-y-3">
        {mockHistory.map((item) => (
          <div
            key={item.id}
            className="glass-card rounded-xl p-4 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center`}
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
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(
                    item.type
                  )}`}
                >
                  {item.type}
                </span>
                <span className={`font-medium ${getResultColor(item.result)}`}>
                  {item.result}
                </span>
              </div>
              <div className="text-sm text-slate-400">
                {item.opponent ? `vs ${item.opponent} • ` : ""}
                {item.score}
              </div>
            </div>
            <div className="text-sm text-slate-500">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
