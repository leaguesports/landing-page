import { CategoryCard } from "@/components/CategoryCard";

export default function SportsPage() {
    return (
        <div>
            <div className="min-h-screen bg-[#0f0f0f]">
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
        </div>
    )
}