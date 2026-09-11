import {
  generateIntentMetadata,
  IntentSeoPage,
} from "@/components/intent/IntentSeoPage";
import { isHubPlayDashboardSport } from "@/lib/sports/hub-ia";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PlayRouteParams = { route: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<PlayRouteParams>;
}): Promise<Metadata> {
  const { route } = await params;
  if (route.length === 1 && isHubPlayDashboardSport(route[0] ?? "")) {
    return { title: "Play", robots: { index: false, follow: false } };
  }
  return generateIntentMetadata("play", route);
}

export default async function PlaySeoRoutePage({
  params,
}: {
  params: Promise<PlayRouteParams>;
}) {
  const { route } = await params;
  // Dedicated /play/{padel,golf,darts} pages own those dashboards.
  if (route.length === 1 && isHubPlayDashboardSport(route[0] ?? "")) {
    notFound();
  }
  return <IntentSeoPage intent="play" route={route} />;
}
