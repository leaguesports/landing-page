import {
  EVENTS_CITY_FILTERS,
  type EventsCityCode,
} from "@/lib/sports/events-city";
import { eventsListHref } from "@/lib/events/scope";
import Link from "next/link";

function chipClass(active: boolean): string {
  return `inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
    active
      ? "bg-white/12 text-white"
      : "border border-white/10 text-zinc-400 hover:border-white/16 hover:text-white"
  }`;
}

export function EventsCityFilter({
  city,
  sport,
}: {
  city: EventsCityCode | null;
  sport?: string | null;
}) {
  return (
    <nav
      aria-label="Filter fixtures by city"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Link
        href={eventsListHref({ sport })}
        className={chipClass(city === null)}
      >
        All cities
      </Link>
      {EVENTS_CITY_FILTERS.map((item) => (
        <Link
          key={item.code}
          href={eventsListHref({ sport, city: item.code })}
          className={chipClass(city === item.code)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
