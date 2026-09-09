import {
  formatGolfTourStatus,
  formatTourDateRange,
  golfTourHref,
  type PublicGolfTourSummary,
} from "@/lib/golf-tours/golf-tours";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type GolfTourRowProps = {
  tour: PublicGolfTourSummary;
};

export function GolfTourRow({ tour }: GolfTourRowProps) {
  const camps = tour.campCount === 1 ? "1 camp" : `${tour.campCount} camps`;
  const rounds = tour.roundCount === 1 ? "1 round" : `${tour.roundCount} rounds`;

  return (
    <li>
      <Link
        href={golfTourHref(tour.id)}
        className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 transition-colors hover:border-white/16"
      >
        <span className="min-w-0">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            {formatGolfTourStatus(tour.status)} · {camps} · {rounds}
          </span>
          <span className="mt-1 block truncate text-sm font-medium text-white">
            {tour.name}
          </span>
          <span className="mt-0.5 block truncate text-xs text-zinc-500">
            {formatTourDateRange(tour.startDate, tour.endDate)}
          </span>
        </span>
        <span className="mt-1 flex shrink-0 items-center gap-1 self-center rounded-full border border-white/12 px-3 py-2 text-xs font-medium text-zinc-200">
          Open
          <ArrowUpRight className="h-4 w-4 text-zinc-500" aria-hidden />
        </span>
      </Link>
    </li>
  );
}
