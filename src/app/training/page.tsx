import { TrainingPanel } from "@/components/home/TrainingPanel";
import { getServerAuthState } from "@/lib/server-auth";
import { emptyTrainingSnapshot, listTrainingPlans } from "@/lib/training/training";
import { Dumbbell } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Training",
  description:
    "Start a curated padel training plan — Accuracy Focus, Consistency Builder, or Match Intensity.",
};

export default async function TrainingPage() {
  const auth = await getServerAuthState();
  const cookie = (await cookies()).toString();
  const snapshot =
    auth.isAuthenticated && auth.user?.id
      ? await listTrainingPlans({ cookie })
      : emptyTrainingSnapshot();

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Dumbbell className="h-3.5 w-3.5" aria-hidden />
            Custom Training
          </p>
          <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
            Train padel with a plan.{" "}
            <span className="text-emerald-400">Finish the session.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Curated padel plans from the API — start Accuracy Focus, mark drills
            done, and keep completed sessions in history.
          </p>
          {auth.isAuthenticated ? (
            <Link
              href="/"
              className="mt-6 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
            >
              Back to hub
            </Link>
          ) : null}
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <TrainingPanel
            initial={snapshot}
            guest={!auth.isAuthenticated}
            showHeading={false}
            className="mt-0"
          />
        </div>
      </section>
    </div>
  );
}
