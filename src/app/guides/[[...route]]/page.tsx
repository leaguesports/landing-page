import { urlFor } from "@/sanity/client";
import { Bell, Flag } from "lucide-react";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideBySlug } from "./actions";
import { guidePortableTextComponents } from "./textComponents";

export async function generateMetadata({ params }: { params: Promise<{ route: string[] }> }) {
    const guideSlug = (await params).route[0];

    if (!guideSlug) {
        return notFound();
    }

    const guide = await getGuideBySlug(guideSlug);

    if (!guide) {
        return notFound();
    }

    return {
        title: guide?.title,
        description: guide?.description,
        openGraph: {
            title: guide?.title,
            description: guide?.description,
            images: [urlFor(guide.mainImage)?.url() ?? ""],
        },
        twitter: {
            card: "summary_large_image",
            title: guide?.title,
            description: guide?.description,
            images: [urlFor(guide.mainImage)?.url() ?? ""],
        },
        alternates: {
            canonical: `/guides/${guide.slug}`,
        },
        robots: {
            index: true,
            follow: true,
        },
        keywords: [
            guide.title,
            "Guides",
            "Sports",
            "LeagueSports",
        ],
    };
}

export default async function GuidesPage(route: { params: Promise<{ route: string[] }> }) {
    const params = await route.params;
    const guideSlug = params.route[0];

    if (!guideSlug) {
        return notFound();
    }

    const guide = await getGuideBySlug(guideSlug);

    if (!guide) {
        return notFound();
    }

    return <div className="min-h-screen bg-[#0f0f0f] text-white">
        {/* Hero */}
        <section className="relative overflow-hidden min-h-[70vh] sm:min-h-[75vh] flex items-end">
            <div className="absolute inset-0 bg-linear-to-br from-red-950/60 via-[#0f0f0f] to-[#0f0f0f]" />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute h-px bg-linear-to-r from-transparent via-red-600/30 to-transparent"
                        style={{
                            top: `${10 + i * 12}%`,
                            left: "-10%",
                            right: "-10%",
                            transform: `skewY(-${1 + i * 0.5}deg)`,
                            opacity: 0.4 - i * 0.04,
                        }}
                    />
                ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span
                    className="text-[22vw] sm:text-[28vw] font-black italic uppercase text-white/2 leading-none tracking-tighter"
                    style={{ fontStretch: "condensed" }}
                >
                    Venue
                </span>
            </div>

            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-700 via-red-500 to-red-700" />

            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-12 sm:pt-16 w-full">
                <h1 className="text-4xl sm:text-7xl lg:text-[5rem] font-black italic uppercase leading-[0.95] tracking-tighter mb-4">
                    <span className="text-red-white">{guide.title}</span>
                </h1>

                <div className="flex flex-wrap gap-6 mb-10">
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
        </section>

        {/* Hero image */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-4 pb-12 sm:pb-16">
            <div className="mx-auto max-w-7xl">
                <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-lg shadow-red-950/20">
                    <div className="h-1 w-full bg-red-600" />
                    <div className="aspect-21/9 sm:aspect-[2.4/1] w-full">
                        <Image
                            src={urlFor(guide.mainImage)?.url() ?? ""}
                            alt={guide.title}
                            width={1500}
                            height={1000}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* Content */}
        <section
            id="content"
            className="scroll-mt-24 border-t border-white/5 py-12 sm:py-20"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <PortableText
                    value={guide.content}
                    components={guidePortableTextComponents}
                />
            </div>
        </section>

        {/* CTA banner */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950">
            <div className="absolute inset-0 bg-linear-to-r from-red-950/40 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-red-600 via-red-400 to-transparent" />

            <div className="mx-auto max-w-7xl relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Flag className="w-6 h-6 text-red-500" />
                            <span className="text-red-400 text-xs font-black uppercase tracking-[0.3em]">
                                Stay in the loop
                            </span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-3">
                            More <span className="text-red-500">venues</span>
                        </h2>
                        <p className="text-zinc-500 font-bold text-sm max-w-md">
                            Discover screenings, fan zones, and places to
                            play near you.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 shrink-0">
                        <Link
                            href="/guides"
                            className="flex items-center justify-center gap-3 px-10 py-3 font-black uppercase italic tracking-wider text-sm bg-white text-black hover:bg-red-600 hover:text-white transition-all transform -skew-x-6"
                        >
                            <span className="transform skew-x-6">
                                Browse all guides
                            </span>
                        </Link>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-3 px-10 py-3 font-black uppercase italic tracking-wider text-sm border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-red-400 transition-all transform -skew-x-6"
                        >
                            <span className="transform skew-x-6 flex items-center gap-3">
                                <Bell className="w-4 h-4" />
                                Guide alerts
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </div>
}