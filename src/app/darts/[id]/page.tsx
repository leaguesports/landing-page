import type { Metadata } from "next";
import { headers } from "next/headers";
import { DartsScorecardClientLoader } from "@/components/darts/DartsScorecardClientLoader";
import { lookupDartsMatch } from "@/lib/darts/lookup-match";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Darts 501 · ${id} | LeagueSports`,
    robots: { index: false, follow: false },
  };
}

export default async function DartsGamePage({ params }: PageProps) {
  const { id } = await params;
  const cookie = (await headers()).get("cookie") ?? undefined;
  const match = await lookupDartsMatch(id, { cookie });

  return (
    <div className="min-h-dvh bg-[#050705]">
      <DartsScorecardClientLoader matchId={id} initialMatch={match} />
    </div>
  );
}
