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

import { MapPin, Users } from "lucide-react";

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
                        <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
                        <span>{location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 shrink-0" strokeWidth={2} />
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
