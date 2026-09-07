import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`.
 * Manual ops can use `x-ops-key: ${FIXTURE_OPS_KEY}`.
 * Locally, an unset secret stays open for prototyping.
 */
export function isAuthorizedFixtureIngest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const opsKey = process.env.FIXTURE_OPS_KEY?.trim();
  const onVercel = Boolean(process.env.VERCEL_ENV);

  const auth = request.headers.get("authorization") ?? "";
  if (cronSecret && safeEqual(auth, `Bearer ${cronSecret}`)) return true;

  const providedOps = request.headers.get("x-ops-key") ?? "";
  if (opsKey && safeEqual(providedOps, opsKey)) return true;

  if (!onVercel && !cronSecret && !opsKey) return true;
  return false;
}
