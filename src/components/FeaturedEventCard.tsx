interface FeaturedEventCardProps {
    title: string;
    sport: string;
    date: string;
    location: string;
    description: string;
    image: string;
}

function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="20" height="18" x="2" y="4" rx="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="2" x2="22" y1="10" y2="10"></line></svg>
    )
}

function MapPinIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 5.523-4.477 10-10 10S0 15.523 0 10C0 4.477 4.477 0 10 0s10 4.477 10 10"></path><circle cx="10" cy="10" r="3"></circle></svg>
    )
}

function ArrowRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
    )
}

export function FeaturedEventCard({ title, sport, date, location, description, image }: FeaturedEventCardProps) {
    return (
        <div className="relative h-[500px] rounded-3xl overflow-hidden group cursor-pointer">
            <div className="absolute inset-0">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            </div>
            <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl text-white">
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm w-fit mb-4">
                    {sport}
                </div>
                <h1 className="text-white mb-4">{title}</h1>
                <p className="text-white/90 text-lg mb-6">{description}</p>
                <div className="flex flex-wrap gap-4 mb-6 text-white/90">
                    <div className="flex items-center gap-2">
                        <CalendarIcon />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPinIcon />
                        <span>{location}</span>
                    </div>
                </div>
                <button className="bg-white text-gray-900 px-8 py-3 rounded-full flex items-center gap-2 w-fit transition-transform group-hover:scale-105">
                    Get Tickets
                    <ArrowRightIcon />
                </button>
            </div>
        </div>
    );
}
