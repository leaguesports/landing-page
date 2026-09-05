"use client";

import { useEffect, useState } from "react";

const TOASTS = [
  {
    id: "locked",
    title: "Match locked",
    message: "Padel · 6–4, 6–3 on your hub",
    time: "Just now",
  },
  {
    id: "watch",
    title: "Screening nearby",
    message: "Chiefs vs Pirates · 4 venues",
    time: "2m ago",
  },
  {
    id: "golf",
    title: "Round saved",
    message: "Randpark · 18 holes locked",
    time: "1h ago",
  },
];

/** Athletes-style device frame showing the multi-sport hub. */
export function HomePhoneMockup({ className = "" }: { className?: string }) {
  const [toastIndex, setToastIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setToastIndex((prev) => (prev + 1) % TOASTS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  const toast = TOASTS[toastIndex];

  return (
    <div
      className={`relative mx-auto w-[min(100%,18.5rem)] ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 translate-y-6 scale-110 rounded-[3rem] bg-emerald-400/10 blur-3xl" />

      <div className="relative rounded-[2.35rem] bg-zinc-800 p-1.5 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)] lg:[transform:rotateY(-8deg)_rotateX(4deg)] lg:[transform-style:preserve-3d]">
        <div className="absolute inset-1.5 rounded-[1.9rem] border border-white/5" />
        <div className="absolute -left-1 top-28 h-8 w-0.5 rounded-l bg-zinc-700" />
        <div className="absolute -left-1 top-40 h-10 w-0.5 rounded-l bg-zinc-700" />
        <div className="absolute -right-1 top-36 h-12 w-0.5 rounded-r bg-zinc-700" />

        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="h-5 w-24 rounded-b-2xl bg-zinc-800" />
        </div>

        <div className="relative overflow-hidden rounded-[1.9rem] bg-[#0a0d0a]">
          <div className="flex items-center justify-between px-5 pt-3 text-[11px] text-white">
            <span>9:41</span>
            <div className="flex gap-1">
              <span className="h-1 w-1 rounded-full bg-white" />
              <span className="h-1 w-1 rounded-full bg-white" />
              <span className="h-1 w-1 rounded-full bg-white/50" />
            </div>
          </div>

          <div className="relative px-4 pb-5 pt-4">
            <div
              key={toast.id}
              className="mb-4 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl animate-rise"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-white">{toast.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-zinc-300">
                    {toast.message}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-zinc-500">
                  {toast.time}
                </span>
              </div>
            </div>

            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-sky-500 font-display text-lg tracking-wide text-zinc-950">
                LS
              </div>
              <p className="text-sm font-semibold text-white">Your sports hub</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">Watch · Play · Score</p>
            </div>

            <div className="mb-4 flex flex-wrap justify-center gap-1.5">
              {["Padel", "Golf", "Soccer", "Rugby"].map((sport) => (
                <span
                  key={sport}
                  className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-zinc-300"
                >
                  {sport}
                </span>
              ))}
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              {[
                { value: "12", label: "Games" },
                { value: "6", label: "Venues" },
                { value: "3", label: "Sports" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white/5 px-2 py-3 text-center"
                >
                  <p className="font-display text-xl tracking-wide text-white">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Recent
              </p>
              {[
                { tag: "Play", title: "Padel locked · Green Point", tone: "text-emerald-300" },
                { tag: "Watch", title: "Stormers screening · Obs", tone: "text-sky-300" },
              ].map((row) => (
                <div
                  key={row.title}
                  className="rounded-xl border border-white/8 bg-white/4 px-3 py-2.5"
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${row.tone}`}>
                    {row.tag}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-white">{row.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
