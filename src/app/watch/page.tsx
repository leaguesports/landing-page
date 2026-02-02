import { CategoryCard } from "@/components/CategoryCard";
import { FeaturedEventCard } from "@/components/FeaturedEventCard";

export default function WatchPage() {
    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FeaturedEventCard
                        image="https://www.springboks.rugby/media/kn4lzysu/230825-kurt-lee-arendse-springboks-2.jpg"
                        title="Springboks vs All Blacks"
                        sport="Rugby"
                        date="2025-03-15"
                        location="Cape Town, South Africa"
                        description="Watch the ultimate rugby clash in America"
                    />
                </div>
            </section>
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-xl font-bold tracking-tight sm:text-xl lg:text-3xl">
                        Upcoming Matches
                    </h2>
                </div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <CategoryCard
                            image="https://d2779tscntxxsw.cloudfront.net/tmis_64d1496faf46e.png"
                            title="DHL Stormers vs Blue Bulls"
                            count=""
                        />
                        <CategoryCard
                            image="https://d2779tscntxxsw.cloudfront.net/tmis_642d861c2279b.png"
                            title="Golden Lions vs Blue Bulls"
                            count=""
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
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-xl font-bold tracking-tight sm:text-xl lg:text-3xl">
                        Top Venues
                    </h2>
                </div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

                        <CategoryCard
                            image="assets/benchwarmers.webp"
                            title="Benchwarmers Sports Bar"
                            count="100"
                        />
                        <CategoryCard
                            image="assets/hogshead.webp"
                            title="Hogshead Illovo"
                            count="100"
                        />
                        <CategoryCard
                            image="assets/ridgeway-racebar.webp"
                            title="Ridgeway Racebar"
                            count="100"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
