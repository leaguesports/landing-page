import { Calendar, Clock, Eye } from "lucide-react";
import Link from "next/link";

interface WatchCardProps {
    href: string;
    image: string;
    title: string;
    date: string;
    time: string;
    sport: string;
}

export function WatchCard({ href, image, title, date, time, sport }: WatchCardProps) {
    return (
        <Link
            href={href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
        >
            {/* Header */}
            <div className="p-4 space-y-2 flex flex-col gap-2">
                <span className="border-1 border-white/10 rounded-full px-2 py-1 text-xs text-white/60 w-fit">{sport}</span>
                <span className="text-lg font-bold text-white">{title}</span>
            </div>
            <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-black/50 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
            <div className="relative">
                <div className="overflow-hidden bg-white/5">
                    <img
                        className="h-50 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={image}
                        alt={title}
                    />
                </div>
                <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="h-4 w-4 shrink-0" strokeWidth={2} />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <Clock className="h-4 w-4 shrink-0" strokeWidth={2} />
                        <span>{time}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 p-4">
                    <div className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4 shrink-0" strokeWidth={2} />
                        <span className="text-sm font-semibold text-white">82</span>
                    </div>
                    <span className="text-sm text-white/50 transition-colors group-hover:text-white">
                        View Details →
                    </span>
                </div>
            </div>
        </Link>
    )
}