export function parseSessionKeyParam(raw: string): number | null {
  if (!/^\d{1,8}$/.test(raw.trim())) return null;
  const value = Number(raw.trim());
  if (!Number.isInteger(value) || value < 1) return null;
  return value;
}

export function parseIsoParam(raw: string | null): string | null {
  const text = (raw ?? "").trim();
  if (!text) return null;
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString();
}
