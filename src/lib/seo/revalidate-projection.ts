/**
 * Sanity webhook (project 4m59yeu0, dataset production).
 * Trigger on create, update, and delete. The filter drops drafts, so a
 * publish/unpublish of the published document is what fires.
 */
export const SANITY_REVALIDATE_FILTER = `_type in ["event", "venue", "guide", "metroPage", "sport", "series", "location"] && !(_id in path("drafts.**"))`;

export const SANITY_REVALIDATE_PROJECTION = `{
  "_id": _id,
  "_type": _type,
  "slug": coalesce(after().slug.current, before().slug.current),
  "title": coalesce(after().title, before().title, after().name, before().name, after().h1, before().h1),
  "name": coalesce(after().name, before().name),
  "startsAt": coalesce(
    after().startDateTime,
    after().startsAt,
    after().f1Details.dateTime,
    before().startDateTime,
    before().startsAt,
    before().f1Details.dateTime
  ),
  "intent": coalesce(after().intent, before().intent),
  "activitySlug": coalesce(after().activitySlug, before().activitySlug),
  "citySlug": coalesce(after().citySlug, before().citySlug),
  "sportSlug": coalesce(after().sport->slug.current, before().sport->slug.current),
  "locationType": coalesce(after().type, before().type),
  "parentSlug": coalesce(after().parent->slug.current, before().parent->slug.current),
  "hostVenue": coalesce(after().hostVenue->slug.current, before().hostVenue->slug.current),
  "relatedGuide": coalesce(after().relatedGuide->slug.current, before().relatedGuide->slug.current),
  "screenings": coalesce(after().upcoming_screenings, before().upcoming_screenings)[]{ title, startsAt },
  "broadcasts": coalesce(after().broadcasts, before().broadcasts)[]->slug.current,
  "sports": coalesce(after().sports, before().sports)[]->slug.current,
  "venueLocations": {
    "locationSlug": coalesce(
      after().location->slug.current,
      before().location->slug.current,
      after().address.suburb->slug.current,
      before().address.suburb->slug.current,
      after().address.city->slug.current,
      before().address.city->slug.current
    ),
    "parentSlug": coalesce(after().location->parent->slug.current, before().location->parent->slug.current),
    "suburbSlug": coalesce(after().address.suburb->slug.current, before().address.suburb->slug.current),
    "citySlug": coalesce(after().address.city->slug.current, before().address.city->slug.current)
  }
}`;

export const SANITY_REVALIDATE_URL = "https://leaguesports.co.za/api/revalidate";
