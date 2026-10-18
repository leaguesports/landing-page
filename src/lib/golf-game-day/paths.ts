export const ZEBULA_VENUE_SLUG = "zebula-golf-estate-spa";
export const ZEBULA_GAME_DAY = "2026-11-01";

export function gameDayInvitePath(code: string): string {
  return `/g/${code}`;
}

export function gameDayWatchPath(token: string): string {
  return `/w/${encodeURIComponent(token)}`;
}

export function gameDayBoardPath(gameDayId: string): string {
  return `/golf/game-day/${gameDayId}/board`;
}

export function gameDayCardPath(gameDayId: string, cardId: string): string {
  return `/golf/game-day/${gameDayId}/card/${cardId}`;
}

export function gameDayReviewPath(gameDayId: string, cardId: string): string {
  return `/golf/game-day/${gameDayId}/card/${cardId}/review`;
}

export function gameDayWeekendPath(weekendEventId: string): string {
  return `/golf/game-day/weekend/${weekendEventId}`;
}

export function isGameDayChromePath(pathname: string): boolean {
  if (pathname.startsWith("/golf/game-day")) return true;
  if (/^\/g\/[^/]+/.test(pathname)) return true;
  if (/^\/w\/[^/]+/.test(pathname)) return true;
  return false;
}

/** Calendar dates for a game day are read in South African time. */
export const GAME_DAY_TIME_ZONE = "Africa/Johannesburg";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Weekday and month come from the YYYY-MM-DD on the game day, never a
 * hardcoded label. Noon in Johannesburg keeps the calendar day stable.
 */
export function formatGameDayDate(isoDate: string): string {
  const match = ISO_DATE.exec(isoDate.trim());
  if (!match) return isoDate;
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00+02:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: GAME_DAY_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const month = pick("month").replace(/\.$/, "");
  return `${pick("weekday")} ${pick("day")} ${month}`;
}

/** Create-screen date, weekday derived in Johannesburg. "Sun, 1 Nov 2026". */
export function formatGameDayDateLong(isoDate: string): string {
  const short = formatGameDayDate(isoDate);
  const match = /^(\w+)\s+(\d+)\s+(\w+)$/.exec(short);
  const year = isoDate.slice(0, 4);
  if (!match) return short;
  return `${match[1]}, ${match[2]} ${match[3]} ${year}`;
}

export function gameDayPlaceName(venueName: string): string {
  return venueName.trim().split(/\s+/)[0] || venueName.trim() || "Game";
}

export function gameDayHeadline(venueName: string, isoDate: string): string {
  return `${gameDayPlaceName(venueName).toUpperCase()} · ${formatGameDayDate(isoDate).toUpperCase()}`;
}

export function presentGameDay(input: {
  venueName: string;
  date: string;
  dateLabel?: string;
  headline?: string;
}): { dateLabel: string; headline: string; place: string } {
  const place = gameDayPlaceName(input.venueName);
  if (ISO_DATE.test(input.date.trim())) {
    return {
      place,
      dateLabel: formatGameDayDate(input.date),
      headline: gameDayHeadline(input.venueName, input.date),
    };
  }
  return {
    place,
    dateLabel: input.dateLabel || input.date,
    headline: input.headline || place.toUpperCase(),
  };
}

export function johannesburgClock(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: GAME_DAY_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function localIsoDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: GAME_DAY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function defaultGameDayDate(venueSlug: string, today: string): string {
  if (venueSlug === ZEBULA_VENUE_SLUG && today <= ZEBULA_GAME_DAY) {
    return ZEBULA_GAME_DAY;
  }
  return today;
}

export function whatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
