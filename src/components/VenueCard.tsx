import { Clock, MapPin, Star } from "lucide-react";

interface VenueCardProps {
    name: string;
    type: string;
    address: string;
    hours: string;
    rating: number;
    amenities: string[];
    image: string;
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
                    <Star className="h-4 w-4 shrink-0" strokeWidth={2} />
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
                        <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
                        <span>{address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" strokeWidth={2} />
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
