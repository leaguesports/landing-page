import { Calendar, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

export interface RaceCardProps {
    href: string;
    image: string;
    title: string;
    round: string;
    date: string;
    location?: string;
    badge?: string;
}

export function RaceCard({ href, image, title, round, date, location, badge }: RaceCardProps) {
    return (
        <Link
            href={href}
            className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-white/5 transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-950/20 hover:-translate-y-0.5"
        >
            <div className="relative aspect-4/3 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent" />
                {/* Round badge */}
                <div className="absolute left-4 top-4">
                    <span className="inline-flex items-center rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        {round}
                    </span>
                </div>
                {badge && (
                    <div className="absolute right-4 top-4">
                        <span className="inline-flex items-center rounded-lg border border-white/30 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                            {badge}
                        </span>
                    </div>
                )}
            </div>
            <div className="relative flex flex-1 flex-col p-5">
                <h3 className="font-bold text-lg text-white group-hover:text-white">
                    {title}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 shrink-0 text-red-400/90" strokeWidth={2} />
                        {date}
                    </span>
                    {location && (
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 shrink-0 text-red-400/90" strokeWidth={2} />
                            {location}
                        </span>
                    )}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-400 transition-colors group-hover:text-red-300">
                    View schedule
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </span>
            </div>
        </Link>
    );
}
