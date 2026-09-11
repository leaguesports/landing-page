import {
  generateIntentMetadata,
  IntentSeoPage,
} from "@/components/intent/IntentSeoPage";
import { PlayHubChrome } from "@/components/play/PlayHubChrome";
import { PlaySportDashboard } from "@/components/play/PlaySportDashboard";
import { SPORT_CATALOG } from "@/lib/sports/catalog";
import { isHubPlayDashboardSport } from "@/lib/sports/hub-ia";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PlayRouteParams = { route: string[] };

function dashboardSport(route: string[] | undefined) {
  if (!route || route.length !== 1) return null;
  const slug = route[0]?.trim().toLowerCase() ?? "";
  if (!isHubPlayDashboardSport(slug)) return null;
  return SPORT_CATALOG.find((sport) => sport.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PlayRouteParams>;
}): Promise<Metadata> {
  const { route } = await params;
  const sport = dashboardSport(route);
  if (sport) {
    return {
      title: `Play ${sport.name}`,
      description: `Start, capture, or play ${sport.name.toLowerCase()} with others.`,
      robots: { index: false, follow: false },
    };
  }
  return generateIntentMetadata("play", route);
}

export default async function PlayRoutePage({
  params,
}: {
  params: Promise<PlayRouteParams>;
}) {
  const { route } = await params;
  const sport = dashboardSport(route);
  if (sport) {
    return (
      <PlayHubChrome>
        <PlaySportDashboard sport={sport} />
      </PlayHubChrome>
    );
  }
  if (route.length === 1 && isHubPlayDashboardSport(route[0] ?? "")) {
    notFound();
  }
  return <IntentSeoPage intent="play" route={route} />;
}
