import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { scorecardStartHref } from "@/lib/scorecard/start-href";

export const metadata: Metadata = {
  title: "Start a scorecard | LeagueSports",
  description:
    "Open a live padel or golf scorecard. Share this link from a venue QR code or WhatsApp.",
  robots: { index: false, follow: false },
};

/**
 * Stable public start URL for venue QR / WhatsApp (#116).
 * Guest-friendly: no account required. Venue and sport are optional.
 */
export default async function ScorecardStartPage({
  searchParams,
}: {
  searchParams: Promise<{
    venue?: string | string[];
    cmsId?: string | string[];
    sport?: string | string[];
  }>;
}) {
  const params = await searchParams;
  redirect(
    scorecardStartHref({
      venue: params.venue,
      cmsId: params.cmsId,
      sport: params.sport,
    }),
  );
}
