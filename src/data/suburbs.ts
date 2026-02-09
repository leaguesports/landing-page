export type SuburbGroup = {
  label: string;
  suburbs: string[];
};

export const SUBURB_GROUPS: SuburbGroup[] = [
  {
    label: "North",
    suburbs: ["Sandton", "Bryanston", "Fourways", "Rosebank"],
  },
  {
    label: "West & Central",
    suburbs: ["Roodepoort", "Randburg", "Midrand"],
  },
  {
    label: "East",
    suburbs: ["Edenvale", "Bedfordview", "Kensington"],
  },
];

export const ALL_SUBURBS = SUBURB_GROUPS.flatMap((g) => g.suburbs);

/** URL slug from display name (e.g. "Sandton" -> "sandton") */
export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

const SLUG_TO_NAME = new Map(
  ALL_SUBURBS.map((name) => [toSlug(name), name])
);

/** Display name from URL slug, or null if invalid */
export function getSuburbNameBySlug(slug: string): string | null {
  return SLUG_TO_NAME.get(slug) ?? null;
}

/** All valid first-segment city slugs for routing */
export const VALID_CITY_SLUGS = new Set(ALL_SUBURBS.map(toSlug));

export function isValidCitySlug(slug: string): boolean {
  return VALID_CITY_SLUGS.has(slug);
}
