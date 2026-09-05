import {
  generateIntentMetadata,
  IntentSeoPage,
} from "@/components/intent/IntentSeoPage";
import type { Metadata } from "next";

type PlayPageParams = { route?: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<PlayPageParams>;
}): Promise<Metadata> {
  const { route } = await params;
  return generateIntentMetadata("play", route);
}

export default async function PlayPage({
  params,
}: {
  params: Promise<PlayPageParams>;
}) {
  const { route } = await params;
  return <IntentSeoPage intent="play" route={route} />;
}
