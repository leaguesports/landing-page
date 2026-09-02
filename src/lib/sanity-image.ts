import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function hasImageIdentity(value: unknown): boolean {
  const obj = asRecord(value);
  if (!obj) return false;
  return (
    nonEmptyString(obj._ref) ||
    nonEmptyString(obj._id) ||
    nonEmptyString(obj.url) ||
    nonEmptyString(obj.path) ||
    nonEmptyString(obj.assetId)
  );
}

/** True when Sanity image-url can resolve a URL without throwing. */
export function isUsableSanityImageSource(
  source: unknown,
): source is SanityImageSource {
  if (nonEmptyString(source)) return true;
  if (hasImageIdentity(source)) return true;
  const obj = asRecord(source);
  if (!obj) return false;
  return hasImageIdentity(obj.asset);
}

export function urlFor(source: SanityImageSource | null | undefined) {
  if (!projectId || !dataset || !isUsableSanityImageSource(source)) return null;
  return createImageUrlBuilder({ projectId, dataset }).image(source);
}

/** Build a Sanity CDN URL only when the source has a real asset. Never throws. */
export function safeSanityImageUrl(source: unknown): string | undefined {
  if (!isUsableSanityImageSource(source)) return undefined;
  try {
    return urlFor(source)?.url() || undefined;
  } catch {
    return undefined;
  }
}
