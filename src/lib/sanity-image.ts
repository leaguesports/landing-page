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

export type SanityImageUrlOptions = {
  width?: number;
  height?: number;
};

/** Crop params so @sanity/image-url applies hotspot/crop when both sides are set. */
export function sanityImageCropParams(options?: SanityImageUrlOptions): {
  width?: number;
  height?: number;
  fit?: "crop";
} {
  if (!options?.width && !options?.height) return {};
  return {
    ...(options.width ? { width: options.width } : {}),
    ...(options.height ? { height: options.height } : {}),
    ...(options.width && options.height ? { fit: "crop" as const } : {}),
  };
}

export function sanityImageAssetId(source: unknown): string | null {
  const obj = asRecord(source);
  if (!obj) return null;
  if (nonEmptyString(obj._ref)) return obj._ref;
  if (nonEmptyString(obj._id)) return obj._id;
  const nested = asRecord(obj.image);
  const asset = asRecord(obj.asset) ?? asRecord(nested?.asset);
  if (asset) {
    if (nonEmptyString(asset._ref)) return asset._ref;
    if (nonEmptyString(asset._id)) return asset._id;
  }
  if (nested) return sanityImageAssetId(nested);
  return null;
}

/** CSS object-position from a Sanity hotspot (0–1 x/y). */
export function sanityHotspotObjectPosition(source: unknown): string | undefined {
  const obj = asRecord(source);
  if (!obj) return undefined;
  const hotspot =
    asRecord(obj.hotspot) ?? asRecord(asRecord(obj.image)?.hotspot);
  if (!hotspot) return undefined;
  if (typeof hotspot.x !== "number" || typeof hotspot.y !== "number") {
    return undefined;
  }
  const x = Math.min(100, Math.max(0, hotspot.x * 100));
  const y = Math.min(100, Math.max(0, hotspot.y * 100));
  return `${x}% ${y}%`;
}

/** Build a Sanity CDN URL only when the source has a real asset. Never throws. */
export function safeSanityImageUrl(
  source: unknown,
  options?: SanityImageUrlOptions,
): string | undefined {
  if (!isUsableSanityImageSource(source)) return undefined;
  try {
    const builder = urlFor(source);
    if (!builder) return undefined;
    const crop = sanityImageCropParams(options);
    let next = builder;
    if (crop.width) next = next.width(crop.width);
    if (crop.height) next = next.height(crop.height);
    if (crop.fit) next = next.fit(crop.fit);
    return next.url() || undefined;
  } catch {
    return undefined;
  }
}
