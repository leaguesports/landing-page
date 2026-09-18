import type { VenueDetailChrome, VenueDetailKind } from "@/lib/venues/detail-ia";
import type { VenueQuickStartActivity } from "@/lib/venues/quick-start";
import type { VenueDetail } from "@/services/venues";
import { VenueCmsBody } from "./VenueCmsBody";
import { VenuePlayWatchBody } from "./VenuePlayWatchBody";

export async function VenuePageSections({
  venue,
  kind,
  chrome,
  sportsCopy,
  quickStartActivities,
  primaryQuickStart,
  mapsSearchUrl,
  addressLine,
  citySlug,
  initialBoard,
  initialWindow,
  showClaimBar,
}: {
  venue: VenueDetail;
  kind: VenueDetailKind;
  chrome: VenueDetailChrome;
  sportsCopy: { title: string; description: string };
  quickStartActivities: VenueQuickStartActivity[];
  primaryQuickStart?: VenueQuickStartActivity;
  mapsSearchUrl: string;
  addressLine: string;
  citySlug: string;
  initialBoard?: string | null;
  initialWindow?: string | null;
  showClaimBar: boolean;
}) {
  return (
    <>
      <VenuePlayWatchBody
        venue={venue}
        chrome={chrome}
        sportsCopy={sportsCopy}
        quickStartActivities={quickStartActivities}
        primaryQuickStart={primaryQuickStart}
        citySlug={citySlug}
        initialBoard={initialBoard}
        initialWindow={initialWindow}
      />
      <VenueCmsBody
        venue={venue}
        kind={kind}
        mapsSearchUrl={mapsSearchUrl}
        addressLine={addressLine}
        showClaimBar={showClaimBar}
      />
    </>
  );
}
