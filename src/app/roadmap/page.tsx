import { RoadmapBoard } from "@/app/roadmap/_components/RoadmapBoard";
import {
  listRoadmapFeatures,
  listRoadmapRequests,
} from "@/lib/roadmap/roadmap";
import { Milestone } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Vote for what would make you join LeagueSports — we'll email you when it ships.",
};

export default async function RoadmapPage() {
  const cookie = (await cookies()).toString();
  const [featuresResult, requestsResult] = await Promise.all([
    listRoadmapFeatures({}, { cookie }),
    listRoadmapRequests({ cookie }),
  ]);

  const loadError = featuresResult.ok ? null : featuresResult.error;

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Milestone className="h-3.5 w-3.5" aria-hidden />
            Roadmap
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Roadmap
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Vote for what would make you join — we&apos;ll email you when it
            ships.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <RoadmapBoard
          initialFeatures={featuresResult.ok ? featuresResult.value : []}
          initialRequests={requestsResult.ok ? requestsResult.value : []}
          loadError={loadError}
        />
      </section>
    </div>
  );
}
