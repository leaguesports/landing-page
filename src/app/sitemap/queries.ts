/** Sitemap GROQ. `updatedAt` is the published document `_updatedAt`. */

export const SITEMAP_VENUES_QUERY = `*[_type == "venue" && defined(slug.current)] {
  "slug": slug.current,
  "updatedAt": _updatedAt
}`;

export const SITEMAP_GUIDES_QUERY = `*[_type == "guide" && defined(slug.current) && slug.current != ""] {
  "slug": slug.current,
  "updatedAt": _updatedAt
}`;

export const SITEMAP_EVENTS_QUERY = `*[_type == "event" && defined(title)] {
  title,
  "slug": slug.current,
  "startsAt": coalesce(startDateTime, startsAt, f1Details.dateTime),
  "updatedAt": _updatedAt,
  seoIntro,
  localAngle,
  "faqs": faqs[]{ question, answer }
}`;

export const SITEMAP_METRO_PAGES_QUERY = `*[
  _type == "metroPage" &&
  intent == $intent &&
  defined(activitySlug) &&
  defined(citySlug)
] {
  intent,
  activitySlug,
  citySlug,
  "updatedAt": _updatedAt
}`;

export const SITEMAP_SPORTS_QUERY = `*[_type == "sport" && defined(slug.current)] {
  "kind": "sport",
  "slug": slug.current,
  "updatedAt": _updatedAt
}`;

export const SITEMAP_SERIES_QUERY = `*[_type == "series" && defined(slug.current)] {
  "kind": "series",
  "slug": slug.current,
  "sportSlug": sport->slug.current,
  "updatedAt": _updatedAt
}`;

export const SITEMAP_LOCATIONS_QUERY = `*[_type == "location" && defined(slug.current)] {
  "kind": "location",
  "slug": slug.current,
  "locationType": type,
  "parentSlug": parent->slug.current,
  "updatedAt": _updatedAt
}`;

/** Venues that can list an event, plus the fields needed to rebuild metro hubs. */
export const REVALIDATE_VENUE_PROJECTION = `{
  "slug": slug.current,
  upcoming_screenings[]{ title, startsAt },
  "broadcasts": broadcasts[]->slug.current,
  "sports": sports[]->slug.current,
  "locationSlug": coalesce(
    location->slug.current,
    address.suburb->slug.current,
    address.city->slug.current
  ),
  "parentSlug": location->parent->slug.current,
  "suburbSlug": address.suburb->slug.current,
  "citySlug": address.city->slug.current
}`;

export const REVALIDATE_VENUES_WITH_SCREENINGS_QUERY = `*[
  _type == "venue" &&
  defined(slug.current) &&
  count(upcoming_screenings) > 0
] ${REVALIDATE_VENUE_PROJECTION}`;

export const REVALIDATE_VENUES_IN_LOCATION_QUERY = `*[
  _type == "venue" &&
  defined(slug.current) &&
  (
    location->slug.current == $slug ||
    location->parent->slug.current == $slug ||
    address.suburb->slug.current == $slug ||
    address.city->slug.current == $slug
  )
] ${REVALIDATE_VENUE_PROJECTION}`;

export const REVALIDATE_METRO_FOR_ACTIVITY_QUERY = `*[
  _type == "metroPage" &&
  activitySlug == $slug
] {
  intent,
  activitySlug,
  citySlug
}`;
