"use client";

import { golfTourOutlineButtonClass } from "@/components/golf-tours/GolfTourPlayerSlots";
import {
  dismissGolfTourHowItWorks,
  isGolfTourHowItWorksDismissed,
} from "@/lib/golf-tours/golf-tours";
import { useState, useSyncExternalStore } from "react";

const STEPS = [
  "Add players to each camp roster once.",
  "Build standing fourballs (up to 4, tagged to a camp). They repeat every round.",
  "Add a round — date and course. Groups are prepared for you.",
  "Open the scorecard when the group is ready. Sit someone out without rebuilding pairings.",
] as const;

function subscribeHowItWorks(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function GolfTourHowItWorks() {
  const storedDismissed = useSyncExternalStore(
    subscribeHowItWorks,
    isGolfTourHowItWorksDismissed,
    () => true,
  );
  const [dismissedHere, setDismissedHere] = useState(false);

  if (storedDismissed || dismissedHere) return null;

  return (
    <section
      aria-labelledby="golf-tour-how-it-works"
      className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="golf-tour-how-it-works"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"
          >
            How it works
          </h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <button
          type="button"
          onClick={() => {
            dismissGolfTourHowItWorks();
            setDismissedHere(true);
          }}
          className={golfTourOutlineButtonClass("shrink-0")}
        >
          Got it
        </button>
      </div>
    </section>
  );
}
