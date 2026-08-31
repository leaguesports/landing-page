/** URL slug from display name (e.g. "Sandton" -> "sandton") */
export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}
