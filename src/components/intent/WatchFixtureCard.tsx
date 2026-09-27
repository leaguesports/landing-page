import {
  watchFixtureFill,
  watchFixtureInk,
  type WatchFixtureFace,
  type WatchFixtureSide,
} from "@/lib/intent/watch-fixture-card";

/**
 * Pill-sandwich fixture card. Initials on split colour blocks — no crest image.
 * The centre slot renders one cluster: the kickoff clock, or score–status–score.
 */
export function WatchFixtureCard({
  fixtureKey,
  title,
  face,
  sportLabel,
  pressed,
  onSelect,
}: {
  fixtureKey: string;
  title: string;
  face: WatchFixtureFace;
  sportLabel: string | null;
  pressed: boolean;
  onSelect: () => void;
}) {
  const paired = Boolean(face.home && face.away);
  const homeFill = watchFixtureFill(face.home?.primaryColour, "home");
  const awayFill = watchFixtureFill(face.away?.primaryColour, "away");
  const accessible = [
    sportLabel,
    paired ? `${face.home?.name} versus ${face.away?.name}` : title,
    face.topPill,
    face.centre.kind === "score" ? face.centre.label : null,
    face.bottomPill,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={accessible}
      data-watch-fixture={fixtureKey}
      data-fixture-centre={face.centre.kind}
      data-fixture-sides={face.sidesSource}
      onClick={onSelect}
      className={`relative isolate flex min-h-[132px] w-full flex-col justify-between overflow-hidden rounded-2xl px-1 py-2.5 text-left ${
        pressed
          ? "ring-2 ring-inset ring-emerald-400"
          : "ring-1 ring-inset ring-white/20 hover:ring-white/40"
      }`}
    >
      {paired ? (
        <>
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1/2"
            style={halfStyle(homeFill, face.home)}
          />
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 w-1/2"
            style={halfStyle(awayFill, face.away)}
          />
        </>
      ) : (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: homeFill }}
        />
      )}

      {sportLabel ? (
        <span className="relative z-10 mb-1 self-center rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          {sportLabel}
        </span>
      ) : null}

      <span className="relative z-10 self-center rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-white">
        {face.topPill}
      </span>

      {paired && face.home && face.away ? (
        <span className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5">
          <Initials side={face.home} fill={homeFill} />
          <Centre label={face.centre.label} />
          <Initials side={face.away} fill={awayFill} />
        </span>
      ) : (
        <span className="relative z-10 flex items-center gap-3 py-3">
          <span className="min-w-0 flex-1 font-display text-2xl leading-none tracking-wide text-white">
            {title}
          </span>
          <Centre label={face.centre.label} />
        </span>
      )}

      {face.bottomPill ? (
        <span className="relative z-10 self-center rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white">
          {face.bottomPill}
        </span>
      ) : null}
    </button>
  );
}

function halfStyle(
  fill: string,
  side: WatchFixtureSide | null,
): { backgroundColor: string; boxShadow?: string } {
  const edge =
    side?.secondaryColour && side.secondaryColour !== fill
      ? side.secondaryColour
      : null;
  return {
    backgroundColor: fill,
    ...(edge ? { boxShadow: `inset 0 0 0 3px ${edge}` } : {}),
  };
}

function Initials({
  side,
  fill,
}: {
  side: WatchFixtureSide;
  fill: string;
}) {
  const ink = watchFixtureInk(fill);
  return (
    <span
      className="text-center font-display text-4xl leading-none tracking-[0.12em]"
      style={{
        color: ink,
        textShadow: ink === "#ffffff" ? "0 1px 2px rgba(0,0,0,0.35)" : undefined,
      }}
    >
      {side.shortCode}
    </span>
  );
}

function Centre({ label }: { label: string }) {
  return (
    <span className="min-w-16 rounded-lg bg-black/45 px-2.5 py-1.5 text-center text-sm font-bold tabular-nums text-white">
      {label}
    </span>
  );
}
