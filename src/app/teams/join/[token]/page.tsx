import { TeamJoin } from "@/components/teams/TeamJoin";
import type { Metadata } from "next";
import Link from "next/link";

type JoinTeamPageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Join team | LeagueSports",
  description: "Join a team from an invite link.",
  robots: { index: false, follow: false },
};

export default async function JoinTeamPage({ params }: JoinTeamPageProps) {
  const { token } = await params;

  return (
    <main className="min-h-dvh bg-[#0c0f0c] text-white">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href="/teams"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Teams
          </Link>
        </div>
      </div>
      <TeamJoin token={token} />
    </main>
  );
}
