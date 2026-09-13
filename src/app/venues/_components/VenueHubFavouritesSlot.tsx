import { cookies } from "next/headers";
import { getServerAuthState } from "@/lib/server-auth";
import { listFollowedVenues } from "@/lib/venues/follow";
import {
  capVenueHubFavourites,
  shouldLoadVenueHubSession,
} from "@/lib/venues/hub";
import { VenueHubFavourites } from "./VenueHubSections";

/**
 * Session-only favourites. Guests and empty cookie jars skip Railway
 * `/api/auth/me` and the follow list. Public `/venues` does not await this.
 */
export async function VenueHubFavouritesSlot() {
  const cookie = (await cookies()).toString();
  if (!shouldLoadVenueHubSession(cookie)) {
    return <VenueHubFavourites signedIn={false} venues={[]} />;
  }

  const auth = await getServerAuthState();
  if (!auth.isAuthenticated) {
    return <VenueHubFavourites signedIn={false} venues={[]} />;
  }

  const venues = capVenueHubFavourites(await listFollowedVenues({ cookie }));
  return <VenueHubFavourites signedIn venues={venues} />;
}
