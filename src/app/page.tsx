import { HomeAthleteCta } from "@/components/home/HomeAthleteCta";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { HomeDiscovery } from "@/components/home/HomeDiscovery";
import { HomeUpcomingEvents } from "@/components/home/HomeUpcomingEvents";
import { HomeValueSections } from "@/components/home/HomeValueSections";
import { buildHomeJsonLd } from "@/lib/home/homeJsonLd";
import { formatStat } from "@/lib/format-stat";
import { getServerAuthState } from "@/lib/server-auth";
import { safeSanityImageUrl } from "@/lib/sanity-image";
import { selectFeaturedFixture } from "@/lib/sports/events-feed";
import { getUpcomingFixtures } from "@/services/events";
import { getHomepageStats } from "@/services/homepageStats";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { guideHref, isGuideSlug } from "@/lib/guides/slugs";
import { getTopGuides, Guide } from "./guides/[[...route]]/actions";

/** Same production fallback as root metadataBase — never VERCEL_URL. */
const CANONICAL_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://leaguesports.co.za";

export const metadata: Metadata = {
  title: {
    absolute: "LeagueSports | Watch, play & track sport in South Africa",
  },
  description:
    "Find where to watch fixtures, book courts to play, and lock live scorecards — across soccer, rugby, padel, golf, and more in South Africa.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LeagueSports | Watch, play & track sport in South Africa",
    description:
      "Watch venues, play courts, and live scorecards across South Africa.",
    url: "/",
    siteName: "LeagueSports",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeagueSports | Watch, play & track sport in South Africa",
    description:
      "Watch venues, play courts, and live scorecards across South Africa.",
  },
  keywords: [
    "sports venues South Africa",
    "where to watch soccer",
    "padel scorecard",
    "golf scorecard",
    "padel courts Cape Town",
    "sports bars Johannesburg",
    "darts bar Cape Town",
    "pool table near me",
    "bowling Johannesburg",
    "indoor golf Cape Town",
    "sim racing South Africa",
    "LeagueSports",
  ],
};

function GuideCard({ guide }: { guide: Guide }) {
  if (!isGuideSlug(guide.slug)) return null;

  const imageUrl = safeSanityImageUrl(guide.mainImage);

  return (
    <Link
      href={guideHref(guide.slug)}
      className="group block overflow-hidden rounded-3xl border border-white/8 bg-[#141814] transition-colors hover:border-white/16"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={guide.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <div className="h-full w-full bg-zinc-800" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#141814] via-transparent to-transparent" />
      </div>

      <div className="px-4 py-4 sm:px-5">
        <h3 className="text-[15px] font-medium leading-snug text-white group-hover:text-[var(--color-brand)]">
          {guide.title}
        </h3>
      </div>
    </Link>
  );
}
