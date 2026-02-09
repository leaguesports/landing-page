import { ArrowRight, MapPin, Star } from "lucide-react";

interface VenueDiscoveryCardProps {
    name: string;
    type: string;
    address: string;
    rating: number;
    image: string;
    featured?: boolean;
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
                    <Star className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span>{rating}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm w-fit mb-2">
                        {type}
                    </div>
                    <h3 className="text-white mb-2">{name}</h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm mb-3">
                        <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
                        <span>{address}</span>
                    </div>
                    {featured && (
                        <button className="bg-white text-gray-900 px-6 py-2 rounded-full flex items-center gap-2 w-fit text-sm transition-transform group-hover:scale-105">
                            View Details
                            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
