import { CategoryCard } from "@/components/CategoryCard";
import { FeaturedEventCard } from "@/components/FeaturedEventCard";

export default async function SportPage({ params }: { params: Promise<{ sport: string }> }) {
    const { sport } = await params;

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FeaturedEventCard
                        image="https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        title="FORMULA 1 QATAR AIRWAYS AUSTRALIAN GRAND PRIX 2026"
                        sport={'F1™'}
                        date="2026-03-15"
                        location="Melbourne, Australia"
                        description="The first race of the 2026 F1 season"
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
                                    image="/assets/benchwarmers.webp"
                                    title="Benchwarmers Sports Bar"
                                    count="100"
                                />
                                <CategoryCard
                                    image="/assets/hogshead.webp"
                                    title="Hogshead Illovo"
                                    count="100"
                                />
                                <CategoryCard
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