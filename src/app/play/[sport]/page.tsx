"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getSportBySlug, sportDrills, type SportType } from "@/config/sports";

// Mock data - replace with API calls
const getMockData = (sportId: SportType) => {
  const data: Record<
    SportType,
    {
      primaryStat: { label: string; value: string; trend: string };
      stats: { label: string; value: string }[];
      recentSessions: {
        id: string;
        type: string;
        result: string;
        time: string;
        details: string;
      }[];
      achievements: {
        id: string;
        name: string;
        description: string;
        earned: boolean;
        progress?: number;
      }[];
      weeklyGoal: { current: number; target: number; unit: string };
    }
  > = {
    racing: {
      primaryStat: { label: "Best Lap", value: "1:32.456", trend: "-0.8s" },
      stats: [
        { label: "Races", value: "24" },
        { label: "Wins", value: "8" },
        { label: "Podiums", value: "18" },
        { label: "Pole Positions", value: "5" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Race",
          result: "P1",
          time: "2h ago",
          details: "GT Championship - Spa",
        },
        {
          id: "2",
          type: "Practice",
          result: "Completed",
          time: "Yesterday",
          details: "Lap Consistency Drill",
        },
        {
          id: "3",
          type: "Race",
          result: "P3",
          time: "2 days ago",
          details: "Community Race - Monza",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "Track Master",
          earned: true,
          description: "Complete 50 laps at any track",
        },
        {
          id: "2",
          name: "Speed Demon",
          earned: false,
          description: "Set a lap under 1:30",
          progress: 85,
        },
        {
          id: "3",
          name: "Clean Racer",
          earned: true,
          description: "Complete 10 races without incidents",
        },
      ],
      weeklyGoal: { current: 12, target: 20, unit: "races" },
    },
    golf: {
      primaryStat: { label: "Handicap", value: "12.4", trend: "-1.2" },
      stats: [
        { label: "Rounds", value: "32" },
        { label: "Avg Score", value: "84" },
        { label: "Best Round", value: "76" },
        { label: "Eagles", value: "3" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Round",
          result: "82",
          time: "Yesterday",
          details: "Pebble Beach - 18 holes",
        },
        {
          id: "2",
          type: "Practice",
          result: "Completed",
          time: "2 days ago",
          details: "Putting Green",
        },
        {
          id: "3",
          type: "Round",
          result: "78",
          time: "4 days ago",
          details: "St Andrews - 18 holes",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "Eagle Eye",
          earned: true,
          description: "Make an eagle",
        },
        {
          id: "2",
          name: "Sub-80",
          earned: false,
          description: "Shoot under 80",
          progress: 92,
        },
        {
          id: "3",
          name: "Birdie Streak",
          earned: false,
          description: "3 birdies in a row",
          progress: 66,
        },
      ],
      weeklyGoal: { current: 3, target: 5, unit: "rounds" },
    },
    padel: {
      primaryStat: { label: "Win Rate", value: "68%", trend: "+5%" },
      stats: [
        { label: "Matches", value: "45" },
        { label: "Wins", value: "31" },
        { label: "Ranking", value: "#12" },
        { label: "Win Streak", value: "5" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Match",
          result: "Won",
          time: "3h ago",
          details: "vs Alex Thompson - 6-4, 6-3",
        },
        {
          id: "2",
          type: "Practice",
          result: "Completed",
          time: "Yesterday",
          details: "Bandeja Drills",
        },
        {
          id: "3",
          type: "Match",
          result: "Lost",
          time: "3 days ago",
          details: "vs Sarah Chen - 4-6, 3-6",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "Hot Streak",
          earned: true,
          description: "Win 5 matches in a row",
        },
        {
          id: "2",
          name: "Century",
          earned: false,
          description: "Play 100 matches",
          progress: 45,
        },
        {
          id: "3",
          name: "Wall Master",
          earned: true,
          description: "Complete all wall drills",
        },
      ],
      weeklyGoal: { current: 4, target: 7, unit: "matches" },
    },
    darts: {
      primaryStat: { label: "Average", value: "78.5", trend: "+3.2" },
      stats: [
        { label: "Games", value: "89" },
        { label: "180s", value: "18" },
        { label: "Checkout %", value: "42%" },
        { label: "Best Leg", value: "14 darts" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Match",
          result: "Won",
          time: "5h ago",
          details: "vs Marcus - 3-1 (501)",
        },
        {
          id: "2",
          type: "Practice",
          result: "82.3 avg",
          time: "Yesterday",
          details: "Treble 20 Practice",
        },
        {
          id: "3",
          type: "Tournament",
          result: "2nd",
          time: "3 days ago",
          details: "Club Championship",
        },
      ],
      achievements: [
        { id: "1", name: "Maximum!", earned: true, description: "Hit a 180" },
        {
          id: "2",
          name: "Pro Average",
          earned: false,
          description: "Achieve 85+ average",
          progress: 92,
        },
        {
          id: "3",
          name: "Perfect Finish",
          earned: false,
          description: "170 checkout",
          progress: 0,
        },
      ],
      weeklyGoal: { current: 8, target: 10, unit: "games" },
    },
    pool: {
      primaryStat: { label: "Win Rate", value: "62%", trend: "+4%" },
      stats: [
        { label: "Frames", value: "156" },
        { label: "Run Outs", value: "34" },
        { label: "Break %", value: "38%" },
        { label: "Best Run", value: "6 balls" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Match",
          result: "Won",
          time: "4h ago",
          details: "vs Jake - 5-3 (8-ball)",
        },
        {
          id: "2",
          type: "Practice",
          result: "Completed",
          time: "Yesterday",
          details: "Position Play",
        },
        {
          id: "3",
          type: "League",
          result: "Lost",
          time: "3 days ago",
          details: "League Match - 3-5",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "Run Out",
          earned: true,
          description: "Clear the table from break",
        },
        {
          id: "2",
          name: "Consistent",
          earned: false,
          description: "Win 10 in a row",
          progress: 60,
        },
        {
          id: "3",
          name: "Safety First",
          earned: true,
          description: "Win with 5+ safeties",
        },
      ],
      weeklyGoal: { current: 6, target: 10, unit: "frames" },
    },
    cricket: {
      primaryStat: { label: "Batting Avg", value: "34.5", trend: "+2.3" },
      stats: [
        { label: "Innings", value: "28" },
        { label: "Runs", value: "966" },
        { label: "Wickets", value: "15" },
        { label: "Catches", value: "12" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Match",
          result: "Won",
          time: "Yesterday",
          details: "Club XI vs Town FC",
        },
        {
          id: "2",
          type: "Practice",
          result: "Completed",
          time: "2 days ago",
          details: "Batting Nets",
        },
        {
          id: "3",
          type: "Match",
          result: "Lost",
          time: "5 days ago",
          details: "League Match",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "Century",
          earned: false,
          description: "Score 100 runs",
          progress: 78,
        },
        {
          id: "2",
          name: "Five-fer",
          earned: true,
          description: "Take 5 wickets in an innings",
        },
        {
          id: "3",
          name: "All-rounder",
          earned: false,
          description: "Score 50 and take 3 wickets",
          progress: 40,
        },
      ],
      weeklyGoal: { current: 2, target: 4, unit: "sessions" },
    },
    bowling: {
      primaryStat: { label: "Average", value: "186", trend: "+8" },
      stats: [
        { label: "Games", value: "45" },
        { label: "Strikes", value: "312" },
        { label: "Spares", value: "198" },
        { label: "High Game", value: "248" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "League",
          result: "Won",
          time: "3h ago",
          details: "Thursday Night League",
        },
        {
          id: "2",
          type: "Practice",
          result: "192 avg",
          time: "Yesterday",
          details: "Strike Practice",
        },
        {
          id: "3",
          type: "Open",
          result: "234",
          time: "3 days ago",
          details: "Open Bowling",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "200 Club",
          earned: true,
          description: "Bowl a 200+ game",
        },
        {
          id: "2",
          name: "Perfect Game",
          earned: false,
          description: "Bowl a 300",
          progress: 82,
        },
        {
          id: "3",
          name: "Turkey",
          earned: true,
          description: "Get 3 strikes in a row",
        },
      ],
      weeklyGoal: { current: 3, target: 5, unit: "games" },
    },
    tennis: {
      primaryStat: { label: "Win Rate", value: "58%", trend: "+3%" },
      stats: [
        { label: "Matches", value: "67" },
        { label: "Aces", value: "124" },
        { label: "1st Serve %", value: "62%" },
        { label: "Break Points", value: "43%" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Match",
          result: "Won",
          time: "5h ago",
          details: "vs Chris - 6-4, 7-5",
        },
        {
          id: "2",
          type: "Practice",
          result: "Completed",
          time: "Yesterday",
          details: "Serve Practice",
        },
        {
          id: "3",
          type: "Match",
          result: "Lost",
          time: "4 days ago",
          details: "vs Mike - 3-6, 4-6",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "Ace Master",
          earned: true,
          description: "Hit 100 aces",
        },
        {
          id: "2",
          name: "Bagel",
          earned: false,
          description: "Win a set 6-0",
          progress: 0,
        },
        {
          id: "3",
          name: "Comeback Kid",
          earned: true,
          description: "Win from 0-4 down",
        },
      ],
      weeklyGoal: { current: 3, target: 5, unit: "matches" },
    },
    squash: {
      primaryStat: { label: "Win Rate", value: "64%", trend: "+6%" },
      stats: [
        { label: "Matches", value: "52" },
        { label: "Wins", value: "33" },
        { label: "Points Won", value: "1,245" },
        { label: "Win Streak", value: "4" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Match",
          result: "Won",
          time: "2h ago",
          details: "vs Dan - 3-1",
        },
        {
          id: "2",
          type: "Practice",
          result: "Completed",
          time: "Yesterday",
          details: "Solo Drills",
        },
        {
          id: "3",
          type: "Match",
          result: "Won",
          time: "3 days ago",
          details: "vs Emma - 3-2",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "Court King",
          earned: true,
          description: "Win 30 matches",
        },
        {
          id: "2",
          name: "Clean Sweep",
          earned: false,
          description: "Win 3-0 five times",
          progress: 60,
        },
        {
          id: "3",
          name: "Iron Will",
          earned: true,
          description: "Win a 5-game match",
        },
      ],
      weeklyGoal: { current: 4, target: 6, unit: "matches" },
    },
    soccer: {
      primaryStat: { label: "Goals", value: "12", trend: "+2" },
      stats: [
        { label: "Matches", value: "18" },
        { label: "Assists", value: "8" },
        { label: "Pass %", value: "84%" },
        { label: "Minutes", value: "1,420" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Match",
          result: "Won 3-1",
          time: "Yesterday",
          details: "Sunday League",
        },
        {
          id: "2",
          type: "Practice",
          result: "Completed",
          time: "3 days ago",
          details: "Shooting Drills",
        },
        {
          id: "3",
          type: "Match",
          result: "Draw 2-2",
          time: "1 week ago",
          details: "Friendly Match",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "Hat-trick Hero",
          earned: false,
          description: "Score 3 goals in a match",
          progress: 66,
        },
        {
          id: "2",
          name: "Playmaker",
          earned: true,
          description: "Get 5 assists",
        },
        {
          id: "3",
          name: "Clean Sheet",
          earned: true,
          description: "Win without conceding",
        },
      ],
      weeklyGoal: { current: 1, target: 2, unit: "matches" },
    },
    rugby: {
      primaryStat: { label: "Tries", value: "8", trend: "+1" },
      stats: [
        { label: "Matches", value: "14" },
        { label: "Tackles", value: "87" },
        { label: "Carries", value: "42" },
        { label: "Points", value: "45" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Match",
          result: "Won 24-18",
          time: "2 days ago",
          details: "Club vs Rovers",
        },
        {
          id: "2",
          type: "Practice",
          result: "Completed",
          time: "4 days ago",
          details: "Lineout Drills",
        },
        {
          id: "3",
          type: "Match",
          result: "Lost 12-21",
          time: "1 week ago",
          details: "Cup Quarter Final",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "Try Scorer",
          earned: true,
          description: "Score 5 tries",
        },
        {
          id: "2",
          name: "Tackle Machine",
          earned: false,
          description: "Make 100 tackles",
          progress: 87,
        },
        {
          id: "3",
          name: "Conversion King",
          earned: false,
          description: "Kick 10 conversions",
          progress: 40,
        },
      ],
      weeklyGoal: { current: 1, target: 2, unit: "sessions" },
    },
    netball: {
      primaryStat: { label: "Goals", value: "156", trend: "+12" },
      stats: [
        { label: "Matches", value: "22" },
        { label: "Assists", value: "34" },
        { label: "Intercepts", value: "18" },
        { label: "Shoot %", value: "78%" },
      ],
      recentSessions: [
        {
          id: "1",
          type: "Match",
          result: "Won 42-38",
          time: "Yesterday",
          details: "League Match",
        },
        {
          id: "2",
          type: "Practice",
          result: "Completed",
          time: "3 days ago",
          details: "Shooting Circle",
        },
        {
          id: "3",
          type: "Match",
          result: "Won 35-30",
          time: "1 week ago",
          details: "vs Eagles",
        },
      ],
      achievements: [
        {
          id: "1",
          name: "Sharpshooter",
          earned: true,
          description: "80%+ shooting accuracy",
        },
        {
          id: "2",
          name: "Interceptor",
          earned: false,
          description: "Get 25 intercepts",
          progress: 72,
        },
        {
          id: "3",
          name: "MVP",
          earned: true,
          description: "Be named player of the match",
        },
      ],
      weeklyGoal: { current: 2, target: 3, unit: "matches" },
    },
  };
  return data[sportId];
};

export default function SportHomePage() {
  const params = useParams();
  const sportSlug = params.sport as string;
  const sport = getSportBySlug(sportSlug);

  if (!sport) return null;

  const data = getMockData(sport.id);
  const drills = sportDrills[sport.id] || [];
  const goalProgress = (data.weeklyGoal.current / data.weeklyGoal.target) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Welcome to {sport.name}
        </h1>
        <p className="text-slate-400">
          Your personal {sport.name.toLowerCase()} training ground
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link
          href={`/play/${sportSlug}/casual`}
          className="glass-card rounded-xl p-5 hover:border-emerald-500/30 transition-all group"
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
          <h3 className="font-semibold text-white mb-1">Quick Play</h3>
          <p className="text-xs text-slate-400">Casual game for fun</p>
        </Link>

        <Link
          href={`/play/${sportSlug}/practice`}
          className="glass-card rounded-xl p-5 hover:border-amber-500/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
          <h3 className="font-semibold text-white mb-1">Practice</h3>
          <p className="text-xs text-slate-400">
            {drills.length} drills available
          </p>
        </Link>

        <Link
          href={`/play/${sportSlug}/compete`}
          className="glass-card rounded-xl p-5 hover:border-red-500/30 transition-all group"
        >
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
          <h3 className="font-semibold text-white mb-1">Compete</h3>
          <p className="text-xs text-slate-400">Ranked matches</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Primary Stat Card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${sport.gradient} opacity-10 blur-3xl`}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    {data.primaryStat.label}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-white">
                      {data.primaryStat.value}
                    </span>
                    <span className="text-sm text-emerald-400 font-medium">
                      {data.primaryStat.trend}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center`}
                >
                  <svg
                    className="w-8 h-8 text-white"
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
              </div>

              <div className="grid grid-cols-4 gap-4">
                {data.stats.map((stat, idx) => (
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

          {/* Recent Sessions */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="font-bold text-white">Recent Activity</h3>
              <Link
                href={`/play/${sportSlug}/history`}
                className="text-sm text-primary hover:text-primary-light"
              >
                View all →
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {data.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
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
                        d={sport.icon}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {session.type}
                      </span>
                      <span className="font-medium text-white">
                        {session.result}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 truncate">
                      {session.details}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">{session.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Weekly Goal */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Weekly Goal</h3>
              <span className="text-sm text-slate-400">
                {data.weeklyGoal.current}/{data.weeklyGoal.target}{" "}
                {data.weeklyGoal.unit}
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-700 overflow-hidden mb-3">
              <div
                className={`h-full bg-gradient-to-r ${sport.gradient} transition-all duration-500`}
                style={{ width: `${Math.min(goalProgress, 100)}%` }}
              />
            </div>
            <p className="text-sm text-slate-400">
              {goalProgress >= 100
                ? "🎉 Goal achieved! Keep going!"
                : `${
                    data.weeklyGoal.target - data.weeklyGoal.current
                  } more to hit your goal`}
            </p>
          </div>

          {/* Achievements */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Achievements</h3>
              <span className="text-xs text-slate-500">
                {data.achievements.filter((a) => a.earned).length}/
                {data.achievements.length}
              </span>
            </div>
            <div className="space-y-3">
              {data.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-xl ${
                    achievement.earned
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        achievement.earned
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {achievement.earned ? (
                        <svg
                          className="w-4 h-4"
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
                      ) : (
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">
                        {achievement.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                  {!achievement.earned &&
                    achievement.progress !== undefined && (
                      <div className="mt-2 ml-11">
                        <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-slate-500 transition-all"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Suggested Next
            </h3>
            <Link
              href={`/play/${sportSlug}/practice`}
              className={`block p-4 rounded-xl bg-gradient-to-r ${sport.gradient} bg-opacity-10 border border-white/10 hover:border-white/20 transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
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
                <div>
                  <div className="font-medium text-white">
                    Try a Practice Drill
                  </div>
                  <div className="text-xs text-white/60">
                    Improve your {drills[0]?.name || "skills"}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
