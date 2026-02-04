interface VenueCardProps {
    name: string;
    type: string;
    address: string;
    hours: string;
    rating: number;
    amenities: string[];
    image: string;
}

function MapPinIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 5.523-4.477 10-10 10S0 15.523 0 10C0 4.477 4.477 0 10 0s10 4.477 10 10"></path><circle cx="10" cy="10" r="3"></circle></svg>
    )
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><path d="M12 2v20"></path><path d="M20 12H4"></path></svg>
    )
}

function StarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2"></path></svg>
    )
}

export function VenueCard({ name, type, address, hours, rating, amenities, image }: VenueCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm flex items-center gap-1">
                    <StarIcon />
                    <span>{rating}</span>
                </div>
            </div>
            <div className="p-4">
                <div className="mb-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{type}</span>
                </div>
                <h3 className="mb-3">{name}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                        <MapPinIcon />
                        <span>{address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockIcon />
                        <span>{hours}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1">
                    {amenities.map((amenity, index) => (
                        <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {amenity}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
