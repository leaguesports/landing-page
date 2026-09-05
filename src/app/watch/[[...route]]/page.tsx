import {
  generateIntentMetadata,
  IntentSeoPage,
} from "@/components/intent/IntentSeoPage";
import type { Metadata } from "next";

type WatchPageParams = { route?: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<WatchPageParams>;
}): Promise<Metadata> {
  const { route } = await params;
  return generateIntentMetadata("watch", route);
}

export default async function WatchPage({
  params,
}: {
  params: Promise<WatchPageParams>;
}) {
  const { route } = await params;
  return <IntentSeoPage intent="watch" route={route} />;
}
