import { Award, Calendar, Clock, MapPin, Star } from "lucide-react";

interface VenueHighlightCardProps {
    name: string;
    type: string;
    address: string;
    rating: number;
    reviews: number;
    nextEvent: string;
    eventTime: string;
    image: string;
    featured?: boolean;
}

export function VenueHighlightCard({
    name,
    type,
    address,
    rating,
    reviews,
    nextEvent,
    eventTime,
    image,
    featured = false
}: VenueHighlightCardProps) {
    return (
        <div className={`group cursor-pointer border border-white/20 rounded-2xl ${featured ? 'md:col-span-2' : ''}`}>
            <div className={`relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all ${featured ? 'h-[450px]' : 'h-80'}`}>
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                    <Star className="h-5 w-5 shrink-0" strokeWidth={2} />
                    <div>
                        <div className="font-bold text-lg leading-none">{rating}</div>
                        <div className="text-xs opacity-90">{reviews} reviews</div>
                    </div>
                </div>

                {featured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg">
                        <Award className="h-5 w-5 shrink-0" strokeWidth={2} />
                        Featured Venue
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm w-fit mb-3 font-bold">
                        {type}
                    </div>
                    <h3 className="text-white text-2xl font-black mb-3">{name}</h3>

                    <div className="space-y-2 text-white/90 mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 shrink-0" strokeWidth={2} />
                            <span>{address}</span>
                        </div>
                    </div>

                    {/* Next Event */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <div className="text-white/70 text-xs font-bold mb-2">NEXT EVENT</div>
                        <div className="text-white font-bold mb-2">{nextEvent}</div>
                        <div className="flex items-center gap-4 text-sm text-white/80">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-5 w-5 shrink-0" strokeWidth={2} />
                                <span>{eventTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
