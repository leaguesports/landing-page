import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prediction pools",
  description:
    "Create a friends tip pool from any fixture page, then share the join link on WhatsApp. No money — just bragging rights.",
};

export default function PredictionPoolsPage() {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Prediction pools
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
          Friends tip pools
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
          Pools start on a fixture page at{" "}
          <span className="text-zinc-300">/events/[slug]</span>. Create one,
          then share the join link on WhatsApp — friends open{" "}
          <span className="text-zinc-300">/pools/{"{code}"}</span> to tip. No
          money, just bragging rights before kickoff.
        </p>
        <Link
          href="/events"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-sky-400 hover:text-white"
        >
          Browse fixtures
        </Link>
      </div>
    </div>
  );
}
