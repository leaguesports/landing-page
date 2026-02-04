import { CategoryCard } from "@/components/CategoryCard";
import { FeaturedEventCard } from "@/components/FeaturedEventCard";
import { LiveEventCard } from "@/components/LiveEventCard";

function MapPinIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 5.523-4.477 10-10 10S0 15.523 0 10C0 4.477 4.477 0 10 0s10 4.477 10 10"></path><circle cx="10" cy="10" r="3"></circle></svg>
    )
}

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
                    <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
                        Personalise my feed
                    </button>
                </div>
            </section>
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3 text-left">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search venues, events, or locations..."
                                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                                readOnly
                            />
                            <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-xl font-bold tracking-tight sm:text-xl lg:text-3xl">
                        Live Matches
                    </h2>
                </div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <LiveEventCard
                            image="https://images.unsplash.com/photo-1634813052369-3584119ccd2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmb290YmFsbCUyMHN0YWRpdW18ZW58MXx8fHwxNzcwMDIyNTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                            title="DHL Stormers vs Blue Bulls"
                            sport="Rugby"
                            location="Cape Town, South Africa"
                            homeTeam="DHL Stormers"
                            awayTeam="Blue Bulls"
                            homeScore={0}
                            awayScore={0}
                            timeRemaining="10:00"
                            viewers="100"
                        />
                        <LiveEventCard
                            image="https://images.unsplash.com/photo-1634813052369-3584119ccd2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmb290YmFsbCUyMHN0YWRpdW18ZW58MXx8fHwxNzcwMDIyNTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                            title="Golden Lions vs Blue Bulls"
                            sport="Rugby"
                            location="Cape Town, South Africa"
                            homeTeam="Golden Lions"
                            awayTeam="Blue Bulls"
                            homeScore={0}
                            awayScore={0}
                            timeRemaining="10:00"
                            viewers="100"
                        />
                    </div>
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
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">

                        <CategoryCard
                            image="https://images.ireland.com/media/Images/rugby-in-ireland/b5cf972a7a4e4592a49f672d4a64f465.jpg"
                            title="Rugby"
                            count="100"
                        />
                        <CategoryCard
                            image="sports/golf.jpg"
                            title="Golf"
                            count="100"
                        />
                        <CategoryCard
                            image="https://cdn.britannica.com/51/190751-050-147B93F7/soccer-ball-goal.jpg"
                            title="Soccer"
                            count="100"
                        />
                        <CategoryCard
                            image="sports/cricket.jpg"
                            title="Cricket"
                            count="100"
                        />
                        <CategoryCard
                            image="sports/padel.jpg"
                            title="Padel"
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
