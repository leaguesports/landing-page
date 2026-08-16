import type { Metadata } from "next";
import CreatePoolForm from "@/app/pools/_components/CreatePoolForm";

export const metadata: Metadata = {
  title: "Create Prediction Pool",
  description:
    "Create a private match prediction pool and share it with friends on LeagueSports.",
};

export default function CreatePoolPage() {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Prediction pools
          </p>
          <h1 className="font-display mt-2 text-4xl tracking-wide text-white sm:text-5xl">
            Create a pool
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            No login needed — pick your name, set up a match, and share the link
            with friends.
          </p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <CreatePoolForm />
        </div>
      </div>
    </div>
  );
}
