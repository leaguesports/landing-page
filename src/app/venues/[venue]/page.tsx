import {
  VenueContactActions,
  VenueUtilityBadges,
} from "@/components/VenueUtilityBadges";
import { ConversionKit } from "@/components/conversion/ConversionKit";
import { CoverageNotify } from "@/components/conversion/CoverageNotify";
import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import { selectCtaMatrix } from "@/lib/conversion/cta-matrix";
import { missingObjectOgTitle } from "@/lib/conversion/deep-links";
import {
  isRemoteVenuePhoto,
  sanityImageUrl,
  venuePhotoUrl,
} from "@/lib/venues/photo";
import {
  getVenueBySlug,
  hasVenueCoordinates,
  resolveVenueImage,
  type VenueDetail,
} from "@/services/venues";
import { ensureVenueFromCms } from "@/lib/venues/appVenueApi";
import { toGolfVenueOption } from "@/lib/golf/venue-options";
import { isVenueClaimable, hasVenueWhatsAppContact, resolveVenueWhatsAppCta } from "@/lib/venues/contact-cta";
import {
  venueAmenitiesDescription,
  venueDetailChrome,
  venueDetailKind,
  venueDetailMetaDescription,
  venueDetailNavLinks,
  venueSportsSectionCopy,
  venueStayCloseCopy,
} from "@/lib/venues/detail-ia";
import { venueQuickStartActivities } from "@/lib/venues/quick-start";
import { VenueClaimBar } from "./_components/VenueClaimBar";
import { VenueFollowButton } from "./_components/VenueFollowButton";
import { VenueFriendsPlayed } from "./_components/VenueFriendsPlayed";
import { VenueLeaderboardSection } from "@/components/venue-leaderboards/VenueLeaderboardSection";
import { venueLeaderboardPlayHref } from "@/lib/venue-leaderboards/boards";
import { VenueMatchHistory } from "./_components/VenueMatchHistory";
import { VenueMatchSchedule } from "./_components/VenueMatchSchedule";
import { VenueMap } from "./_components/VenueMap";
import { VenueQuickStart } from "./_components/VenueQuickStart";
import { VenueSportChips } from "./_components/VenueSportChips";
import { buildVenueJsonLd } from "./_components/venueJsonLd";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ChevronRight, Flag, MapPin, Star } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { after } from "next/server";
