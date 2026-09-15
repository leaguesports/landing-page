import { venueNameMatchTerm } from "@/lib/search/nameSearch";
import { searchVenuesByName } from "@/services/venueHub";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!venueNameMatchTerm(query)) {
    return NextResponse.json({ venues: [] });
  }

  try {
    const venues = await searchVenuesByName(query);
    return NextResponse.json({ venues });
  } catch {
    return NextResponse.json(
      { venues: [], error: "search_failed" },
      { status: 503 },
    );
  }
}
