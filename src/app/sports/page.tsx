import { CategoryCard } from "@/components/CategoryCard";
import { SPORTS_CATEGORIES_LIST } from "@/data/categories";
import { SPORTS } from "@/data/sports";

export default async function SportsPage() {
    const sports = SPORTS;
    const topCategories = SPORTS_CATEGORIES_LIST;

    return (
        <div>
            <div className="min-h-screen bg-[#0f0f0f]">
                <section className="py-12 space-y-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <section className="py-12 space-y-6">
                            <div className="mx-auto max-w-7xl">
                                <h2 className="text-xl font-bold tracking-tight sm:text-xl lg:text-3xl">
                                    Popular Sports
                                </h2>
                                <p className="text-white/60">The most popular sports on the platform</p>
                            </div>
                            <div className="mx-auto max-w-7xl">
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

                                    {sports.map((sport) => (
                                        <CategoryCard href={`/sports/${sport.slug}`} key={sport.id} image="https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" title={sport.name} count="" />
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
                                    Top Categories
                                </h2>
                                <p className="text-white/60">The most popular sports categories</p>
                            </div>
                            <div className="mx-auto max-w-7xl">
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

                                    {topCategories.map((category) => (
                                        <CategoryCard href={`/sports/${category.slug}`} key={category.id} image="https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" title={category.name} count="" />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </div>
    )
}