import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { VenueLeaderboardSection } from "@/components/venue-leaderboards/VenueLeaderboardSection";
import { toGolfVenueOption } from "@/lib/golf/venue-options";
import { isVenueClaimable } from "@/lib/venues/contact-cta";
import { scoreboardHeroImage } from "@/lib/venues/gallery";
import {
  venueContactLinks,
  venueCourtFacility,
  venueHoursLine,
  venuePlayPlace,
  venueUsesPadelScoreboard,
  type VenueContactLink,
} from "@/lib/venues/page-template";
import { padelNewHref, venueQuickStartActivities } from "@/lib/venues/quick-start";
import {
  venueShowsLeaderboards,
  venueShowsMatchHistory,
  venueSupportsPlayResults,
} from "@/lib/venues/play-chrome";
import { isRemoteVenuePhoto, sanityImageUrl } from "@/lib/venues/photo";
import {
  venueDirectoryLinks,
  venueFacilityChips,
  venueProfileAbout,
  venueProfileCrumbs,
  venueProfileEyebrow,
  venueProfileFaqs,
  venueProfileHeadings,
  venueProfileKind,
  venueProfileLede,
} from "@/lib/venues/profile-seo";
import type { VenueLockedResult } from "@/lib/venues/locked-results";
import type { WatchVenueWeek } from "@/lib/venues/watch-week";
import { venueLeaderboardPlayHref } from "@/lib/venue-leaderboards/boards";
import { hasVenueCoordinates, type VenueDetail } from "@/services/venues";
import type { NearbyVenueCard } from "@/services/venues";
import { SportIcon } from "@/components/icons/sports";
import { ChevronRight, Globe, Mail, MapPin, MessageCircle, Phone, Star, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { VenueAbout } from "./VenueAbout";
import { VenueClaimBar } from "./VenueClaimBar";
import { VenueFixtureRows } from "./VenueFixtureRows";
import { VenueFollowButton } from "./VenueFollowButton";
import { VenueFriendsPlayed } from "./VenueFriendsPlayed";
import { VenueMap } from "./VenueMap";
import { VenueMatchHistory } from "./VenueMatchHistory";
import { VenueSectionNav } from "./VenueSectionNav";

const FILLED =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800";
const OUTLINE =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-950";
const ICON =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-900 transition-colors hover:border-zinc-950";

function StartSportIcon({ sportSlug }: { sportSlug: string }) {
  if (sportSlug === "darts") return <Target className="h-6 w-6" aria-hidden />;
  return <SportIcon sportSlug={sportSlug} size={24} color="currentColor" />;
}

function ContactIcon({ kind }: { kind: VenueContactLink["kind"] }) {
  const className = "h-4 w-4";
  if (kind === "phone") return <Phone className={className} aria-hidden />;
  if (kind === "email") return <Mail className={className} aria-hidden />;
  if (kind === "website") return <Globe className={className} aria-hidden />;
  return <MessageCircle className={className} aria-hidden />;
}

function Block({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mt-8 scroll-mt-40 border-t border-zinc-200 pt-8 sm:mt-10"
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`} className="max-w-full font-display text-3xl tracking-wide text-zinc-950">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function addressLines(venue: VenueDetail): string[] {
  const { street, suburb, city, province, postcode } = venue.address;
  const lines: string[] = [];
  const streetLine = street?.trim() ?? "";
  const suburbLine = suburb?.trim() ?? "";
  const cityLine = [city?.trim(), postcode?.trim()].filter(Boolean).join(" ");
  const provinceLine = province?.trim() ?? "";
  if (streetLine) lines.push(streetLine);
  if (suburbLine && suburbLine.toLowerCase() !== streetLine.toLowerCase()) {
    lines.push(suburbLine);
  }
  if (cityLine && cityLine.toLowerCase() !== suburbLine.toLowerCase()) {
    lines.push(cityLine);
  }
  if (
    provinceLine &&
    provinceLine.toLowerCase() !== city?.trim().toLowerCase() &&
    provinceLine.toLowerCase() !== suburbLine.toLowerCase()
  ) {
    lines.push(provinceLine);
  }
  return lines;
}

function VenuePhoto({
  src,
  alt,
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
}) {
  if (isRemoteVenuePhoto(src)) {
    return (
      <Image src={src} alt={alt} fill priority={priority} className="object-cover" sizes={sizes} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
  );
}

function VenuePhotos({ venue, place }: { venue: VenueDetail; place: string }) {
  const hero = scoreboardHeroImage(venue);
  const heroUrl = hero ? sanityImageUrl(hero, { width: 1600, height: 900 }) : undefined;
  const thumbs = (venue.gallery ?? [])
    .map((item) => ({
      alt: item.alt?.trim() || venue.name,
      url: sanityImageUrl(item.image, { width: 800, height: 600 }),
    }))
    .filter((item): item is { alt: string; url: string } => Boolean(item.url));
  const main = heroUrl ?? thumbs[0]?.url;
  if (!main) return null;
  const alt = `${venue.name}${place ? ` in ${place}` : ""}`;
  const usingGalleryHero = hero === venue.gallery?.[0]?.image;
  const rest = (usingGalleryHero ? thumbs.slice(1) : thumbs).slice(0, 4);
  const frame = "relative overflow-hidden rounded-2xl bg-zinc-100";

  if (rest.length === 0) {
    return (
      <div className={`${frame} mt-8 aspect-[2/1]`}>
        <VenuePhoto src={main} alt={alt} priority sizes="(min-width: 1280px) 1152px, 100vw" />
      </div>
    );
  }

  return (
    <div className="mt-8 grid items-stretch gap-2 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <div className={`${frame} aspect-[16/10] lg:aspect-auto lg:min-h-72`}>
        <VenuePhoto src={main} alt={alt} priority sizes="(min-width: 1024px) 760px, 100vw" />
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {rest.map((thumb) => (
          <li key={thumb.url} className={`${frame} aspect-[4/3]`}>
            <VenuePhoto src={thumb.url} alt={thumb.alt} sizes="(min-width: 1024px) 280px, 50vw" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function VenueProfile({
  venue,
  mapsUrl,
  jsonLd,
  week,
  nearby,
  results,
  initialBoard,
  initialWindow,
}: {
  venue: VenueDetail;
  mapsUrl: string;
  jsonLd: unknown;
  week: WatchVenueWeek | null;
  nearby: NearbyVenueCard[];
  results: VenueLockedResult[];
  initialBoard?: string;
  initialWindow?: string;
}) {
  const kind = venueProfileKind(venue);
  const headings = venueProfileHeadings(venue);
  const place = venuePlayPlace(venue.address);
  const lines = addressLines(venue);
  const about = venueProfileAbout(venue.description);
  const chips = venueFacilityChips(venue);
  const sports = venueDirectoryLinks(venue);
  const faqs = venueProfileFaqs(venue);
  const hours = venueHoursLine(venue);
  const crumbs = venueProfileCrumbs(venue);
  const contacts = venueContactLinks(venue);
  const activities = venueQuickStartActivities(toGolfVenueOption(venue));
  const startLinks = activities.map((activity) => ({
    href: activity.href,
    label: activity.cta,
    name: activity.name,
    description: activity.description,
    sportSlug: activity.sportSlug,
  }));
  if (
    venueUsesPadelScoreboard(venue) &&
    !startLinks.some((link) => link.href.includes("/padel/"))
  ) {
    startLinks.unshift({
      href: padelNewHref(venue.slug),
      label: "Start padel match",
      name: "Padel",
      description: "Open a live scorecard at this court.",
      sportSlug: "padel",
    });
  }
  const primaryStart = kind === "play" || kind === "hybrid" ? startLinks[0] : undefined;
  const showWatch = kind === "watch" || kind === "hybrid";
  const showPlay = (kind === "play" || kind === "hybrid") && (primaryStart || results.length > 0);
  const showBook = contacts.length > 0 || (showPlay && startLinks.length > 0);
  const showHistory = showPlay && venueShowsMatchHistory(venue);
  const showBoards = showPlay && venueShowsLeaderboards(venue);
  const primarySport = primaryStart?.sportSlug ?? null;
  const sectionTabs = [
    about.length > 0 ? { id: "about", label: "About" } : null,
    showBook ? { id: "book", label: "Book" } : null,
    showPlay ? { id: "play", label: "Play" } : null,
    showWatch && week ? { id: "fixtures", label: "Fixtures" } : null,
    faqs.length > 0 ? { id: "questions", label: "Questions" } : null,
    sports.length > 0 ? { id: "sports", label: "Sports" } : null,
    showHistory ? { id: "match-history", label: "Results" } : null,
    venueSupportsPlayResults(venue) ? { id: "friends-played", label: "Friends" } : null,
    showBoards ? { id: "leaderboards", label: "Boards" } : null,
    nearby.length > 0 ? { id: "nearby", label: "Nearby" } : null,
  ].filter((tab): tab is { id: string; label: string } => tab !== null);

  return (
    <div data-venue-kind={kind}>
      <DeepLinkLand pageType="venue" slug={venue.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white pb-24 text-zinc-950">
        <article>
          <div className="mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:px-8">
          <header>
            <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {crumbs.map((crumb, index) => {
                  const last = index === crumbs.length - 1;
                  return (
                    <li key={crumb.path} className="flex items-center gap-2">
                      {index > 0 ? <span aria-hidden>/</span> : null}
                      {last ? (
                        <span className="text-zinc-800">{headings.shortName}</span>
                      ) : (
                        <Link href={crumb.path} className="hover:text-zinc-950">
                          {crumb.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
              {venueProfileEyebrow(venue)}
            </p>
            <h1 className="mt-2 font-display text-5xl tracking-wide text-zinc-950 sm:text-7xl">
              {headings.shortName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
              {typeof venue.rating === "number" ? (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
                  <span>{venue.rating.toFixed(1)}</span>
                </p>
              ) : null}
              {venue.is_verified ? (
                <p className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
                  Verified
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={FILLED}
              >
                <MapPin className="mr-1.5 h-4 w-4" aria-hidden />
                Directions
              </a>
              {contacts.map((link) => (
                <a
                  key={link.kind}
                  href={link.href}
                  className={ICON}
                  aria-label={link.label}
                  title={link.label}
                  {...(link.kind === "phone" || link.kind === "email"
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <ContactIcon kind={link.kind} />
                </a>
              ))}
              <VenueFollowButton
                venueCmsId={venue._id}
                venueName={venue.name}
                venueSlug={venue.slug}
                variant="secondary"
              />
            </div>
          </header>
          </div>

          <VenueSectionNav tabs={sectionTabs} />

          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
          <VenuePhotos venue={venue} place={place} />

          <div className="mt-10 grid w-full min-w-0 grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-12">
          <div className="min-w-0 overflow-x-clip">
          <p className="text-lg leading-relaxed text-zinc-700">{venueProfileLede(venue)}</p>

          {about.length > 0 ? (
            <Block id="about" title={headings.about}>
              <VenueAbout paragraphs={about} />
            </Block>
          ) : null}

          {showBook ? (
            <Block id="book" title={headings.book}>
              <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
                {showPlay
                  ? startLinks.map((link) => {
                      const title = link.sportSlug
                        ? link.sportSlug
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (letter) => letter.toUpperCase())
                        : link.label;
                      return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-emerald-800"
                        >
                          <span className="min-w-0">
                            <span className="block text-base font-semibold text-zinc-950">
                              {title}
                            </span>
                            <span className="mt-0.5 block text-sm leading-relaxed text-zinc-600">
                              {link.label} at {headings.shortName}.
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                        </Link>
                      </li>
                      );
                    })
                  : null}
                {contacts.map((link) => {
                  const title =
                    link.kind === "phone"
                      ? "Call"
                      : link.kind === "email"
                        ? "Email"
                        : link.kind === "whatsapp"
                          ? "WhatsApp"
                          : "Website";
                  const description =
                    link.kind === "phone"
                      ? `Call ${headings.shortName} to reserve.`
                      : link.kind === "email"
                        ? `Email ${headings.shortName} to reserve.`
                        : link.kind === "whatsapp"
                          ? `Message ${headings.shortName} on WhatsApp to reserve.`
                          : `Visit the ${headings.shortName} website.`;
                  return (
                    <li key={link.kind}>
                      <a
                        href={link.href}
                        className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-emerald-800"
                        {...(link.kind === "phone" || link.kind === "email"
                          ? {}
                          : { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        <span className="min-w-0">
                          <span className="block text-base font-semibold text-zinc-950">{title}</span>
                          <span className="mt-0.5 block text-sm leading-relaxed text-zinc-600">
                            {description}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Block>
          ) : null}

          {showPlay ? (
            <Block id="play" title={headings.play}>
              {startLinks.length > 0 ? (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {startLinks.map((link) => {
                    const detail =
                      link.sportSlug === "padel"
                        ? venueCourtFacility(venue.description)
                        : null;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-950"
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-zinc-950">
                              <StartSportIcon sportSlug={link.sportSlug} />
                            </span>
                            <span className="font-display text-2xl leading-none tracking-wide text-zinc-950 translate-y-px">
                              {link.name}
                            </span>
                          </span>
                          {detail ? (
                            <span className="mt-1 text-xs font-medium text-zinc-500">{detail}</span>
                          ) : null}
                          <span className="mt-2 text-sm leading-snug text-zinc-600">
                            {link.description}
                          </span>
                          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-zinc-950">
                            {link.label}
                            <ChevronRight
                              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                              aria-hidden
                            />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {results.length > 0 ? (
                <ul className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200">
                  {results.map((result) => (
                    <li key={result.id}>
                      <Link href={result.href} className="block px-4 py-3.5 hover:bg-zinc-50">
                        {result.when ? (
                          <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-800">
                            {result.when}
                          </span>
                        ) : null}
                        <span className="mt-1 block text-sm text-zinc-950">{result.summary}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Block>
          ) : null}

          {showWatch && week ? (
            <Block id="fixtures" title={headings.fixtures}>
              <VenueFixtureRows days={week.days} cards={week.cards} />
            </Block>
          ) : null}

          {faqs.length > 0 ? (
            <Block id="questions" title={headings.faq}>
              <dl className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-2xl border border-zinc-200 px-4 py-4">
                    <dt className="text-sm font-semibold text-zinc-950">{faq.question}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-zinc-600">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          ) : null}

          {sports.length > 0 ? (
            <Block id="sports" title={headings.sports}>
              <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
                {sports.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-emerald-800"
                    >
                      <span className="min-w-0">
                        <span className="block text-base font-semibold text-zinc-950">
                          {link.label}
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-zinc-600">
                          {link.description}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}
          </div>

          <aside className="lg:sticky lg:top-40">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
              {lines.length > 0 ? (
                <address className="text-sm not-italic leading-relaxed text-zinc-700">
                  {lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              ) : null}
              {chips.length > 0 ? (
                <ul className={`${lines.length > 0 ? "mt-4" : ""} flex flex-wrap gap-2`}>
                  {chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full bg-white px-3 py-1 text-sm text-zinc-800 ring-1 ring-zinc-200"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              ) : null}
              {hours ? (
                <p className="mt-4 text-sm leading-relaxed text-zinc-700">
                  <span className="font-semibold text-zinc-950">Hours. </span>
                  {hours}
                </p>
              ) : null}
              {hasVenueCoordinates(venue) ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
                  <VenueMap lat={venue.latitude} lng={venue.longitude} name={venue.name} />
                </div>
              ) : null}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${OUTLINE} mt-4`}
              >
                Get directions
              </a>
            </div>
          </aside>
          </div>
          </div>

        {showHistory ? (
          <VenueMatchHistory
            venueName={venue.name}
            venueCmsId={venue._id}
            startHref={primaryStart?.href}
          />
        ) : null}

        {venueSupportsPlayResults(venue) ? (
          <VenueFriendsPlayed
            venueId={venue._id}
            venueName={venue.name}
            venueSlug={venue.slug}
            primarySport={primarySport}
            startHref={primaryStart?.href}
          />
        ) : null}

        {showBoards ? (
          <VenueLeaderboardSection
            venueId={venue._id}
            venueName={venue.name}
            playHref={venueLeaderboardPlayHref(primarySport)}
            sport={primarySport}
            initialBoard={initialBoard}
            initialWindow={initialWindow}
          />
        ) : null}

        {nearby.length > 0 ? (
          <section id="nearby" className="scroll-mt-40 border-t border-zinc-200 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2
                id="nearby-title"
                className="font-display text-3xl tracking-wide text-zinc-950 sm:text-4xl"
              >
                {headings.nearby}
              </h2>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {nearby.map((item) => {
                  const itemPlace = [item.suburb, item.city].filter(Boolean).join(", ");
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/venues/${item.slug}`}
                        className="block rounded-2xl border border-zinc-200 px-4 py-3.5 transition-colors hover:border-zinc-950"
                      >
                        <span className="block text-sm font-semibold text-zinc-950">{item.name}</span>
                        {itemPlace ? (
                          <span className="mt-0.5 block text-xs text-zinc-500">
                            {itemPlace}
                            {typeof item.rating === "number" ? ` · ${item.rating.toFixed(1)}` : ""}
                          </span>
                        ) : typeof item.rating === "number" ? (
                          <span className="mt-0.5 block text-xs text-zinc-500">
                            {item.rating.toFixed(1)}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ) : null}

        {isVenueClaimable(venue) ? (
          <VenueClaimBar venueName={venue.name} venueSlug={venue.slug} />
        ) : null}
        </article>
      </div>
    </div>
  );
}
