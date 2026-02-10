import { CategoryCard } from "@/components/CategoryCard";
import { FeaturedEventCard } from "@/components/FeaturedEventCard";
import { EVENT_LIST } from "@/data/events";
import { notFound } from "next/navigation";

export default async function F1RacePage({ params }: { params: Promise<{ race: string }> }) {
    const { race } = await params;

    const event = EVENT_LIST.find((event) => event.slug === race);

    if (!event) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FeaturedEventCard
                        image={event.imageUrl ?? ""}
                        title={event.name}
                        sport={event.activity.name}
                        date={event.date}
                        location={event.areas?.[0] ?? ""}
                        description={`Watch the ${event.name} at ${event.areas?.[0] ?? ""}`}
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
                            <h2 className="text-xl font-bold tracking-tight sm:text-xl lg:text-3xl">
                                Where to watch
                            </h2>
                            <p className="text-white/60">Catch all of the action at these venues</p>
                        </div>
                        <div className="mx-auto max-w-7xl">
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

                                <CategoryCard
                                    href="/sports/f1/races/australian-grand-prix"
                                    image="/assets/benchwarmers.webp"
                                    title="Benchwarmers Sports Bar"
                                    count="100"
                                />
                                <CategoryCard
                                    href="/sports/f1/races/chinese-grand-prix"
                                    image="/assets/hogshead.webp"
                                    title="Hogshead Illovo"
                                    count="100"
                                />
                                <CategoryCard
                                    href="/sports/f1/races/japanese-grand-prix"
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