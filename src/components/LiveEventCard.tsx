interface LiveEventCardProps {
    title: string;
    sport: string;
    location: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    timeRemaining: string;
    viewers: string;
    image: string;
}

function MapPinIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 5.523-4.477 10-10 10S0 15.523 0 10C0 4.477 4.477 0 10 0s10 4.477 10 10"></path><circle cx="10" cy="10" r="3"></circle></svg>
    )
}

function UsersIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    )
}

export function LiveEventCard({
    title,
    sport,
    location,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    timeRemaining,
    viewers,
    image
}: LiveEventCardProps) {
    return (
        <div className="group cursor-pointer relative overflow-hidden rounded-3xl bg-linear-to-br from-gray-900 to-gray-800 shadow-2xl hover:shadow-orange-500/20 transition-all">
            <div className="absolute inset-0 opacity-30">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent" />

            <div className="relative p-6">
                {/* Live Badge */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <span className="text-sm font-bold">LIVE</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                        {sport}
                    </div>
                </div>

                {/* Scoreboard */}
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 mb-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-white text-center flex-1">
                            <div className="text-xl mb-2">{homeTeam}</div>
                            <div className="text-5xl font-black text-orange-500">{homeScore}</div>
                        </div>
                        <div className="text-white/60 px-4 text-sm">VS</div>
                        <div className="text-white text-center flex-1">
                            <div className="text-xl mb-2">{awayTeam}</div>
                            <div className="text-5xl font-black">{awayScore}</div>
                        </div>
                    </div>
                    <div className="text-center text-orange-400 font-bold">{timeRemaining}</div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-white/80 text-sm">
                    <div className="flex items-center gap-2">
                        <MapPinIcon />
                        <span>{location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <UsersIcon />
                        <span>{viewers} watching live</span>
                    </div>
                </div>

                <button className="w-full mt-6 bg-linear-to-r from-orange-600 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-orange-700 hover:to-orange-600 transition-all transform hover:scale-105">
                    Watch Now
                </button>
            </div>
        </div>
    );
}
