import { HomeDiscovery } from "@/components/home/HomeDiscovery";
import { OpenMatchFeed } from "@/components/home/OpenMatchFeed";
import { PoolsCtaBanner } from "@/components/home/PoolsCtaBanner";
import { urlFor } from "@/sanity/client";
import {
  Calendar,
  ChevronRight,
  Flag,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTopGuides, Guide } from "./guides/[[...route]]/actions";

function SectionBadge({
  label,
  color,
}: {
  label: string;
  color: "blue" | "green" | "red";
}) {
  const bg = { blue: "bg-blue-600", green: "bg-green-600", red: "bg-red-600" }[
    color
  ];
  return (
    <div className={`${bg} inline-block px-6 py-1.5 transform -skew-x-6 mb-3`}>
      <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
        {label}
      </h2>
    </div>
  );
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group block bg-zinc-900 overflow-hidden hover:bg-zinc-800/80 transition-colors duration-200 rounded-sm border-b border-zinc-600"
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-800">
        {guide.mainImage ? (
          <Image
            src={urlFor(guide.mainImage)?.url() ?? ""}
            alt={guide.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2">
        <h3 className="text-sm sm:text-base min-h-[2.5rem] sm:min-h-[3.5rem] leading-snug text-white drop-shadow-lg font-black uppercase">
          {guide.title}
        </h3>
      </div>
    </Link>
  );
}

export default async function Home() {
  const topGuides = await getTopGuides();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <HomeDiscovery />

      <OpenMatchFeed />

      <PoolsCtaBanner />

      {/* Stats */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                value: "500+",
                label: "Watch Venues",
                color: "text-blue-500",
                borderColor: "border-blue-600/30",
              },
              {
                value: "200+",
                label: "Play Venues",
                color: "text-green-500",
                borderColor: "border-green-600/30",
              },
              {
                value: "1,200+",
                label: "Events / Year",
                color: "text-red-500",
                borderColor: "border-red-600/30",
              },
              {
                value: "10K+",
                label: "Active Players",
                color: "text-zinc-400",
                borderColor: "border-zinc-600/30",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-lg border ${stat.borderColor} bg-zinc-950 p-4 sm:p-6 transition-colors hover:border-zinc-700`}
              >
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                  <div>
                    <p
                      className={`text-white text-xl sm:text-2xl font-black italic leading-none ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 sm:mb-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
              <div>
                <SectionBadge label="Top Guides" color="red" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1 sm:mt-0 sm:ml-4">
                  Top guides for your sports
                </p>
              </div>
              <Link
                href="/guides"
                className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-300 transition-colors flex items-center gap-1 shrink-0 min-h-10"
              >
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-8">
              {topGuides.map((guide) => (
                <GuideCard key={guide._id} guide={guide} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-linear-to-r from-green-950/30 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-green-600 via-green-400 to-transparent" />

        <div className="mx-auto max-w-7xl relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <Flag className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-green-500" />
                <span className="text-green-400 text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                  LeagueSports
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-2 sm:mb-3">
                Find Your <span className="text-green-400">Game</span>
              </h2>
              <p className="text-zinc-500 font-bold text-xs sm:text-sm max-w-md">
                Discover venues, join open matches, and connect with players in
                your area.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full sm:w-auto sm:shrink-0">
              <Link
                href="/venues"
                className="inline-flex min-h-12 items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 font-black uppercase italic tracking-wider text-xs sm:text-sm bg-green-600 text-white hover:bg-green-500 transition-colors rounded-lg"
              >
                <Zap className="w-4 h-4 shrink-0" />
                Explore Venues
              </Link>
              <Link
                href="/watch"
                className="inline-flex min-h-12 items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 font-black uppercase italic tracking-wider text-xs sm:text-sm border border-zinc-700 text-zinc-400 hover:border-green-600 hover:text-green-400 transition-colors rounded-lg"
              >
                <Users className="w-4 h-4 shrink-0" />
                Browse Watch Directory
              </Link>
              <Link
                href="/play"
                className="inline-flex min-h-12 items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 font-black uppercase italic tracking-wider text-xs sm:text-sm border border-zinc-700 text-zinc-400 hover:border-green-600 hover:text-green-400 transition-colors rounded-lg"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                Browse Play Directory
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
