/** Decorative padel scorecard preview for marketing surfaces. */
export function HomeScorecardPreview({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#101410]/90 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md ${className}`}
      aria-hidden
    >
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Live · Padel
          </p>
          <p className="mt-0.5 text-sm font-medium text-white">Court 3 · Green Point</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Set 2
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-white/8">
        <div className="px-4 py-5">
          <p className="text-xs text-zinc-500">You &amp; Sam</p>
          <p className="mt-2 font-display text-5xl tracking-wide text-white">6</p>
          <p className="mt-1 text-xs text-zinc-500">Games</p>
        </div>
        <div className="px-4 py-5">
          <p className="text-xs text-zinc-500">Alex &amp; Jordan</p>
          <p className="mt-2 font-display text-5xl tracking-wide text-zinc-400">4</p>
          <p className="mt-1 text-xs text-zinc-500">Games</p>
        </div>
      </div>

      <div className="border-t border-white/8 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Point</span>
          <span className="font-display text-lg tracking-wide text-emerald-300">
            40 — 30
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className="h-full w-[62%] rounded-full bg-emerald-400" />
        </div>
      </div>
    </div>
  );
}
