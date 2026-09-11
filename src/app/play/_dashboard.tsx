import { PlayHubChrome } from "@/components/play/PlayHubChrome";
import { PlaySportDashboard } from "@/components/play/PlaySportDashboard";
import { SPORT_CATALOG } from "@/lib/sports/catalog";
import { isHubPlayDashboardSport } from "@/lib/sports/hub-ia";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function playDashboardMetadata(slug: string): Metadata {
  const sport = SPORT_CATALOG.find((item) => item.slug === slug);
  return {
    title: sport ? `Play ${sport.name}` : "Play",
    description: sport
      ? `Start, capture, or play ${sport.name.toLowerCase()} with others.`
      : "Pick a sport to play.",
    robots: { index: false, follow: false },
  };
}

export function PlayDashboardPage({ slug }: { slug: string }) {
  if (!isHubPlayDashboardSport(slug)) notFound();
  const sport = SPORT_CATALOG.find((item) => item.slug === slug);
  if (!sport) notFound();
  return (
    <PlayHubChrome>
      <PlaySportDashboard sport={sport} />
    </PlayHubChrome>
  );
}
