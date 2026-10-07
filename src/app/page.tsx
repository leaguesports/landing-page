import { HomeAthleteCta } from "@/components/home/HomeAthleteCta";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { HomeDiscovery } from "@/components/home/HomeDiscovery";
import { HomeFeaturedVenues } from "@/components/home/HomeFeaturedVenues";
import { HomeValueSections } from "@/components/home/HomeValueSections";
import { hasSportIcon, SportIcon } from "@/components/icons/sports";
import { GUIDE_SPORTS, type GuideSport } from "@/lib/guides/presentation";
import { buildHomeJsonLd } from "@/lib/home/homeJsonLd";
import { getServerAuthState } from "@/lib/server-auth";
import { safeSanityImageUrl } from "@/lib/sanity-image";
import { getUpcomingFixtures } from "@/services/events";
import { getFeaturedHomeVenues } from "@/services/venueHub";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

const guideChipClassName =
  "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300";

function guideCardLabels(guide: Guide): {
  intent: "play" | "watch" | null;
  sports: GuideSport[];
} {
  const haystack = [guide.slug, guide.title].filter(Boolean).join(" ").toLowerCase();
  const sports = GUIDE_SPORTS.filter((sport) => haystack.includes(sport));
  const playHit = /\b(play|court|course|padel|golf|darts|book)\b/.test(haystack);
  const watchHit = /\b(watch|screening|fixture|broadcast|bars?)\b/.test(haystack);
  let intent: "play" | "watch" | null = null;
  if (playHit && !watchHit) intent = "play";
  else if (watchHit && !playHit) intent = "watch";
  else if (playHit && watchHit) {
    intent = /\b(watch|screening|broadcast)\b/.test(haystack) ? "watch" : "play";
  }
  return { intent, sports };
}

function GuideCard({ guide }: { guide: Guide }) {
  if (!isGuideSlug(guide.slug)) return null;

  const imageUrl = safeSanityImageUrl(guide.mainImage);
  const { intent, sports } = guideCardLabels(guide);

  return (
    <Link
      href={guideHref(guide.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141814] transition-colors hover:border-white/30"
    >
      <span className="relative block aspect-[16/10] bg-zinc-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 82vw, 22rem"
          />
        ) : null}
      </span>
      <span className="flex flex-1 flex-col p-5">
        <span className="line-clamp-3 font-display text-2xl leading-none tracking-wide text-white">
          {guide.title}
        </span>
        {intent || sports.length > 0 ? (
          <span className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {intent ? (
              <span className={guideChipClassName}>
                {intent === "watch" ? "Watch" : "Play"}
              </span>
            ) : null}
            {sports.map((sport) => (
              <span key={sport} className={guideChipClassName}>
                {hasSportIcon(sport) ? (
                  <SportIcon sportSlug={sport} size={14} color="currentColor" />
                ) : null}
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

async function MarketingHome() {
  const [topGuides, upcomingFixtures, featuredVenues] = await Promise.all([
    getTopGuides(),
    getUpcomingFixtures({ limit: 24 }),
    getFeaturedHomeVenues(),
  ]);

  const jsonLd = buildHomeJsonLd(CANONICAL_SITE_URL);

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeDiscovery />

      <HomeValueSections fixtures={upcomingFixtures} />

      <HomeFeaturedVenues venues={featuredVenues} />

      <HomeAthleteCta />

      <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Editorial
              </p>
              <h2 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
                Top guides
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Local tips for fans and players across South Africa.
              </p>
            </div>
            <Link
              href="/guides"
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              All guides
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {topGuides.map((guide) => (
              <li
                key={guide._id}
                className="w-[82%] shrink-0 snap-start sm:w-[22rem] lg:w-[calc((100%-2rem)/3.15)]"
              >
                <GuideCard guide={guide} />
              </li>
            ))}
          </ul>
        </div>
      </section>

    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const auth = await getServerAuthState();
  const params = await searchParams;
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  if (tabParam?.trim().toLowerCase() === "play") {
    redirect("/play");
  }

  if (auth.isAuthenticated && auth.user?.id) {
    const cookie = (await cookies()).toString();
    return (
      <HomeDashboard
        user={auth.user}
        cookie={cookie}
        initialTab={tabParam}
      />
    );
  }

  return <MarketingHome />;
}
