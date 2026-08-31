import { urlFor } from "@/sanity/client";
import { Bell, Flag } from "lucide-react";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideBySlug, Guide, listGuides } from "./actions";
import { guidePortableTextComponents } from "./textComponents";

type GuidesPageParams = { route?: string[] };

function getJsonLd(guide: Guide) {
    return {
        "@context": "https://schema.org",
        "@type": "Guide",
        "headline": guide.title,
        "description": guide.description,
        "image": urlFor(guide.mainImage)?.url() ?? "",
        "author": {
            "@type": "Organization",
            "name": "LeagueSports",
            "url": "https://leaguesports.co.za"
        },
        "publisher": {
            "@type": "Organization",
            "name": "LeagueSports",
            "logo": {
                "@type": "ImageObject",
                "url": "https://leaguesports.co.za/logo.png" // Replace with your logo
            }
        },
        "datePublished": new Date(guide._createdAt).toISOString(),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://leaguesports.co.za/guides/${guide.slug}`
        }
    };
}

function GuideCard({ guide }: { guide: Guide }) {
    return (
        <Link
            href={`/guides/${guide.slug}`}
            className="group block overflow-hidden rounded-3xl border border-white/8 bg-[#141814] transition-colors hover:border-white/16"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-800">
                {guide.mainImage ? (
                    <Image
                        src={urlFor(guide.mainImage)?.url() ?? ""}
                        alt={guide.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                ) : (
                    <div className="h-full w-full bg-zinc-800" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-[#141814] via-transparent to-transparent" />
            </div>

            <div className="px-4 py-4 sm:px-5">
                <h2 className="text-[15px] font-medium leading-snug text-white group-hover:text-[var(--color-brand)] sm:text-base">
                    {guide.title}
                </h2>
                {guide.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                        {guide.description}
                    </p>
                ) : null}
            </div>
        </Link>
    );
}

function GuidesIndex({ guides }: { guides: Guide[] }) {
    return (
        <div className="min-h-screen bg-[#0c0f0c] text-white">
            <section className="relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
                <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-[var(--color-brand)]/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                        Editorial
                    </p>
                    <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
                        Guides
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                        Local tips for fans and players across South Africa.
                    </p>
                </div>
            </section>

            <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {guides.length === 0 ? (
                        <div className="rounded-3xl border border-white/8 bg-[#141814] px-6 py-16 text-center sm:px-8">
                            <p className="text-base text-zinc-400">
                                No guides published yet. Check back soon.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                            {guides.map((guide) => (
                                <GuideCard key={guide._id} guide={guide} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export async function generateMetadata({ params }: { params: Promise<GuidesPageParams> }) {
    const guideSlug = (await params).route?.[0];

    if (!guideSlug) {
        return {
            title: "Guides",
            description: "Local tips for fans and players across South Africa.",
            openGraph: {
                title: "Guides",
                description: "Local tips for fans and players across South Africa.",
            },
            twitter: {
                card: "summary",
                title: "Guides",
                description: "Local tips for fans and players across South Africa.",
            },
            alternates: {
                canonical: "/guides",
            },
            robots: {
                index: true,
                follow: true,
            },
            keywords: ["guides", "LeagueSports", "sports", "South Africa"],
        };
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
            ...guide.keywords,
            "LeagueSports",
        ],
    };
}

export default async function GuidesPage(route: { params: Promise<GuidesPageParams> }) {
    const params = await route.params;
    const guideSlug = params.route?.[0];

    if (!guideSlug) {
        const guides = await listGuides();
        return <GuidesIndex guides={guides} />;
    }

    const guide = await getGuideBySlug(guideSlug);

    if (!guide) {
        return notFound();
    }

    const jsonLd = getJsonLd(guide);

    return <div className="min-h-screen bg-[#0c0f0c] text-white">
        {/* JSON-LD */}
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
            <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-[var(--color-brand)]/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                    Guide
                </p>
                <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
                    {guide.title}
                </h1>
                {guide.description ? (
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                        {guide.description}
                    </p>
                ) : null}
            </div>
        </section>

        {/* Hero image */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="mx-auto max-w-7xl">
                <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
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
        <section className="relative overflow-hidden border-t border-white/5 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-950/30 via-[#0c0f0c] to-[#0c0f0c] pointer-events-none" />
            <div className="pointer-events-none absolute left-0 bottom-0 h-64 w-64 rounded-full bg-[var(--color-brand)]/8 blur-3xl" />

            <div className="mx-auto max-w-7xl relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 rounded-3xl border border-white/8 bg-[#141814] p-8 sm:p-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Flag className="w-5 h-5 text-[var(--color-brand)]" />
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                                Stay in the loop
                            </span>
                        </div>
                        <h2 className="font-display text-4xl sm:text-5xl tracking-wide text-white mb-3">
                            More <span className="text-[var(--color-brand)]">venues</span>
                        </h2>
                        <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
                            Discover screenings, fan zones, and places to
                            play near you.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
                        <Link
                            href="/guides"
                            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
                        >
                            Browse all guides
                        </Link>
                        <button
                            type="button"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                        >
                            <Bell className="w-4 h-4" />
                            Guide alerts
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </div>
}
