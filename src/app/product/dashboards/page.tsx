"use client";

import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import { useState } from "react";

const dashboards = [
  {
    id: "darts",
    label: "Darts",
    icon: "🎯",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: "racing",
    label: "Racing",
    icon: "🏎️",
    gradient: "from-red-500 to-orange-600",
  },
  {
    id: "padel",
    label: "Padel",
    icon: "🎾",
    gradient: "from-emerald-500 to-green-600",
  },
];

export default function DashboardsPage() {
  const [activeDashboard, setActiveDashboard] = useState("darts");
  const dashboardIndex = dashboards.findIndex((d) => d.id === activeDashboard);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="text-lg">🎮</span>
              <span className="text-sm text-slate-300">
                Sport-Specific Dashboards
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
              Custom Tools for{" "}
              <span className="gradient-text">Every Sport</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-8">
              Each sport gets its own tailored interface with relevant stats,
              scoring systems, and controls designed for that specific activity.
            </p>
            <Link
              href="/waitlist"
              className="btn-primary px-6 py-3 rounded-full text-base inline-block"
            >
              Get Early Access
            </Link>
          </div>

          {/* Sport Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 rounded-2xl glass-card">
              {dashboards.map((dashboard) => (
                <button
                  key={dashboard.id}
                  onClick={() => setActiveDashboard(dashboard.id)}
                  className={`relative px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    activeDashboard === dashboard.id
                      ? `bg-gradient-to-r ${dashboard.gradient} text-white shadow-lg`
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <span className="text-lg">{dashboard.icon}</span>
                  <span className="hidden sm:inline">{dashboard.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
              {/* Browser Bar */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-slate-700 text-xs text-slate-400 font-mono">
                    app.leaguesports.co.za/{activeDashboard}
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${dashboardIndex * 100}%)`,
                  }}
                >
                  {/* Darts Dashboard */}
                  <div className="w-full flex-shrink-0 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                          <span className="text-xl">🎯</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Darts Match</h4>
                          <p className="text-xs text-slate-500">
                            501 Double Out • Best of 5
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/30">
                        LEG 3/5
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-emerald-500/10 border border-slate-700">
                        <p className="text-5xl font-bold text-sky-400 font-heading">
                          167
                        </p>
                        <p className="text-slate-500 text-sm mt-1">Remaining</p>
                        <div className="mt-2 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                          T20 → T19 → D25
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                        <p className="text-xs text-slate-500 mb-2">
                          3-DART AVG
                        </p>
                        <p className="text-5xl font-bold text-white font-heading">
                          87.4
                        </p>
                        <p className="text-xs text-primary mt-2">
                          ↑ 4.2 vs last
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: "180s", value: "2", color: "text-red-400" },
                        { label: "140+", value: "5", color: "text-amber-400" },
                        {
                          label: "100+",
                          value: "8",
                          color: "text-emerald-400",
                        },
                        { label: "D%", value: "42%", color: "text-sky-400" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                        >
                          <p className={`text-lg font-bold ${stat.color}`}>
                            {stat.value}
                          </p>
                          <p className="text-xs text-slate-500">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Racing Dashboard */}
                  <div className="w-full flex-shrink-0 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                          <span className="text-xl">🏎️</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white">ACC Session</h4>
                          <p className="text-xs text-slate-500">
                            Monza • GT3 • Dry
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center gap-1.5 border border-green-500/30">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        LIVE
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 rounded-xl bg-purple-500/10 border-2 border-purple-500/30">
                        <p className="text-[10px] text-purple-400 font-bold mb-1">
                          BEST LAP
                        </p>
                        <p className="text-2xl font-bold text-purple-400 font-mono">
                          1:47.234
                        </p>
                        <p className="text-xs text-emerald-400 mt-1">
                          -0.342 PB
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                        <p className="text-[10px] text-slate-500 font-bold mb-1">
                          LAST LAP
                        </p>
                        <p className="text-2xl font-bold text-white font-mono">
                          1:48.012
                        </p>
                        <p className="text-xs text-amber-400 mt-1">+0.778</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                        <p className="text-[10px] text-slate-500 font-bold mb-1">
                          DELTA
                        </p>
                        <p className="text-2xl font-bold text-emerald-400 font-mono">
                          -0.156
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Sector 2</p>
                      </div>
                    </div>
                    {/* Tire Status */}
                    <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-500 font-bold">
                          TIRE STATUS
                        </p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          SOFT
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { pos: "FL", temp: "94°", color: "amber" },
                          { pos: "FR", temp: "91°", color: "emerald" },
                          { pos: "RL", temp: "88°", color: "emerald" },
                          { pos: "RR", temp: "87°", color: "emerald" },
                        ].map((tire) => (
                          <div
                            key={tire.pos}
                            className="flex flex-col items-center"
                          >
                            <div
                              className={`w-8 h-12 rounded-md bg-gradient-to-b from-${tire.color}-500 to-${tire.color}-700 border-2 border-${tire.color}-400 flex items-center justify-center`}
                            >
                              <span className="text-[10px] font-bold text-white">
                                {tire.temp}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1">
                              {tire.pos}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Padel Dashboard */}
                  <div className="w-full flex-shrink-0 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                          <span className="text-xl">🎾</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Padel Match</h4>
                          <p className="text-xs text-slate-500">
                            Doubles • Best of 3
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        SET 2
                      </span>
                    </div>
                    {/* Score Display */}
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">SETS</p>
                          <p className="text-3xl font-bold text-emerald-400">
                            1
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">GAMES</p>
                          <p className="text-3xl font-bold text-white">5-4</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">POINTS</p>
                          <p className="text-3xl font-bold text-amber-400">
                            40-30
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Match Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-500">
                            Winners
                          </span>
                          <span className="text-sm font-bold text-emerald-400">
                            18
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full w-3/5 bg-emerald-500 rounded-full" />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-500">Errors</span>
                          <span className="text-sm font-bold text-red-400">
                            7
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full w-1/4 bg-red-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-10 text-center">
            What makes each dashboard special
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center text-2xl mb-4">
                🎯
              </div>
              <h3 className="font-bold text-white mb-2">Darts</h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Checkout suggestions</li>
                <li>• 3-dart averages</li>
                <li>• 180s & high scores tracking</li>
                <li>• Double percentage</li>
                <li>• 501, 301, Cricket modes</li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                🏎️
              </div>
              <h3 className="font-bold text-white mb-2">Sim Racing</h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Lap time tracking</li>
                <li>• Sector deltas</li>
                <li>• Tire temperature visualization</li>
                <li>• Championship points</li>
                <li>• ACC, iRacing, F1 support</li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center text-2xl mb-4">
                🎾
              </div>
              <h3 className="font-bold text-white mb-2">Padel & Tennis</h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Set & game scoring</li>
                <li>• Serve tracking</li>
                <li>• Winner/error stats</li>
                <li>• Tiebreak support</li>
                <li>• Doubles team management</li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                🎱
              </div>
              <h3 className="font-bold text-white mb-2">Pool & Snooker</h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Frame scoring</li>
                <li>• Break tracking</li>
                <li>• Foul management</li>
                <li>• 8-ball, 9-ball, snooker</li>
                <li>• Re-rack options</li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center text-2xl mb-4">
                ⛳
              </div>
              <h3 className="font-bold text-white mb-2">Golf</h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Hole-by-hole scoring</li>
                <li>• Handicap calculation</li>
                <li>• Stableford points</li>
                <li>• Course management</li>
                <li>• GIR & putting stats</li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 flex items-center justify-center text-2xl mb-4">
                🎳
              </div>
              <h3 className="font-bold text-white mb-2">Bowling</h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Frame-by-frame scoring</li>
                <li>• Strike/spare tracking</li>
                <li>• Average calculation</li>
                <li>• Series totals</li>
                <li>• Pin configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
            Your sport, your way
          </h2>
          <p className="text-slate-400 mb-8">
            Each dashboard is designed by players who know what matters.
          </p>
          <Link
            href="/waitlist"
            className="btn-primary px-8 py-4 rounded-full text-base"
          >
            Get Early Access
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
