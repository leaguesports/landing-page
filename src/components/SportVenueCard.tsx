import { ChevronRight, MapPin, Tv } from "lucide-react";
import Link from "next/link";

export interface SportVenueCardProps {
  href: string;
  image: string;
  name: string;
  type: string;
  /** Short line e.g. "Showing F1" or "Live every race weekend" */
  showing?: string;
  /** Optional address or area */
  area?: string;
  /** Accent color: orange (default) or emerald */
  accent?: "orange" | "emerald";
  /** Use "light" on white/light page backgrounds so card and text have proper contrast */
  variant?: "dark" | "light";
}

const accentStyles = {
  orange: {
    card: "hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-950/20",
    cardLight: "hover:border-orange-400 hover:shadow-lg hover:shadow-orange-200",
    badge: "bg-orange-500/90",
    mapPin: "text-orange-400/90",
    mapPinLight: "text-orange-600",
    cta: "text-orange-400 group-hover:text-orange-300",
    ctaLight: "text-orange-600 group-hover:text-orange-700",
  },
  emerald: {
    card: "hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-950/20",
    cardLight: "hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-200",
    badge: "bg-emerald-500/90",
    mapPin: "text-emerald-400/90",
    mapPinLight: "text-emerald-600",
    cta: "text-emerald-400 group-hover:text-emerald-300",
    ctaLight: "text-emerald-600 group-hover:text-emerald-700",
  },
} as const;

export function SportVenueCard({
  href,
  image,
  name,
  type,
  showing = "Showing F1",
  area,
  accent = "orange",
  variant = "dark",
}: SportVenueCardProps) {
  const styles = accentStyles[accent];
  const isLight = variant === "light";
  return (
    <Link
      href={href}
      className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${isLight
          ? `border border-zinc-200 bg-white shadow-sm`
          : `border border-white/10 bg-white/5`
        }`}
    >
      <div className="relative aspect-5/3 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-lg ${styles.badge} px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm`}>
            <Tv className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {showing}
          </span>
          <span className={`rounded-lg px-3 py-1.5 text-xs font-medium backdrop-blur-sm ${isLight ? "border border-zinc-300 bg-zinc-100 text-zinc-700" : "border border-white/20 bg-black/40 text-white/90"
            }`}>
            {type}
          </span>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col p-5">
        <h3 className={`font-bold text-lg ${isLight ? "text-zinc-900" : "text-white"}`}>{name}</h3>
        {area && (
          <p className={`mt-1 flex items-center gap-1.5 text-sm ${isLight ? "text-zinc-600" : "text-white/70"}`}>
            <MapPin className={`h-4 w-4 shrink-0 ${isLight ? styles.mapPinLight : styles.mapPin}`} strokeWidth={2} />
            {area}
          </p>
        )}
        <span className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-colors ${isLight ? styles.ctaLight : styles.cta}`}>
          View venue
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
