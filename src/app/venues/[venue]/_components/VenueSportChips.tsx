import { venueIntentChipHref } from "@/lib/venues/chips";
import type { VenueDetail } from "@/services/venues";
import Link from "next/link";

const chipClassName =
  "inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white";

type ChipItem = {
  _id: string;
  name: string;
  slug?: string | null;
};

export function VenueSportChips({
  intent,
  items,
  venue,
}: {
  intent: "watch" | "play";
  items: ChipItem[];
  venue: Pick<VenueDetail, "address">;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => {
        const href = venueIntentChipHref(intent, item.slug, venue.address);
        return (
          <li key={item._id}>
            {href ? (
              <Link href={href} className={chipClassName}>
                {item.name}
              </Link>
            ) : (
              <span className="inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-zinc-300">
                {item.name}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
