import { PreferencesClient } from "@/app/roadmap/preferences/PreferencesClient";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Roadmap email preferences",
  description: "Manage which roadmap features we email you about.",
};

export default function RoadmapPreferencesPage() {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Roadmap
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Email preferences
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Stop watching a feature, or unsubscribe from all roadmap emails.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Suspense
          fallback={
            <p className="text-sm text-zinc-500">Loading your watching list…</p>
          }
        >
          <PreferencesClient />
        </Suspense>
      </section>
    </div>
  );
}
