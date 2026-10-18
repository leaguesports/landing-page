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

/** Same weekday label the API builds in UTC from YYYY-MM-DD. */
export function formatGameDayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getUTCDay()];
  const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1];
  return `${weekday} ${day} ${monthName}`;
}

export function localIsoDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
