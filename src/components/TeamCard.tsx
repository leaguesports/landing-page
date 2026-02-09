import { ChevronRight } from "lucide-react";
import Link from "next/link";

const ACCENT_CLASSES: Record<string, string> = {
    red: "bg-red-500",
    blue: "bg-blue-600",
    silver: "bg-gray-400",
    yellow: "bg-amber-500",
    green: "bg-emerald-600",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    cyan: "bg-cyan-500",
    indigo: "bg-indigo-600",
};

export interface TeamCardProps {
    href: string;
    name: string;
    /** Key from ACCENT_CLASSES (red, blue, silver, yellow, etc.) */
    accent?: keyof typeof ACCENT_CLASSES;
    /** e.g. "Constructor" or team full name */
    subtitle?: string;
}

export function TeamCard({ href, name, accent = "red", subtitle }: TeamCardProps) {
    const barClass = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.red;
    return (
        <Link
            href={href}
            className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5"
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl opacity-80 ${barClass}`} />
            <div className="flex items-start justify-between gap-3 pl-4">
                <div className="min-w-0">
                    <h3 className="font-bold text-lg text-white group-hover:text-white">
                        {name}
                    </h3>
                    {subtitle && (
                        <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>
                    )}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-white/40 transition group-hover:text-white/70 group-hover:translate-x-0.5" strokeWidth={2} />
            </div>
        </Link>
    );
}
