import Image from "next/image";
import { CategoryCard } from "@/components/CategoryCard";
import { ChevronDown, Flame, Search } from "lucide-react";

export default function PlayPage() {
    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-white/10 bg-linear-to-b from-[#0f0f0f] to-[#0a0a0a] py-28 sm:py-32">
                {/* Background orbs */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute left-1/4 top-1/4 h-112 w-md rounded-full bg-green-500/15 blur-3xl animate-pulse-glow" />
                    <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400/5 blur-3xl" />
                </div>
                {/* Grid overlay */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-size-[4rem_4rem]" />

                {/* Floating decorative shapes */}
                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full border border-emerald-500/20 animate-float-slow" style={{ animationDelay: "0s" }} />
                    <div className="absolute right-[15%] top-[30%] h-40 w-40 rounded-full bg-teal-500/10 blur-2xl animate-float-slow" style={{ animationDelay: "-2s" }} />
                    <div className="absolute left-[20%] bottom-[25%] h-24 w-24 rounded-full border border-green-400/15 animate-float-slow" style={{ animationDelay: "-4s" }} />
                    <div className="absolute right-[25%] bottom-[15%] h-32 w-32 rounded-full bg-emerald-500/10 blur-xl animate-float-slow" style={{ animationDelay: "-1s" }} />
                    <div className="absolute left-1/2 top-[15%] h-2 w-24 rounded-full bg-linear-to-r from-transparent via-emerald-400/30 to-transparent rotate-12 animate-float-slow" style={{ animationDelay: "-3s" }} />
                    <div className="absolute right-1/3 bottom-[35%] h-2 w-16 rounded-full bg-linear-to-r from-transparent via-green-400/20 to-transparent -rotate-45 animate-float-slow" style={{ animationDelay: "-5s" }} />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        {/* Badge */}
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                            <span className="text-gray-300">Venues &amp; courts near you</span>
                        </div>

                        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                            <span className="block">Where to</span>
                            <span className="relative inline-block bg-linear-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                Play
                                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-green-400/60 via-emerald-400 to-teal-400/60" aria-hidden />
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400 sm:text-xl">
                            Find courts, pitches, and courses. Book a slot, join a game, or discover new sports in your area.
                        </p>

                        {/* Find venue pill */}
                        <div className="mt-10 mx-auto max-w-md">
                            <div className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10">
                                <Search className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
                                <span className="flex-1 text-left text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Search venues, sports, or location...</span>
                                <kbd className="hidden sm:inline-flex h-6 items-center rounded border border-white/20 bg-white/5 px-2 text-xs text-gray-500">⌘K</kbd>
                            </div>
                        </div>

                        {/* Sport imagery strip */}
                        <div className="mt-14 flex items-center justify-center gap-4 sm:gap-6">
                            {[
                                { src: "/sports/golf.jpg", label: "Golf" },
                                { src: "/sports/cricket.jpg", label: "Cricket" },
                                { src: "/sports/padel.jpg", label: "Padel" },
                            ].map((sport, i) => (
                                <div
                                    key={sport.label}
                                    className="group relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-lg transition-transform hover:scale-110 hover:border-emerald-500/30"
                                    style={{ animationDelay: `${i * 0.5}s` }}
                                >
                                    <Image
                                        src={sport.src}
                                        alt={sport.label}
                                        width={80}
                                        height={80}
                                        className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                                    <span className="absolute bottom-1 left-1 right-1 text-center text-[10px] sm:text-xs font-medium text-white drop-shadow-md truncate">{sport.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-gray-400">
                            <div>
                                <div className="text-2xl font-bold text-white">Rugby</div>
                                <div>Clubs &amp; fields</div>
                            </div>
                            <div className="hidden sm:block h-8 w-px bg-white/20" />
                            <div>
                                <div className="text-2xl font-bold text-white">Golf</div>
                                <div>Courses</div>
                            </div>
                            <div className="hidden sm:block h-8 w-px bg-white/20" />
                            <div>
                                <div className="text-2xl font-bold text-white">Soccer</div>
                                <div>Pitches</div>
                            </div>
                            <div className="hidden sm:block h-8 w-px bg-white/20" />
                            <div>
                                <div className="text-2xl font-bold text-white">Cricket</div>
                                <div>Grounds</div>
                            </div>
                        </div>

                        {/* Scroll hint */}
                        <p className="mt-10 text-sm text-gray-500">Browse by sport below</p>
                        <div className="mt-4 flex justify-center">
                            <div className="animate-bounce rounded-full border border-white/20 bg-white/5 p-2 backdrop-blur-sm">
                                <ChevronDown className="h-5 w-5 text-gray-400" strokeWidth={2} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-linear-to-r from-orange-600 to-red-600 p-3 rounded-xl">
                                <Flame className="h-6 w-6" strokeWidth={2} />
                            </div>
                            <div>
                                <h2 className="font-black text-3xl">Trending This Week</h2>
                                <p className="text-white/60">Popular events everyone&apos;s talking about</p>
                            </div>
                        </div>
                        <button className="text-orange-600 hover:text-orange-700 transition-colors font-bold">View All →</button>
                    </div>
                </div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">

                        <CategoryCard
                            href="/sports/rugby"
                            image="https://images.ireland.com/media/Images/rugby-in-ireland/b5cf972a7a4e4592a49f672d4a64f465.jpg"
                            title="Rugby"
                            count="100"
                        />
                        <CategoryCard
                            href="/sports/golf"
                            image="https://www.blog.de/wp-content/uploads/2020/12/Golf-spielen.jpg"
                            title="Golf"
                            count="100"
                        />
                        <CategoryCard
                            href="/sports/soccer"
                            image="https://cdn.britannica.com/51/190751-050-147B93F7/soccer-ball-goal.jpg"
                            title="Soccer"
                            count="100"
                        />
                        <CategoryCard
                            href="/sports/cricket"
                            image="https://www.zapcricket.com/cdn/shop/articles/WhatsApp_Image_2023-12-29_at_04.30.32.webp?v=1703804643"
                            title="Cricket"
                            count="100"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
