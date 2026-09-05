import {
  EVENTS_CITY_FILTERS,
  type EventsCityCode,
} from "@/lib/sports/events-city";
import Link from "next/link";

function chipClass(active: boolean): string {
  return `inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    active
      ? "bg-sky-500 text-white"
      : "border border-white/12 text-zinc-300 hover:border-white/20 hover:text-white"
  }`;
}

export function EventsCityFilter({ city }: { city: EventsCityCode | null }) {
  return (
    <nav aria-label="Filter fixtures by city" className="flex flex-wrap gap-2">
      <Link href="/events" className={chipClass(city === null)}>
        All cities
      </Link>
      {EVENTS_CITY_FILTERS.map((item) => (
        <Link
          key={item.code}
          href={`/events?city=${item.code}`}
          className={chipClass(city === item.code)}
        >
          <span>{item.code.toUpperCase()}</span>
          <span className={city === item.code ? "text-white/80" : "text-zinc-500"}>
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
