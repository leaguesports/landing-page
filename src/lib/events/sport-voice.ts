/**
 * How an event page talks about its sport.
 * Nouns, start labels, and accents come from the sport — not a generic fixture.
 */

export type EventSportVoice = {
  /** match, race, round */
  eventNoun: string;
  /** Kickoff, Lights out, First ball */
  startLabel: string;
  /** Ground, Stadium, Course */
  hostLabel: string;
  feedHeading: string;
  feedEmpty: string;
  replyPlaceholder: string;
  poolLine: string;
  /** Shown when no venue has listed a screening. */
  watchEmpty: string;
  accentClass: string;
};

const DEFAULT_VOICE: EventSportVoice = {
  eventNoun: "fixture",
  startLabel: "Kickoff",
  hostLabel: "Host",
  feedHeading: "Updates",
  feedEmpty: "No updates yet — be the first to react when the desk posts.",
  replyPlaceholder: "Say something short…",
  poolLine: "Start a friends tip pool for this fixture. Share the link on WhatsApp — no money, just bragging rights before kickoff.",
  watchEmpty: "Browse Watch for bars and fan zones showing live sport.",
  accentClass: "text-emerald-800",
};

const VOICES: Record<string, EventSportVoice> = {
  rugby: {
    eventNoun: "match",
    startLabel: "Kickoff",
    hostLabel: "Ground",
    feedHeading: "Match updates",
    feedEmpty: "No updates yet — the first try or penalty will land here.",
    replyPlaceholder: "Call the next try…",
    poolLine: "Start a friends tip pool for this match. Share the link on WhatsApp — no money, just bragging rights before kickoff.",
    watchEmpty: "Browse Watch for bars and fan zones showing rugby.",
    accentClass: "text-emerald-800",
  },
  soccer: {
    eventNoun: "match",
    startLabel: "Kickoff",
    hostLabel: "Stadium",
    feedHeading: "Match updates",
    feedEmpty: "No updates yet — the first goal or card will land here.",
    replyPlaceholder: "Call the next goal…",
    poolLine: "Start a friends tip pool for this match. Share the link on WhatsApp — no money, just bragging rights before kickoff.",
    watchEmpty: "Browse Watch for bars and fan zones showing soccer.",
    accentClass: "text-sky-800",
  },
  cricket: {
    eventNoun: "match",
    startLabel: "First ball",
    hostLabel: "Ground",
    feedHeading: "Score updates",
    feedEmpty: "No updates yet — the first wicket or boundary will land here.",
    replyPlaceholder: "Call the next wicket…",
    poolLine: "Start a friends tip pool for this match. Share the link on WhatsApp — no money, just bragging rights before the first ball.",
    watchEmpty: "Browse Watch for bars and fan zones showing cricket.",
    accentClass: "text-amber-800",
  },
  motorsport: {
    eventNoun: "race",
    startLabel: "Lights out",
    hostLabel: "Venue",
    feedHeading: "Race updates",
    feedEmpty: "No updates yet — the first lap note will land here.",
    replyPlaceholder: "Call the next stop…",
    poolLine: "Start a friends tip pool for this race. Share the link on WhatsApp — no money, just bragging rights before lights out.",
    watchEmpty: "Browse Watch for screens and fan zones showing this race.",
    accentClass: "text-rose-800",
  },
  golf: {
    eventNoun: "round",
    startLabel: "Tee time",
    hostLabel: "Course",
    feedHeading: "Round updates",
    feedEmpty: "No updates yet — the first hole note will land here.",
    replyPlaceholder: "Call the next hole…",
    poolLine: "Start a friends tip pool for this round. Share the link on WhatsApp — no money, just bragging rights before tee time.",
    watchEmpty: "Browse Watch for clubs and screens showing golf.",
    accentClass: "text-lime-800",
  },
  tennis: {
    eventNoun: "match",
    startLabel: "First ball",
    hostLabel: "Court",
    feedHeading: "Match updates",
    feedEmpty: "No updates yet — the first set note will land here.",
    replyPlaceholder: "Call the next set…",
    poolLine: "Start a friends tip pool for this match. Share the link on WhatsApp — no money, just bragging rights before the first ball.",
    watchEmpty: "Browse Watch for clubs and screens showing tennis.",
    accentClass: "text-teal-800",
  },
  padel: {
    eventNoun: "match",
    startLabel: "First ball",
    hostLabel: "Court",
    feedHeading: "Match updates",
    feedEmpty: "No updates yet — the first game note will land here.",
    replyPlaceholder: "Call the next game…",
    poolLine: "Start a friends tip pool for this match. Share the link on WhatsApp — no money, just bragging rights before the first ball.",
    watchEmpty: "Browse Watch for clubs showing padel.",
    accentClass: "text-emerald-800",
  },
  darts: {
    eventNoun: "match",
    startLabel: "Start",
    hostLabel: "Venue",
    feedHeading: "Leg updates",
    feedEmpty: "No updates yet — the first leg note will land here.",
    replyPlaceholder: "Call the next leg…",
    poolLine: "Start a friends tip pool for this match. Share the link on WhatsApp — no money, just bragging rights before the first dart.",
    watchEmpty: "Browse Watch for bars showing darts.",
    accentClass: "text-amber-800",
  },
};

const SLUG_ALIASES: Record<string, keyof typeof VOICES> = {
  football: "soccer",
  f1: "motorsport",
  f2: "motorsport",
  "formula-1": "motorsport",
  "formula-2": "motorsport",
  motogp: "motorsport",
  wrc: "motorsport",
  gt3: "motorsport",
  karting: "motorsport",
  "sim-racing": "motorsport",
};

function haystack(input: {
  sportSlug?: string | null;
  sportName?: string | null;
  series?: string | null;
  title?: string | null;
}): string {
  return [input.sportSlug, input.sportName, input.series, input.title]
    .map((part) => part?.toLowerCase().trim() ?? "")
    .filter(Boolean)
    .join(" ");
}

function voiceKey(input: {
  sportSlug?: string | null;
  sportName?: string | null;
  series?: string | null;
  title?: string | null;
  circuitLine?: string | null;
}): keyof typeof VOICES | null {
  const slug = input.sportSlug?.toLowerCase().trim() ?? "";
  if (slug && slug in VOICES) return slug as keyof typeof VOICES;
  if (slug && slug in SLUG_ALIASES) return SLUG_ALIASES[slug]!;

  const text = haystack(input);
  if (/\brugby\b/.test(text)) return "rugby";
  if (/\b(soccer|football)\b/.test(text)) return "soccer";
  if (/\bcricket\b/.test(text)) return "cricket";
  if (/\bgolf\b/.test(text)) return "golf";
  if (/\btennis\b/.test(text)) return "tennis";
  if (/\bpadel\b/.test(text)) return "padel";
  if (/\bdarts?\b/.test(text)) return "darts";
  if (/\b(formula\s*[12]|motorsport|motogp|grand prix|\bf1\b|wrc)\b/.test(text) || input.circuitLine?.trim()) {
    return "motorsport";
  }
  return null;
}

export function eventSportVoice(input: {
  sportSlug?: string | null;
  sportName?: string | null;
  series?: string | null;
  title?: string | null;
  circuitLine?: string | null;
}): EventSportVoice {
  const key = voiceKey(input);
  if (!key) return DEFAULT_VOICE;
  const voice = VOICES[key];
  const sport = input.sportName?.trim();
  if (!sport) return voice;
  if (key === "motorsport") {
    return {
      ...voice,
      watchEmpty: `Browse Watch for screens and fan zones showing ${sport}.`,
    };
  }
  return {
    ...voice,
    watchEmpty: voice.watchEmpty.replace(new RegExp(`\\b${key}\\b`, "i"), sport.toLowerCase()),
  };
}
