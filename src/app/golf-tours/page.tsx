import { GolfToursMine } from "@/components/golf-tours/GolfToursMine";
import {
  GOLF_TOURS_NEW_HREF,
  listMyGolfTours,
} from "@/lib/golf-tours/golf-tours";
import { HUB_ORGANISE_HUB_HREF } from "@/lib/sports/hub-ia";
import { Flag } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Golf tours",
  description:
    "Multi-day multi-course camp events. Host fourballs on existing golf scorecards and rank camps by average gross.",
};

export default async function GolfToursPage() {
  const cookie = (await cookies()).toString();
  const tours = await listMyGolfTours({ cookie });

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Link
            href={HUB_ORGANISE_HUB_HREF}
            className="mb-5 block w-fit text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Organise
          </Link>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Flag className="h-3.5 w-3.5" aria-hidden />
            Golf tours
          </p>
          <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl">
            Camps. Courses. Fourballs.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Multi-day friend events across golf courses. Add a roster and
            standing fourballs once, then start each group on the live
            scorecard. The leaderboard is average gross on locked, non-sit-out
            cards.
          </p>
          <Link
            href={GOLF_TOURS_NEW_HREF}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            New golf tour
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <GolfToursMine tours={tours} />
      </section>
    </div>
  );
}
