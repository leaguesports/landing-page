/**
 * A small calendar-card badge for event dates. Distinctive style: month strip + large day.
 */
interface EventCalendarBadgeProps {
  month: string;
  day: number;
  className?: string;
}

export function EventCalendarBadge({ month, day, className = "" }: EventCalendarBadgeProps) {
  return (
    <div
      className={`overflow-hidden rounded-md border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm ${className}`}
      aria-hidden
    >
      <div className="bg-emerald-500/90 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-white">
          {month}
        </span>
      </div>
      <div className="flex items-center justify-center px-3 py-1 bg-white">
        <span className="text-sm font-bold tabular-nums text-black drop-shadow-sm">
          {day}
        </span>
      </div>
    </div>
  );
}
