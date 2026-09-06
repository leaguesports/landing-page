import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Ops / provider writes require FIXTURE_OPS_KEY whenever running on Vercel
 * (preview + production). Locally, an unset key stays open for prototyping.
 */
export function isAuthorizedFixtureOps(request: Request): boolean {
  const expected = process.env.FIXTURE_OPS_KEY?.trim();
  const onVercel = Boolean(process.env.VERCEL_ENV);

  if (!expected) {
    return !onVercel;
  }

  const provided = request.headers.get("x-ops-key") ?? "";
  return safeEqual(provided, expected);
}
