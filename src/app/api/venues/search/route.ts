import { venueHubMatchTerm } from "@/lib/venues/hub";
import { searchVenuesByName } from "@/services/venueHub";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!venueHubMatchTerm(query)) {
    return NextResponse.json({ venues: [] });
  }

  const venues = await searchVenuesByName(query);
  return NextResponse.json({ venues });
}
