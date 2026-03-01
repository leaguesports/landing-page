"use client";

import Link from "next/link";
import HomeLink from "@/components/HomeLink";
import { Tv, Trophy, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

function VenuesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [open, close]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-md font-medium transition-colors hover:text-green-400 focus:outline-none ${open ? "text-green-400" : "text-gray-300"}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Venues
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180 text-green-400" : "text-gray-500"}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f]/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Venues
            </p>
          </div>
          <div className="p-2">
            <Link
              href="/play"
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-green-500/10 hover:text-green-300"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-green-500/30 bg-green-500/10">
                <Trophy className="h-3.5 w-3.5 text-green-400" strokeWidth={2} />
              </div>
              <div>
                <div className="font-bold">Play</div>
                <div className="text-[11px] text-gray-500">Courts &amp; clubs</div>
              </div>
            </Link>
            <Link
              href="/venues"
              onClick={close}
              className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-blue-500/10 hover:text-blue-300"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10">
                <Tv className="h-3.5 w-3.5 text-blue-400" strokeWidth={2} />
              </div>
              <div>
                <div className="font-bold">Watch</div>
                <div className="text-[11px] text-gray-500">Bars &amp; fan zones</div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-[#0f0f0f]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <HomeLink />

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/discover"
              className="text-md font-medium text-gray-300 transition-colors hover:text-green-400"
            >
              Discover
            </Link>
            <Link
              href="/sports"
              className="text-md font-medium text-gray-300 transition-colors hover:text-green-400"
            >
              Sports
            </Link>
            <VenuesDropdown />
            <Link
              href="/events"
              className="text-md font-medium text-gray-300 transition-colors hover:text-green-400"
            >
              Events
            </Link>
          </div>
          <div></div>
        </div>
      </div>
    </nav>
  );
}
