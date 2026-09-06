"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Icon Components
const ScorecardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ProgressIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const BadgeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const TrainingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const CommunitiesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const IntegrationsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const toastNotifications = [
  {
    id: 1,
    title: "New Badge Unlocked!",
    message: "First Win - Keep it up!",
    icon: BadgeIcon,
    time: "Just now",
  },
  {
    id: 2,
    title: "Progress Update",
    message: "Your rating improved by 0.3",
    icon: ProgressIcon,
    time: "2m ago",
  },
  {
    id: 3,
    title: "Match Recorded",
    message: "Weekend Tournament score saved",
    icon: ScorecardIcon,
    time: "5m ago",
  },
  {
    id: 4,
    title: "Training Complete",
    message: "Accuracy Practice finished",
    icon: TrainingIcon,
    time: "10m ago",
  },
  {
    id: 5,
    title: "Community Update",
    message: "New member joined your club",
    icon: CommunitiesIcon,
    time: "15m ago",
  },
  {
    id: 6,
    title: "Integration Synced",
    message: "Trackman data updated",
    icon: IntegrationsIcon,
    time: "20m ago",
  },
];

export default function FeaturesPage() {
  const [notificationQueue, setNotificationQueue] = useState<number[]>([0, 1]);
  const [nextIndex, setNextIndex] = useState(2);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationQueue((prev) => {
        if (prev.length > 0) {
          setExitingIndex(prev[0]);
          setTimeout(() => setExitingIndex(null), 600);
        }
        const newQueue = [...prev, nextIndex];
        return newQueue.slice(-2);
      });
      setNextIndex((prev) => (prev + 1) % toastNotifications.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [nextIndex]);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Phone */}
      <section className="relative flex min-h-[90vh] items-start overflow-hidden border-b border-white/10">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid gap-0 lg:grid-cols-2 lg:items-start">
            {/* Left Side - Text Content */}
            <div className="space-y-8 lg:pr-4">
              <div>
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
                  Live today
                </p>
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  <span className="block">Better Sports</span>
                  <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                    Tracking
                  </span>
                </h1>
                <p className="mt-8 text-xl leading-8 text-gray-400 sm:text-2xl">
                  Everything you need to track, improve, and share your sporting journey. All connected, all in one place.
                </p>
                <p className="mt-4 text-sm leading-6 text-gray-500">
                  Padel and golf scorecards lock to your account today — ratings,
                  badges, and training integrations are on the roadmap.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/padel/new"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  <span className="relative z-10">Play now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
                >
                  Log in
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                Scorecards are live for padel and golf. Sign in to keep locked
                results on your hub.
              </p>
            </div>

            {/* Right Side - Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end lg:-ml-4">
              <div className="relative" style={{ perspective: "1000px" }}>
                <div
                  className="relative transition-transform duration-300"
                  style={{
                    transform: "rotateY(-15deg) rotateX(5deg) translateZ(0)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-[3rem] bg-black/60 blur-3xl"
                    style={{
                      transform: "translateZ(-80px) scale(1.15)",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-[3rem] bg-black/40 blur-2xl"
                    style={{
                      transform: "translateZ(-40px) scale(1.08)",
                    }}
                  />

                  <div
                    className="relative mx-auto h-[600px] w-[300px] rounded-[2.5rem] bg-gray-800 p-1.5"
                    style={{
                      boxShadow: `
                        inset 0 0 0 1px rgba(255, 255, 255, 0.1),
                        0 0 0 1px rgba(0, 0, 0, 0.5),
                        0 20px 60px rgba(0, 0, 0, 0.8),
                        0 8px 24px rgba(0, 0, 0, 0.6)
                      `
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-12 rounded-t-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    <div className="absolute inset-1.5 rounded-[2rem] border border-white/5" />
                    <div className="absolute -left-1.5 top-32 h-10 w-0.5 rounded-l bg-gray-700/80" />
                    <div className="absolute -left-1.5 top-46 h-10 w-0.5 rounded-l bg-gray-700/80" />
                    <div className="absolute -right-1.5 top-40 h-14 w-0.5 rounded-r bg-gray-700/80" />

                    <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
                      <div className="relative h-6 w-28 rounded-b-2xl bg-gray-800">
                        <div className="absolute left-1/2 top-1.5 h-0.5 w-12 -translate-x-1/2 rounded-full bg-gray-600/60" />
                        <div className="absolute right-3 top-1.5 h-1.5 w-1.5 rounded-full bg-gray-700" />
                      </div>
                    </div>

                    <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-black">
                      <div className="absolute inset-0 rounded-[2rem] ring-[0.5px] ring-white/5" />

                      <div className="absolute left-3 top-44 z-30 w-[calc(100%-1.5rem)] max-w-[260px]">
                        {notificationQueue.map((toastIndex, idx) => {
                          const toast = toastNotifications[toastIndex];
                          const isNew = idx === notificationQueue.length - 1;
                          const isExiting = exitingIndex === toastIndex && idx === 0;
                          const positionFromBottom = notificationQueue.length - 1 - idx;

                          return (
                            <div
                              key={`${toast.id}-${toastIndex}-${notificationQueue.length}`}
                              className="absolute left-0 right-0 rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-3 shadow-lg transition-all duration-500 ease-out"
                              style={{
                                bottom: `${positionFromBottom * 70}px`,
                                animation: isNew
                                  ? `slide-in-from-left 0.5s ease-out, fade-in 0.5s ease-out`
                                  : isExiting
                                    ? `slide-out-to-top 0.5s ease-out, fade-out 0.5s ease-out`
                                    : undefined,
                                zIndex: 30 + idx,
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                                  <toast.icon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-xs font-semibold text-white leading-tight">
                                      {toast.title}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 shrink-0">
                                      {toast.time}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-[11px] text-gray-300 leading-tight">
                                    {toast.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between px-6 pt-3 text-xs text-white">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-white" />
                          <div className="h-1 w-1 rounded-full bg-white" />
                          <div className="h-1 w-1 rounded-full bg-white" />
                          <div className="h-1 w-1 rounded-full bg-white" />
                        </div>
                      </div>

                      <div className="h-[calc(100%-3rem)] overflow-y-auto px-6 py-4">
                        <div className="mb-6 text-center">
                          <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg" />
                          <h3 className="text-xl font-bold">Alex Johnson</h3>
                          <p className="text-sm text-gray-400">@alexj_sports</p>
                        </div>

                        <div className="mb-6 grid grid-cols-3 gap-4">
                          <div className="rounded-lg bg-white/5 p-3 text-center backdrop-blur-sm">
                            <div className="text-2xl font-bold">127</div>
                            <div className="text-xs text-gray-400">Games</div>
                          </div>
                          <div className="rounded-lg bg-white/5 p-3 text-center backdrop-blur-sm">
                            <div className="text-2xl font-bold">4.8</div>
                            <div className="text-xs text-gray-400">Rating</div>
                          </div>
                          <div className="rounded-lg bg-white/5 p-3 text-center backdrop-blur-sm">
                            <div className="text-2xl font-bold">23</div>
                            <div className="text-xs text-gray-400">Badges</div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="mb-3 text-sm font-semibold text-gray-300">Sports</h4>
                          <div className="flex flex-wrap gap-2">
                            {["Darts", "Padel", "Sim Racing"].map((sport) => (
                              <span
                                key={sport}
                                className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs backdrop-blur-sm"
                              >
                                {sport}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-gray-300">Recent Activity</h4>
                          <div className="space-y-2">
                            {[
                              { title: "Weekend Tournament", result: "Win", time: "2 days ago" },
                              { title: "Practice Match", result: "Win", time: "5 days ago" },
                              { title: "League Game", result: "Loss", time: "1 week ago" },
                            ].map((activity, i) => (
                              <div key={i} className="rounded-lg bg-white/5 p-3 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium">{activity.title}</div>
                                    <div className="text-xs text-gray-400">{activity.time}</div>
                                  </div>
                                  <div
                                    className={`text-sm font-semibold ${activity.result === "Win" ? "text-green-400" : "text-red-400"
                                      }`}
                                  >
                                    {activity.result}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
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

      {/* Feature 1: Digital Scorecards */}
      <section className="relative border-b border-white/10 bg-[#0c0f0c] py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
                <ScorecardIcon className="mr-2 h-4 w-4" />
                <span>Digital Scorecards</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Never Lose a Score Again
              </h2>
              <p className="text-lg leading-8 text-gray-400">
                Say goodbye to paper scorecards and lost data. Our intuitive digital scorecards make it effortless to record every game, match, and practice session. With real-time scoring, automatic calculations, and cloud backup, your performance data is always safe and accessible.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Real-time scoring with instant calculations</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatic cloud sync across all devices</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Export scores to PDF or share with teammates</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Support for all sports and game formats</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold">Darts Match</h3>
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">Live</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-l-lg bg-red-500 p-4">
                      <div className="text-sm text-black">Player 1</div>
                      <div className="mt-2 text-5xl font-bold">301</div>
                      <div className="mt-1 text-xs text-black">Remaining</div>
                    </div>
                    <div className="rounded-r-lg bg-orange-500 p-4">
                      <div className="text-sm text-black">Player 2</div>
                      <div className="mt-2 text-5xl font-bold">287</div>
                      <div className="mt-1 text-xs text-black">Remaining</div>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-white/5">
                    <div className="flex gap-1 justify-around">
                      <div className="text-lg font-semibold text-gray-300 bg-white/10 p-4 flex-1 rounded-l-lg"></div>
                      <div className="text-lg font-semibold text-gray-300 bg-white/10 p-4 w-20">1</div>
                      <div className="text-lg font-semibold text-gray-300 bg-white/10 p-4 w-20">20</div>
                      <div className="text-lg font-semibold text-gray-300 bg-white/10 p-4 w-20">14</div>
                      <div className="text-lg font-semibold text-gray-300 bg-white/10 p-4 flex-1">
                        <button className="p-4 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xs transition-colors"> Submit</button>
                      </div>
                    </div>
                  </div>
                  <div className=" mx-auto rounded-xl">
                    <div className="grid grid-cols-5 gap-2">
                      {/* Multipliers - Top Row */}
                      {['Single', 'Double', 'Treble'].map((m) => (
                        <button key={m} className="p-4 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xs transition-colors">
                          {m}
                        </button>
                      ))}
                      <button className="p-4 text-sm font-bold bg-orange-600 hover:bg-orange-500 rounded-xs">Bull</button>
                      <button className="p-4 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xs">Outer</button>

                      {/* Number Grid - 1 to 20 */}
                      {[...Array(20)].map((_, i) => (
                        <button
                          key={i}
                          className="p-4 text-lg bg-white/10 hover:bg-white/20 border border-white/5 rounded-xs transition-all active:scale-95"
                        >
                          {i + 1}
                        </button>
                      ))}

                      {/* Bottom Actions */}
                      <button className="col-span-2 p-4 font-bold bg-red-900/40 hover:bg-red-800/60 text-red-200 rounded-xs">
                        Back
                      </button>
                      <div></div>
                      <button className="col-span-2 p-4 font-bold bg-slate-700 hover:bg-slate-600 rounded-xs">
                        Miss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Progress Tracking */}
      <section className="relative border-b border-white/10 bg-[#0c0f0c] py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="mb-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Performance Trends</h3>
                    <select className="rounded-lg bg-white/10 px-3 py-1 text-sm text-gray-300">
                      <option>Last 30 days</option>
                    </select>
                  </div>
                  {/* Beautiful Line Graph */}
                  <div className="relative h-64 w-full">
                    <svg className="h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
                          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid Lines */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <line
                          key={i}
                          x1="20"
                          y1={40 + i * 40}
                          x2="380"
                          y2={40 + i * 40}
                          stroke="rgba(255, 255, 255, 0.05)"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Data Points */}
                      {(() => {
                        const data = [45, 52, 48, 58, 55, 62, 59, 65, 68, 64, 70, 72];
                        const maxValue = 80;
                        const minValue = 40;
                        const range = maxValue - minValue;
                        const width = 360;
                        const height = 120;
                        const stepX = width / (data.length - 1);
                        const points = data.map((value, i) => {
                          const x = 20 + i * stepX;
                          const y = 40 + height - ((value - minValue) / range) * height;
                          return `${x},${y}`;
                        }).join(' ');

                        // Area under the curve
                        const areaPath = `M 20,160 ${points} L ${20 + (data.length - 1) * stepX},160 Z`;

                        // Line path
                        const linePath = `M ${points.split(' ')[0]} ${points.split(' ').slice(1).map(p => `L ${p}`).join(' ')}`;

                        return (
                          <>
                            {/* Area fill */}
                            <path
                              d={areaPath}
                              fill="url(#areaGradient)"
                            />
                            {/* Line */}
                            <path
                              d={linePath}
                              fill="none"
                              stroke="url(#lineGradient)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {/* Data points */}
                            {data.map((value, i) => {
                              const x = 20 + i * stepX;
                              const y = 40 + height - ((value - minValue) / range) * height;
                              return (
                                <g key={i}>
                                  {/* Glow effect */}
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="6"
                                    fill="rgba(59, 130, 246, 0.4)"
                                    className="animate-pulse"
                                  />
                                  {/* Point */}
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="rgb(59, 130, 246)"
                                    className="transition-all hover:r-6"
                                  />
                                  {/* Value label on hover */}
                                  <text
                                    x={x}
                                    y={y - 12}
                                    textAnchor="middle"
                                    className="fill-white text-xs font-semibold opacity-0 transition-opacity hover:opacity-100"
                                  >
                                    {value}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}

                      {/* Y-axis labels */}
                      {[0, 1, 2, 3, 4].map((i) => {
                        const value = 80 - i * 10;
                        return (
                          <text
                            key={i}
                            x="15"
                            y={45 + i * 40}
                            textAnchor="end"
                            className="fill-gray-500 text-xs"
                          >
                            {value}
                          </text>
                        );
                      })}
                    </svg>

                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-5 pb-1">
                      <span className="text-xs text-gray-500">Week 1</span>
                      <span className="text-xs text-gray-500">Week 2</span>
                      <span className="text-xs text-gray-500">Week 3</span>
                      <span className="text-xs text-gray-500">Week 4</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">+12%</div>
                    <div className="text-xs text-gray-400">Improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="text-xs text-gray-400">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">127</div>
                    <div className="text-xs text-gray-400">Games Played</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 space-y-6 lg:order-2">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
                <ProgressIcon className="mr-2 h-4 w-4" />
                <span>Progress Tracking</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Watch Your Skills Improve
              </h2>
              <p className="text-lg leading-8 text-gray-400">
                Transform raw data into actionable insights. Our advanced analytics engine tracks your performance across multiple dimensions, revealing patterns, trends, and areas for improvement. Visualize your progress with beautiful charts and detailed breakdowns that help you understand exactly how you're getting better.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Comprehensive performance analytics and trends</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Compare performance across different time periods</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Identify strengths and areas for improvement</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Set goals and track your progress toward them</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Achievement Badges */}
      <section className="relative border-b border-white/10 bg-[#0c0f0c] py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
                <BadgeIcon className="mr-2 h-4 w-4" />
                <span>Achievement Badges</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Celebrate Every Milestone
              </h2>
              <p className="text-lg leading-8 text-gray-400">
                Turn your achievements into tangible rewards. Our badge system recognizes your dedication, skill improvements, and milestones. From your first win to mastering advanced techniques, every accomplishment is celebrated with beautifully designed badges that showcase your journey.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlock badges for milestones and achievements</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Showcase your collection on your profile</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Compete with friends on badge collections</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Rare and legendary badges for exceptional achievements</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-xl font-bold tracking-tight text-white">Your Badge Collection</h3>
                  <div className="mb-3 text-sm font-medium text-gray-400">23 of 50 unlocked</div>
                  <div className="relative mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-black/40 shadow-inner">
                    <div className="h-full w-[46%] rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_16px_rgba(251,191,36,0.6)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>

                {/* Featured Legendary Badge - Premium Design */}
                <div className="mb-8 flex justify-center">
                  <div className="group relative">
                    {/* Multiple glow layers for depth */}
                    <div className="absolute inset-0 -m-6 rounded-full bg-gradient-to-r from-amber-400/60 via-yellow-400/60 to-amber-500/60 blur-2xl opacity-50 transition-opacity duration-500 group-hover:opacity-70" />
                    <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-r from-yellow-300/40 via-amber-300/40 to-yellow-400/40 blur-xl opacity-30 transition-opacity duration-500 group-hover:opacity-50" />

                    {/* Premium 3D badge */}
                    <div className="relative transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6">
                      {/* Outer gold ring with bevel */}
                      <div
                        className="relative h-24 w-24 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #d97706 50%, #f59e0b 75%, #fbbf24 100%)',
                          boxShadow: `
                            inset 0 2px 4px rgba(255,255,255,0.3),
                            inset 0 -2px 4px rgba(0,0,0,0.3),
                            0 0 0 2px rgba(251,191,36,0.3),
                            0 6px 24px rgba(251,191,36,0.4),
                            0 0 40px rgba(251,191,36,0.3)
                          `
                        }}
                      >
                        {/* Inner badge surface */}
                        <div
                          className="absolute inset-[4px] rounded-full"
                          style={{
                            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(251,191,36,0.2), rgba(217,119,6,0.3))',
                            boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.2), inset 0 -2px 6px rgba(0,0,0,0.3)'
                          }}
                        >
                          {/* Shine highlight */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent" />

                          {/* Icon with premium styling */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-4xl drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                              👑
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Floating particles */}
                      <div className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-ping" />
                      <div className="absolute -bottom-1 -left-1 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)] animate-ping" style={{ animationDelay: '0.3s' }} />
                      <div className="absolute top-1/2 -left-2 h-0.5 w-0.5 rounded-full bg-yellow-200 shadow-[0_0_3px_rgba(251,191,36,0.8)] animate-ping" style={{ animationDelay: '0.6s' }} />
                    </div>

                    <div className="mt-3 text-center">
                      <div className="text-base font-bold tracking-wider text-yellow-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">Master</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">Legendary</div>
                    </div>
                  </div>
                </div>

                {/* Badge Grid - Premium Design */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "First Win", icon: "🏆", rarity: "common" },
                    { name: "Perfect", icon: "⭐", rarity: "rare" },
                    { name: "Century", icon: "💯", rarity: "epic" },
                    { name: "Streak", icon: "🔥", rarity: "common" },
                    { name: "Rookie", icon: "🌱", rarity: "common" },
                    { name: "Ace", icon: "🎯", rarity: "rare" },
                  ].map((badge, i) => {
                    const rarityStyles = {
                      common: {
                        outer: "from-gray-700 via-gray-600 to-gray-700",
                        inner: "from-gray-800/80 via-gray-700/80 to-gray-900/80",
                        border: "border-gray-500/40",
                        glow: "from-gray-400/30 to-gray-500/30",
                        shadow: "shadow-[0_3px_12px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.1)]",
                        text: "text-gray-400",
                        label: "text-gray-500",
                      },
                      rare: {
                        outer: "from-blue-500 via-cyan-400 to-blue-600",
                        inner: "from-blue-600/90 via-cyan-500/90 to-blue-700/90",
                        border: "border-blue-400/50",
                        glow: "from-blue-400/50 to-cyan-400/50",
                        shadow: "shadow-[0_3px_16px_rgba(59,130,246,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)]",
                        text: "text-blue-300",
                        label: "text-blue-400",
                      },
                      epic: {
                        outer: "from-purple-500 via-pink-400 to-purple-600",
                        inner: "from-purple-600/90 via-pink-500/90 to-purple-700/90",
                        border: "border-purple-400/50",
                        glow: "from-purple-400/50 to-pink-400/50",
                        shadow: "shadow-[0_3px_16px_rgba(168,85,247,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)]",
                        text: "text-purple-300",
                        label: "text-purple-400",
                      },
                    };

                    const style = rarityStyles[badge.rarity as keyof typeof rarityStyles];

                    return (
                      <div
                        key={i}
                        className="group relative transition-all duration-500 hover:scale-110"
                      >
                        {/* Glow effect */}
                        {(badge.rarity === "rare" || badge.rarity === "epic") && (
                          <div className={`absolute inset-0 -m-1.5 rounded-full bg-gradient-to-r ${style.glow} opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-60`} />
                        )}

                        {/* Premium 3D badge */}
                        <div className="relative">
                          {/* Outer ring */}
                          <div
                            className={`h-16 w-16 rounded-full bg-gradient-to-br ${style.outer} transition-all duration-500 group-hover:brightness-110`}
                            style={{
                              boxShadow: style.shadow
                            }}
                          >
                            {/* Inner surface */}
                            <div
                              className={`absolute inset-[3px] rounded-full bg-gradient-to-br ${style.inner} border ${style.border}`}
                              style={{
                                boxShadow: 'inset 0 1px 4px rgba(255,255,255,0.15), inset 0 -1px 4px rgba(0,0,0,0.3)'
                              }}
                            >
                              {/* Shine */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />

                              {/* Icon */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                  {badge.icon}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Label */}
                        <div className="mt-2 text-center">
                          <div className={`text-[10px] font-bold tracking-wide ${style.text} drop-shadow-sm`}>
                            {badge.name}
                          </div>
                          {badge.rarity !== "common" && (
                            <div className={`mt-0.5 text-[8px] font-semibold uppercase tracking-wider ${style.label}`}>
                              {badge.rarity}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Premium progress indicator */}
                <div className="mt-6 flex items-center justify-between rounded-xl border border-white/20 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-5 py-3 backdrop-blur-sm shadow-lg">
                  <div className="text-xs font-semibold text-gray-300">Collection Progress</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-white">46%</div>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/40 shadow-inner">
                      <div className="h-full w-[46%] rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button className="group text-sm font-semibold tracking-wide text-gray-400 transition-all duration-300 hover:text-white">
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      View All Badges
                    </span>
                    <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Custom Training */}
      <section className="relative border-b border-white/10 bg-[#0c0f0c] py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-green-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold">Training Plan: Accuracy Focus</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Warm-up", duration: "10 min", completed: true },
                      { name: "Target Practice", duration: "20 min", completed: true },
                      { name: "Precision Drills", duration: "15 min", completed: false },
                      { name: "Cool-down", duration: "5 min", completed: false },
                    ].map((exercise, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between rounded-lg border p-4 ${exercise.completed
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-white/10 bg-white/5"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${exercise.completed
                              ? "bg-green-500/20 text-green-400"
                              : "bg-white/10 text-gray-400"
                              }`}
                          >
                            {exercise.completed ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-current" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{exercise.name}</div>
                            <div className="text-xs text-gray-400">{exercise.duration}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="text-sm text-gray-400">Progress</div>
                  <div className="text-sm font-semibold">50% Complete</div>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                </div>
              </div>
            </div>
            <div className="order-1 space-y-6 lg:order-2">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
                <TrainingIcon className="mr-2 h-4 w-4" />
                <span>Custom Training</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Train Smarter, Not Harder
              </h2>
              <p className="text-lg leading-8 text-gray-400">
                Design training routines that match your goals and schedule. Whether you're working on accuracy, consistency, or advanced techniques, our flexible training system adapts to your needs. Track your training sessions, monitor improvements, and adjust your plan as you progress.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Create personalized training plans tailored to your goals</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access a library of proven training exercises and drills</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Track training sessions and measure improvement over time</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Get reminders and stay motivated with progress tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 5: Communities */}
      <section className="relative border-b border-white/10 bg-[#0c0f0c] py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-pink-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
                <CommunitiesIcon className="mr-2 h-4 w-4" />
                <span>Communities</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Connect with Players Like You
              </h2>
              <p className="text-lg leading-8 text-gray-400">
                Join vibrant communities of passionate players who share your love for the game. Whether you're looking for practice partners, tournament teams, or just friendly competition, our community features make it easy to connect, collaborate, and grow together.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Join or create communities for your favorite sports</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Organize events, tournaments, and casual meetups</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Share achievements and celebrate wins together</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Find players near you or connect globally</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold">Cape Town Darts Club</h3>
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Cape Town, South Africa</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <div className="text-xl font-bold">248</div>
                      <div className="text-xs text-gray-400">Members</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">12</div>
                      <div className="text-xs text-gray-400">Events</div>
                    </div>
                  </div>
                </div>
                <div className="mb-4 space-y-3">
                  <div className="text-sm font-semibold text-gray-300">Recent Activity</div>
                  {[
                    { user: "Sarah M.", action: "joined the community", time: "2h ago" },
                    { user: "Mike T.", action: "shared a new score", time: "5h ago" },
                    { user: "Emma L.", action: "created an event", time: "1d ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-white/5 p-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-medium">{activity.user}</span>{" "}
                          <span className="text-gray-400">{activity.action}</span>
                        </div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/communities"
                  className="block w-full rounded-lg bg-white/10 px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-white/20"
                >
                  Join a community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 6: Smart Integrations */}
      <section className="relative border-b border-white/10 bg-[#0c0f0c] py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="mb-6 text-lg font-semibold">Connected Services</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Trackman", status: "connected", icon: "🎯" },
                      { name: "Autodarts", status: "connected", icon: "🎲" },
                      { name: "MyFitnessPal", status: "available", icon: "💪" },
                    ].map((service, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between rounded-lg border p-4 ${service.status === "connected"
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-white/10 bg-white/5"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{service.icon}</div>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-xs text-gray-400">
                              {service.status === "connected" ? "Syncing data" : "Available to connect"}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-xs font-medium ${service.status === "connected"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/10 text-gray-400"
                            }`}
                        >
                          {service.status === "connected" ? "Active" : "Connect"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last sync: 2 minutes ago</span>
                  </div>
                  <div className="text-xs text-gray-400">127 games synced automatically</div>
                </div>
              </div>
            </div>
            <div className="order-1 space-y-6 lg:order-2">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
                <IntegrationsIcon className="mr-2 h-4 w-4" />
                <span>Smart Integrations</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Seamless Data Sync
              </h2>
              <p className="text-lg leading-8 text-gray-400">
                Connect your favorite sports technology and equipment directly to LeagueSports. Our integrations automatically sync data from Trackman, Autodarts, and other leading systems, eliminating manual data entry and ensuring your performance metrics are always up to date.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatic data synchronization from connected devices</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Support for Trackman, Autodarts, and more</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Real-time updates without manual input</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Secure API connections with industry-leading encryption</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold sm:text-5xl">Ready to Elevate Your Game?</h2>
          <p className="mt-4 text-lg text-gray-400">
            Start a padel scorecard or log in to see locked results on your hub.
            Golf rounds lock the same way.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/padel/new"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10">Play now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link
              href="/login"
              className="group inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
            >
              Log in
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
