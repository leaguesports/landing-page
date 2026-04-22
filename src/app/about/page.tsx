import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description:
        "Why LeagueSports exists: from finding venues as a sports fan in Germany to building something for South Africa.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-linear-to-br from-green-950/50 via-[#0f0f0f] to-[#0f0f0f]" />
                <div
                    className="absolute inset-0 opacity-25"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                        backgroundSize: "4rem 4rem",
                    }}
                />
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-green-700 via-green-500 to-green-700" />

                <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
                        Our story
                    </p>
                    <h1 className="text-4xl font-black italic uppercase leading-tight tracking-tighter text-white sm:text-5xl md:text-6xl">
                        Built by a fan,{" "}
                        <span className="text-green-400">for fans</span>
                    </h1>
                    <p className="mt-6 text-lg leading-relaxed text-zinc-400">
                        LeagueSports started from a simple frustration I kept running into as someone who just wanted to watch and play sport in the right place, at the right time.
                    </p>
                </div>
            </section>

            {/* Body */}
            <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
                <div className="space-y-12 text-base leading-relaxed text-zinc-300 sm:text-lg">
                    <div>
                        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-green-400">
                            Germany
                        </h2>
                        <p>
                            I built this platform while living in Germany as a sports fan. I love following games and getting out to play, but I found it genuinely hard to discover where to go: which pubs and venues show the matches I cared about, where I could book a court or pitch, and what was happening near me on any given weekend. Information was scattered across forums, club sites, and word of mouth.
                        </p>
                    </div>

                    <div>
                        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-green-400">
                            The idea
                        </h2>
                        <p>
                            I wanted one place that respects how fans actually behave: you care about the fixture, the vibe, and the venue, not hunting through ten different sources. That is the problem LeagueSports sets out to solve: making it easier to find where to watch or play, and to feel confident you are headed somewhere that fits what you are looking for.
                        </p>
                    </div>

                    <div>
                        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-green-400">
                            South Africa
                        </h2>
                        <p>
                            That experience made South Africa feel like a natural home for this product. Sport is woven into everyday life here, and the appetite to gather around a screen or get onto a field is huge, but the same fragmentation shows up: great venues and communities exist, yet they are not always easy to find when you are new to a city or trying something different. I believe a dedicated platform for venues, watching, and playing is an especially strong fit for this market, and I am building LeagueSports with that in mind.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-14 rounded-xl border border-zinc-800 bg-zinc-950/80 p-8 sm:p-10">
                    <p className="text-center text-sm font-semibold uppercase tracking-wider text-zinc-500">
                        Explore the platform
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/watch"
                            className="inline-flex items-center justify-center rounded-md bg-green-600 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-green-500"
                        >
                            Watch
                        </Link>
                        <Link
                            href="/play"
                            className="inline-flex items-center justify-center rounded-md border border-zinc-600 bg-transparent px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-zinc-400 hover:bg-white/5"
                        >
                            Play
                        </Link>
                        <Link
                            href="/venues"
                            className="inline-flex items-center justify-center rounded-md border border-zinc-600 bg-transparent px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-zinc-400 hover:bg-white/5"
                        >
                            Venues
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
