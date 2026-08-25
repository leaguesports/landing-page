import type { Metadata } from "next";
import Link from "next/link";
import { PadelQuickStart } from "@/components/padel/PadelQuickStart";
import {
  isPadelVenue,
  toVenueOption,
} from "@/lib/padel/venue-options";
import { listVenues } from "@/services/venues";

export const metadata: Metadata = {
  title: "New Padel Match | LeagueSports",
  description: "Quick-start a live padel match with court-side scoring.",
  robots: { index: false, follow: false },
};

export default async function NewPadelMatchPage() {
  const all = await listVenues();
  const options = all.map(toVenueOption);
  const padelFirst = [
    ...options.filter(isPadelVenue),
    ...options.filter((v) => !isPadelVenue(v)),
  ];

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/play/padel"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Play padel
          </Link>
          <span className="font-display text-lg tracking-wide text-white">
            LEAGUE<span className="text-[var(--color-brand)]">SPORTS</span>
          </span>
        </div>
      </div>
      <PadelQuickStart venues={padelFirst} />
    </main>
  );
}
