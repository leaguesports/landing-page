import { deepLinkRecovery, type DeepLinkKind } from "@/lib/conversion/deep-links";
import Link from "next/link";

export function DeepLinkRecovery({
  kind,
  objectName,
  startHref,
}: {
  kind: DeepLinkKind;
  objectName?: string | null;
  startHref?: string | null;
}) {
  const recovery = deepLinkRecovery({ kind, objectName, startHref });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {recovery.kind === "scorecard"
          ? "Scorecard"
          : recovery.kind === "organise"
            ? "Organised game"
            : recovery.kind === "event"
              ? "Event"
              : recovery.kind === "venue"
                ? "Venue"
                : "Team"}
      </p>
      <h1 className="font-display max-w-lg text-4xl tracking-wide text-white">
        {recovery.title}
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-zinc-400">
        {recovery.body}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={recovery.primary.href}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          {recovery.primary.label}
        </Link>
        <Link
          href={recovery.secondary.href}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white hover:text-zinc-950"
        >
          {recovery.secondary.label}
        </Link>
      </div>
    </div>
  );
}
