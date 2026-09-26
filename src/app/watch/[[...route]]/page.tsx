import {
  generateIntentMetadata,
  IntentSeoPage,
} from "@/components/intent/IntentSeoPage";
import type { Metadata } from "next";

type WatchPageParams = { route?: string[] };
type WatchSearchParams = { fixture?: string | string[] };

function firstParam(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim() ?? "";
  return trimmed || null;
}

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
  searchParams,
}: {
  params: Promise<WatchPageParams>;
  searchParams?: Promise<WatchSearchParams>;
}) {
  const { route } = await params;
  const query = searchParams ? await searchParams : {};
  return (
    <IntentSeoPage
      intent="watch"
      route={route}
      initialFixture={firstParam(query.fixture)}
    />
  );
}
