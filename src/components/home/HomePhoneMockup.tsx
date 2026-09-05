"use client";

import { useEffect, useState } from "react";

const TOASTS = [
  {
    id: "locked",
    title: "Match locked",
    message: "6–4, 6–3 saved to your hub",
    time: "Just now",
  },
  {
    id: "venue",
    title: "Court booked",
    message: "Green Point · Court 3 at 18:00",
    time: "2m ago",
  },
  {
    id: "watch",
    title: "Screening nearby",
    message: "Chiefs vs Pirates · 4 venues",
    time: "5m ago",
  },
];

/** Athletes-style device frame with a live padel scorecard. */
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
    <div className={`relative mx-auto w-[min(100%,18.5rem)] ${className}`} aria-hidden>
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
                <span className="shrink-0 text-[10px] text-zinc-500">{toast.time}</span>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Live · Padel
                </p>
                <p className="mt-1 text-sm font-medium text-white">Court 3 · Green Point</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                Set 2
              </span>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-emerald-400 px-3 py-4 text-zinc-950">
                <p className="text-[11px] font-medium opacity-70">You & Sam</p>
                <p className="mt-1 font-display text-4xl tracking-wide">6</p>
              </div>
              <div className="rounded-2xl bg-white/8 px-3 py-4">
                <p className="text-[11px] text-zinc-400">Alex & Jordan</p>
                <p className="mt-1 font-display text-4xl tracking-wide text-zinc-300">4</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Point</span>
                <span className="font-display text-base tracking-wide text-emerald-300">
                  40 — 30
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className="h-full w-[62%] rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Games", "Rating", "Badges"].map((label, i) => (
                <div
                  key={label}
                  className="rounded-xl bg-white/5 px-2 py-3 text-center"
                >
                  <p className="font-display text-xl tracking-wide text-white">
                    {[12, "4.8", 7][i]}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
