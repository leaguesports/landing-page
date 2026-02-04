interface VenueDiscoveryCardProps {
    name: string;
    type: string;
    address: string;
    rating: number;
    image: string;
    featured?: boolean;
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

function StarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2"></path></svg>
    )
}

export function VenueDiscoveryCard({ name, type, address, rating, image, featured = false }: VenueDiscoveryCardProps) {
    return (
        <div className={`group cursor-pointer ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}>
            <div className={`relative rounded-2xl overflow-hidden mb-3 ${featured ? 'h-[400px]' : 'h-56'}`}>
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
                    <StarIcon />
                    <span>{rating}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm w-fit mb-2">
                        {type}
                    </div>
                    <h3 className="text-white mb-2">{name}</h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm mb-3">
                        <MapPinIcon />
                        <span>{address}</span>
                    </div>
                    {featured && (
                        <button className="bg-white text-gray-900 px-6 py-2 rounded-full flex items-center gap-2 w-fit text-sm transition-transform group-hover:scale-105">
                            View Details
                            <ArrowRightIcon />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
