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

function MapPinIcon() {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 5.523-4.477 10-10 10S0 15.523 0 10C0 4.477 4.477 0 10 0s10 4.477 10 10"></path><circle cx="10" cy="10" r="3"></circle></svg>
    )
}

function StarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2"></path></svg>
    )
}

function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path></svg>
    )
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><path d="M12 2v20"></path><path d="M20 12H4"></path></svg>
    )
}

function AwardIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award"><path d="M12 23v-20l8 10-8 10z"></path><path d="M12 12h.01"></path></svg>
    )
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
                    <StarIcon />
                    <div>
                        <div className="font-bold text-lg leading-none">{rating}</div>
                        <div className="text-xs opacity-90">{reviews} reviews</div>
                    </div>
                </div>

                {featured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg">
                        <AwardIcon />
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
                            <MapPinIcon />
                            <span>{address}</span>
                        </div>
                    </div>

                    {/* Next Event */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <div className="text-white/70 text-xs font-bold mb-2">NEXT EVENT</div>
                        <div className="text-white font-bold mb-2">{nextEvent}</div>
                        <div className="flex items-center gap-4 text-sm text-white/80">
                            <div className="flex items-center gap-1">
                                <CalendarIcon />
                                <span>{eventTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
