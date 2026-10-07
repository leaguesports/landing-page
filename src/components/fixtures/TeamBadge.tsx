import { watchFixtureFill, watchFixtureInk } from "@/lib/intent/watch-fixture-card";

/** Kit badge used on venue fixture rows and event pages. */
export function TeamBadge({
  code,
  colour,
  role,
}: {
  code: string;
  colour: string | null;
  role: "home" | "away";
}) {
  const fill = watchFixtureFill(colour, role);
  const ink = watchFixtureInk(fill);
  const box = "h-7 w-11 rounded-md text-[11px]";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-bold tracking-wide ${box}`}
      style={{ backgroundColor: fill, color: ink }}
    >
      {code}
    </span>
  );
}
