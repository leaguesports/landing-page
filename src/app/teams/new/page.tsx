import { CreateTeamForm } from "@/components/teams/CreateTeamForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create a team",
  description: "Start a padel, golf, or darts team and invite friends.",
};

export default function NewTeamPage() {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/teams"
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Teams
        </Link>
        <div className="mt-6">
          <CreateTeamForm />
        </div>
      </div>
    </div>
  );
}
