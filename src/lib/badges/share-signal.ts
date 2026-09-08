import { trackActivation } from "@/lib/analytics/activation";
import { track } from "@/lib/analytics/track";

const SHARE_STORAGE_KEY = "leaguesports.badge.scorecard_shared";

/** Record that the athlete shared a padel scorecard (WhatsApp / Web Share). */
export function markScorecardShared(): void {
  if (typeof window === "undefined") return;
  try {
    const already = window.localStorage.getItem(SHARE_STORAGE_KEY) === "1";
    window.localStorage.setItem(SHARE_STORAGE_KEY, "1");
    track("share_click", {
      page_type: "scorecard",
      sport: "padel",
      cta_slot: "inline",
    });
    if (!already) {
      trackActivation("padel_scorecard_share");
    }
  } catch {
    // Private mode / quota — badge stays locked until share is detectable.
  }
}

export function hasScorecardShareSignal(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SHARE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
