"use client";

import { MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SUBURB_GROUPS, toSlug } from "@/data/suburbs";
import { useSuburb } from "@/context/SuburbContext";

export default function SuburbSelector() {
  const { suburb, setSuburb, isReady } = useSuburb();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  if (!isReady) return null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={suburb ? `Area: ${suburb}` : "Choose area"}
      >
        <MapPin className="h-4 w-4 shrink-0 text-green-400/90" aria-hidden />
        <span className="max-w-[110px] truncate sm:max-w-[130px]">
          {suburb ?? "Choose area"}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="listbox"
          aria-label="Suburbs"
          className="absolute right-0 top-full z-100 mt-2 w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f]/95 shadow-2xl shadow-black/60 backdrop-blur-xl animate-in fade-in"
          style={{
            animationDuration: "120ms",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
              Your area
            </p>
          </div>
          <div className="max-h-[min(70vh,360px)] overflow-y-auto p-3">
            <button
              type="button"
              role="option"
              aria-selected={!suburb}
              onClick={() => {
                setSuburb(null);
                close();
              }}
              className={`mb-3 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                !suburb
                  ? "bg-green-500/15 text-green-400"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              All areas
            </button>
            {SUBURB_GROUPS.map((group, i) => (
              <div
                key={group.label}
                className={i > 0 ? "mt-4 pt-4 border-t border-white/5" : ""}
              >
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {group.label}
                </p>
                <ul className="space-y-0.5" role="group">
                  {group.suburbs.map((name) => (
                    <li key={name}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={suburb === name}
                        onClick={() => {
                          setSuburb(toSlug(name));
                          close();
                        }}
                        className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          suburb === name
                            ? "bg-green-500/15 text-green-400"
                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
