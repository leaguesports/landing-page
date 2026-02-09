import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface DriverCardProps {
    href: string;
    number: number;
    name: string;
    team: string;
    /** Optional driver image URL */
    image?: string;
}

export function DriverCard({ href, number, name, team, image }: DriverCardProps) {
    return (
        <Link
            href={href}
            className="group relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-950/10 hover:-translate-y-0.5"
        >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover" />
                ) : null}
                <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-white drop-shadow-md">
                    {number}
                </span>
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white group-hover:text-white">
                    {name}
                </h3>
                <p className="text-sm text-white/60">{team}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/40 transition group-hover:text-white/70 group-hover:translate-x-0.5" strokeWidth={2} />
        </Link>
    );
}
