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

const features = [
  {
    id: "scorecards",
    title: "Digital Scorecards",
    description: "Track every game with intuitive digital scorecards. Never lose a score again.",
    Icon: ScorecardIcon,
  },
  {
    id: "progress",
    title: "Progress Tracking",
    description: "Watch your skills improve with detailed analytics, performance trends, and insights.",
    Icon: ProgressIcon,
  },
  {
    id: "badges",
    title: "Achievement Badges",
    description: "Unlock badges and achievements as you reach milestones and improve your game.",
    Icon: BadgeIcon,
  },
  {
    id: "training",
    title: "Custom Training",
    description: "Design personalized training routines tailored to your specific goals.",
    Icon: TrainingIcon,
  },
  {
    id: "communities",
    title: "Communities",
    description: "Connect with like-minded players, join local clubs, and build your network.",
    Icon: CommunitiesIcon,
  },
  {
    id: "integrations",
    title: "Smart Integrations",
    description: "Seamlessly connect with Trackman, Autodarts, and other systems for automatic data sync.",
    Icon: IntegrationsIcon,
  },
];

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
        // Mark the oldest (first) notification as exiting
        if (prev.length > 0) {
          setExitingIndex(prev[0]);
          // Remove it after animation
          setTimeout(() => setExitingIndex(null), 600);
        }
        
        // Add new notification to the end (bottom)
        const newQueue = [...prev, nextIndex];
        // Keep only the last 2 (FIFO - remove oldest if more than 2)
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
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  <span className="block">Better Sports</span>
                  <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                    Tracking
                  </span>
                </h1>
                <p className="mt-8 text-xl leading-8 text-gray-400 sm:text-2xl">
                  Everything you need to track, improve, and share your sporting journey. All connected, all in one place.
                </p>
              </div>

              {/* CTA Button */}
              <div>
                <Link
                  href="/signup"
                  className="group relative inline-block overflow-hidden rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  <span className="relative z-10">Sign Up Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </div>
            </div>

            {/* Right Side - Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end lg:-ml-4">
              <div className="relative" style={{ perspective: "1000px" }}>
                {/* Phone Container with 3D Transform */}
                <div
                  className="relative transition-transform duration-300"
                  style={{
                    transform: "rotateY(-15deg) rotateX(5deg) translateZ(0)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Shadow Layer - Multiple for depth */}
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

                  {/* Phone Frame */}
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
                    {/* Subtle top highlight */}
                    <div className="absolute top-0 left-0 right-0 h-12 rounded-t-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    
                    {/* Frame inner border */}
                    <div className="absolute inset-1.5 rounded-[2rem] border border-white/5" />
                    {/* Volume Buttons */}
                    <div className="absolute -left-1.5 top-32 h-10 w-0.5 rounded-l bg-gray-700/80" />
                    <div className="absolute -left-1.5 top-46 h-10 w-0.5 rounded-l bg-gray-700/80" />
                    
                    {/* Power Button */}
                    <div className="absolute -right-1.5 top-40 h-14 w-0.5 rounded-r bg-gray-700/80" />

                    {/* Notch */}
                    <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
                      <div className="relative h-6 w-28 rounded-b-2xl bg-gray-800">
                        {/* Speaker */}
                        <div className="absolute left-1/2 top-1.5 h-0.5 w-12 -translate-x-1/2 rounded-full bg-gray-600/60" />
                        {/* Camera */}
                        <div className="absolute right-3 top-1.5 h-1.5 w-1.5 rounded-full bg-gray-700" />
                      </div>
                    </div>

                    {/* Screen with Bezel */}
                    <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-black">
                      {/* Subtle screen border */}
                      <div className="absolute inset-0 rounded-[2rem] ring-[0.5px] ring-white/5" />
                      
                      {/* Toast Notifications */}
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
                      
                      {/* Status Bar */}
                      <div className="flex items-center justify-between px-6 pt-3 text-xs text-white">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-white" />
                          <div className="h-1 w-1 rounded-full bg-white" />
                          <div className="h-1 w-1 rounded-full bg-white" />
                          <div className="h-1 w-1 rounded-full bg-white" />
                        </div>
                      </div>

                      {/* Player Profile Dashboard */}
                      <div className="h-[calc(100%-3rem)] overflow-y-auto px-6 py-4">
                        {/* Profile Header */}
                        <div className="mb-6 text-center">
                          <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg" />
                          <h3 className="text-xl font-bold">Alex Johnson</h3>
                          <p className="text-sm text-gray-400">@alexj_sports</p>
                        </div>

                        {/* Stats Grid */}
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

                        {/* Sports Interests */}
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

                        {/* Recent Activity */}
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
                                    className={`text-sm font-semibold ${
                                      activity.result === "Win" ? "text-green-400" : "text-red-400"
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

      {/* Features Grid Section */}
      <section className="border-b border-white/10 bg-[#0f0f0f] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Everything You Need
            </h2>
            <p className="mt-6 text-lg text-gray-400">
              Comprehensive tools to elevate your game
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                  <feature.Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-16 text-center">
            <Link
              href="/signup"
              className="group relative inline-block overflow-hidden rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10">Sign Up Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-gray-400">
            Join thousands of players already using LeagueSports to elevate their game
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/signup"
              className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link
              href="/"
              className="group rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
            >
              Back to Home
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
