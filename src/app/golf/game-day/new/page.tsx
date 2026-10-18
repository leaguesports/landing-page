import { CreateGameDay, type GameDayVenueChoice } from "@/components/golf-game-day/CreateGameDay";
import { isGolfVenue, toGolfVenueOption } from "@/lib/golf/venue-options";
import { ZEBULA_VENUE_SLUG } from "@/lib/golf-game-day/paths";
import { getVenueBySlug, searchVenues } from "@/services/venues";

export const dynamic = "force-dynamic";

export default async function NewGameDayPage() {
  let venues: GameDayVenueChoice[] = [];
  try {
    const [found, zebula] = await Promise.all([
      searchVenues({ intent: "play", sportSlug: "golf" }),
      getVenueBySlug(ZEBULA_VENUE_SLUG),
    ]);
    const rows = zebula && !found.some((venue) => venue.slug === zebula.slug)
      ? [zebula, ...found]
      : found;
    venues = rows
      .map(toGolfVenueOption)
      .filter(isGolfVenue)
      .map((venue) => ({
        id: venue.id,
        slug: venue.slug,
        name: venue.name,
        tees: (venue.golfCourse?.tees ?? []).flatMap((tee) => {
          const name = tee.name?.trim();
          if (!name) return [];
          return [{ name, color: tee.color?.trim() || null }];
        }),
      }))
      .filter((venue) => venue.tees.length > 0);
  } catch {
    venues = [];
  }

  return <CreateGameDay venues={venues} />;
}
