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
        </div>
    );
}
