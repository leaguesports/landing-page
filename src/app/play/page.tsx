import { CategoryCard } from "@/components/CategoryCard";
import { Venue } from "@/types/venue";

function FlameIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame"><path d="M17 22a1 1 0 0 1-2 0c0-1.333.833-3.667 3-6-2.167-2.333-3-4.667-3-6a1 1 0 0 1 2 0c0 1.333-.833 3.667-3 6 2.167 2.333 3 4.667 3 6"></path><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8"></path></svg>
    )
}

export default async function PlayPage() {
    const venues: Venue[] = []

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            {/* Hero Section */}
            <section className="relative border-b border-white/10 bg-linear-to-b from-[#0f0f0f] to-[#0a0a0a] py-24">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
                    <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                            Sports Venues in{" "}
                            <br />
                            <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                Johannesburg
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-400">
                            {`Discover ${venues.length} golf courses across Gauteng. Find the perfect course for your next round.`}
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-xl">
                                <FlameIcon />
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
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

                        <CategoryCard
                            image="https://images.ireland.com/media/Images/rugby-in-ireland/b5cf972a7a4e4592a49f672d4a64f465.jpg"
                            title="Rugby"
                            count="100"
                        />
                        <CategoryCard
                            image="https://www.blog.de/wp-content/uploads/2020/12/Golf-spielen.jpg"
                            title="Golf"
                            count="100"
                        />
                        <CategoryCard
                            image="https://cdn.britannica.com/51/190751-050-147B93F7/soccer-ball-goal.jpg"
                            title="Soccer"
                            count="100"
                        />
                        <CategoryCard
                            image="https://www.zapcricket.com/cdn/shop/articles/WhatsApp_Image_2023-12-29_at_04.30.32.webp?v=1703804643"
                            title="Cricket"
                            count="100"
                        />
                    </div>
                </div>
            </section>

            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-xl font-bold tracking-tight sm:text-xl lg:text-3xl">
                        Featured Categories
                    </h2>
                </div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

                        <CategoryCard
                            image="https://images.ireland.com/media/Images/rugby-in-ireland/b5cf972a7a4e4592a49f672d4a64f465.jpg"
                            title="Rugby"
                            count="100"
                        />
                        <CategoryCard
                            image="https://www.blog.de/wp-content/uploads/2020/12/Golf-spielen.jpg"
                            title="Golf"
                            count="100"
                        />
                        <CategoryCard
                            image="https://cdn.britannica.com/51/190751-050-147B93F7/soccer-ball-goal.jpg"
                            title="Soccer"
                            count="100"
                        />
                        <CategoryCard
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
