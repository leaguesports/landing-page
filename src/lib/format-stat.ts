/** Grouped decimal for homepage tiles. Exact count — no marketing + suffix. */
export function formatStat(value: number): string {
  const count =
    typeof value === "number" && Number.isFinite(value) && value > 0
      ? Math.floor(value)
      : 0;
  return count.toLocaleString("en-US");
}
