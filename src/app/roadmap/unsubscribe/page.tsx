import { redirect } from "next/navigation";

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function RoadmapUnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const params = await searchParams;
  const raw = params.token;
  const token = Array.isArray(raw) ? raw[0] : raw;
  const target = token
    ? `/roadmap/preferences?token=${encodeURIComponent(token)}`
    : "/roadmap/preferences";
  redirect(target);
}
