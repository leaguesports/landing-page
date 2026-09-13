import {
  type EventsSportChip,
} from "@/lib/events/scope";
import Link from "next/link";

function chipClass(active: boolean): string {
  return `inline-flex min-h-9 shrink-0 items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    active
      ? "bg-sky-500 text-white"
      : "border border-white/12 text-zinc-300 hover:border-white/20 hover:text-white"
  }`;
}

export function EventsSportFilter({ chips }: { chips: EventsSportChip[] }) {
  return (
    <nav
      aria-label="Filter fixtures by sport"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {chips.map((chip) => (
        <Link
          key={chip.slug ?? "all"}
          href={chip.href}
          className={chipClass(chip.active)}
        >
          {chip.label}
        </Link>
      ))}
    </nav>
  );
}
