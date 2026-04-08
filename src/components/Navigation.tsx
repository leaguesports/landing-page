"use client";

import HomeLink from "@/components/HomeLink";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

function Dropdown({ title, children }: { title: string; children: React.ReactNode }) {
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
        {title}
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
              {title}
            </p>
          </div>
          <div className="p-2">
            {children}
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
        <div className="flex h-16 items-center justify-between gap-4 w-full">
          {/* Logo */}
          <HomeLink />

          <div className="flex gap-4 w-48">
            <Link
              href="/watch"
              className="text-md font-medium text-gray-300 transition-colors hover:text-green-400"
            >
              Watch
            </Link>
            <Link
              href="/play"
              className="text-md font-medium text-gray-300 transition-colors hover:text-green-400"
            >
              Play
            </Link>
          </div>

          <Link
            href="/login"
            className="text-md font-medium text-gray-300 transition-colors hover:text-green-400"
          >
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}
