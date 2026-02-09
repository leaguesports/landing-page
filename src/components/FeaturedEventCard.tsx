import { ArrowRight, Calendar, MapPin } from "lucide-react";

interface FeaturedEventCardProps {
    title: string;
    sport: string;
    date: string;
    location: string;
    description: string;
    image: string;
}

export function FeaturedEventCard({ title, sport, date, location, description, image }: FeaturedEventCardProps) {
    return (
        <div className="relative h-[500px] rounded-3xl overflow-hidden group cursor-pointer border border-white/10">
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
                        <Calendar className="h-5 w-5 shrink-0" strokeWidth={2} />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 shrink-0" strokeWidth={2} />
                        <span>{location}</span>
                    </div>
                </div>
                <button className="bg-white text-gray-900 px-8 py-3 rounded-full flex items-center gap-2 w-fit transition-transform group-hover:scale-105">
                    See Details
                    <ArrowRight className="h-5 w-5 shrink-0" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
