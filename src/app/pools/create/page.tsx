import type { Metadata } from "next";
import CreatePoolForm from "@/app/pools/_components/CreatePoolForm";

export const metadata: Metadata = {
  title: "Create Prediction Pool",
  description:
    "Create a private match prediction pool and share it with friends on LeagueSports.",
};

export default function CreatePoolPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-green-700 via-green-500 to-green-700" />
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Prediction pools
          </p>
          <h1 className="mt-1 text-3xl font-black italic uppercase tracking-tighter text-white">
            Create a pool
          </h1>
          <p className="mt-2 text-zinc-400">
            No login needed — pick your name, set up a match, and share the link with friends.
          </p>
        </div>
        <CreatePoolForm />
      </div>
    </div>
  );
}
