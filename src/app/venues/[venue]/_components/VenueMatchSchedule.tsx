import {
  mergeVenueUpcomingScreenings,
  type VenueScreeningDisplay,
} from "@/lib/sports/events-path";
import { getUpcomingFixtures } from "@/services/events";
import Link from "next/link";

function formatScreeningWhen(startsAt: string): string {
  const parsed = new Date(startsAt);
  if (!Number.isNaN(parsed.getTime())) {
    const day = parsed.toLocaleDateString("en-ZA", { weekday: "long" });
    const time = parsed.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${day} • ${time}`;
  }
  return startsAt;
}

export async function VenueMatchSchedule({
  venue,
  screenings = [],
}: {
  venue?: {
    slug: string;
    upcoming_screenings?:
      | { title?: string | null; startsAt?: string | null; setupTags?: string[] }[]
      | null;
  } | null;
  screenings?: VenueScreeningDisplay[] | null;
}) {
  const items = mergeVenueUpcomingScreenings(
    venue ?? { slug: "", upcoming_screenings: screenings },
    await getUpcomingFixtures({ limit: 48 }),
  );

  return (
    <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
      <h3 className="mb-5 font-display text-2xl tracking-wide text-white sm:text-3xl">
        🏉 Upcoming Match Screenings
      </h3>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/3 px-4 py-5 text-sm leading-relaxed text-zinc-400">
          Live sports broadcast daily. Contact venue directly via WhatsApp to
          verify specific fixture broadcasts.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li
              key={`${item.title}-${item.startsAt}-${index}`}
              className="border-t border-white/6 pt-4 first:border-t-0 first:pt-0"
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-base font-medium text-white transition-colors hover:text-sky-400"
                >
                  {item.title}
                </Link>
              ) : (
                <p className="text-base font-medium text-white">{item.title}</p>
              )}
              <p className="mt-2 inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                {formatScreeningWhen(item.startsAt)}
              </p>
              {item.setupTags && item.setupTags.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.setupTags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
