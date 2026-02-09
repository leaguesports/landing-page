import { CategoryCard } from "@/components/CategoryCard";
import { FeaturedEventCard } from "@/components/FeaturedEventCard";
import type { Tournament } from "@/types/tournament";
import { Calendar, Trophy } from "lucide-react";

const TOURNAMENTS_API_URL =
    process.env.TOURNAMENTS_API_URL ?? "http://localhost:3000/api/tournaments";

export default async function SoccerPage() {
    let tournaments: Tournament[] = [];
    try {
        const res = await fetch(TOURNAMENTS_API_URL);
        if (res.ok) tournaments = await res.json();
    } catch {
        // External tournaments API may be unavailable
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FeaturedEventCard
                        image="https://images.unsplash.com/flagged/photo-1550413231-202a9d53a331?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        title="Fifa World Cup 2026"
                        sport={'Soccer'}
                        date="2026-03-15"
                        location="Melbourne, Australia"
                        description="The 2026 Fifa World Cup will be held in Mexico."
                    />
                </div>
            </section>
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p>The FORMULA 1™ season kicks off with the Australian Grand Prix in Melbourne.</p>
                    <p>The Australian Grand Prix is a Formula One race that is held at the Melbourne Grand Prix Circuit in Melbourne, Australia.</p>
                </div>
            </section>
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section className="py-12 space-y-6">
                        <div className="mx-auto max-w-7xl">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="bg-linear-to-r from-amber-500 to-yellow-600 p-3 rounded-xl">
                                        <Trophy className="h-6 w-6" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-3xl">Tournaments</h2>
                                        <p className="text-white/60">Major soccer competitions and cups</p>
                                    </div>
                                </div>
                                <button className="text-orange-600 hover:text-orange-700 transition-colors font-bold">View All →</button>
                            </div>
                        </div>
                        <div className="mx-auto max-w-7xl">
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {tournaments.map((t) => (
                                    <CategoryCard
                                        key={t.id}
                                        href={`/sports/soccer/tournaments/${t.slug}`}
                                        image={t.organizer.logoUrl}
                                        title={t.name}
                                        count={t.matches.length ? `${t.matches.length} matches` : t.organizer.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </section>
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section className="py-12 space-y-6">
                        <div className="mx-auto max-w-7xl">
                            <h2 className="text-xl font-bold tracking-tight sm:text-xl lg:text-3xl">
                                Where to watch
                            </h2>
                            <p className="text-white/60">Catch all of the action at these venues</p>
                        </div>
                        <div className="mx-auto max-w-7xl">
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

                                <CategoryCard
                                    href="/sports/f1/races/1"
                                    image="/assets/benchwarmers.webp"
                                    title="Benchwarmers Sports Bar"
                                    count="100"
                                />
                                <CategoryCard
                                    href="/sports/f1/races/2"
                                    image="/assets/hogshead.webp"
                                    title="Hogshead Illovo"
                                    count="100"
                                />
                                <CategoryCard
                                    href="/sports/f1/races/3"
                                    image="/assets/ridgeway-racebar.webp"
                                    title="Ridgeway Racebar"
                                    count="100"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
}