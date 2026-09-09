import { CreateGolfTourForm } from "@/components/golf-tours/CreateGolfTourForm";
import { GOLF_TOURS_HREF } from "@/lib/golf-tours/golf-tours";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New golf tour",
  description:
    "Create a multi-day golf tour with Camp A and Camp B, then add rounds and fourballs.",
  robots: { index: false, follow: false },
};

export default function NewGolfTourPage() {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto min-w-0 max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href={GOLF_TOURS_HREF}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Golf tours
        </Link>
        <header className="mt-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Organise
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
            New golf tour
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
            Name the event and pick dates. Two camps (teams) are created for
            you — rename them, add courses, then add fourballs.
          </p>
        </header>
        <CreateGolfTourForm />
      </div>
    </div>
  );
}
