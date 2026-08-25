"use client";

import type { PadelRuleset } from "@/types/padel-match";

type RulesToggleProps = {
  value: PadelRuleset;
  onChange: (value: PadelRuleset) => void;
};

const OPTIONS: { id: PadelRuleset; title: string; blurb: string }[] = [
  {
    id: "golden_point",
    title: "Golden Point",
    blurb: "Punto de Oro — sudden death at deuce",
  },
  {
    id: "advantage",
    title: "Advantage",
    blurb: "Classic deuce — win by two points",
  },
];

export function RulesToggle({ value, onChange }: RulesToggleProps) {
  return (
    <div
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      role="radiogroup"
      aria-label="Scoring rules"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={[
              "rounded-2xl border px-4 py-3.5 text-left transition-colors",
              active
                ? "border-emerald-400/50 bg-emerald-400/10"
                : "border-white/8 bg-[#141814] hover:border-white/16",
            ].join(" ")}
          >
            <span className="block text-sm font-semibold text-white">
              {opt.title}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-zinc-500">
              {opt.blurb}
            </span>
          </button>
        );
      })}
    </div>
  );
}
