/**
 * Curated kit colours for Watch fixture cards.
 *
 * Used only when CMS `primaryColour` is missing. Match is by normalised team
 * name (case, diacritics, and punctuation), never by a Sanity id. No crests.
 */

export type WatchTeamBrand = {
  shortCode: string;
  primaryColour: string;
};

type WatchTeamEntry = {
  names: readonly string[];
  shortCode: string;
  primaryColour: string;
};

const TEAMS: readonly WatchTeamEntry[] = [
  { names: ["Springboks", "Springbok", "Boks"], shortCode: "SPR", primaryColour: "#007A33" },
  { names: ["Wallabies"], shortCode: "WAL", primaryColour: "#FDB913" },
  { names: ["All Blacks"], shortCode: "NZL", primaryColour: "#111111" },
  { names: ["England"], shortCode: "ENG", primaryColour: "#FFFFFF" },
  { names: ["Ireland"], shortCode: "IRE", primaryColour: "#169B62" },
  {
    names: ["Lions", "British and Irish Lions", "British Irish Lions", "Emirates Lions", "Golden Lions"],
    shortCode: "LIO",
    primaryColour: "#C8102E",
  },
  { names: ["Bulls"], shortCode: "BUL", primaryColour: "#0057B8" },
  { names: ["Sharks"], shortCode: "SHA", primaryColour: "#000000" },
  { names: ["Stormers"], shortCode: "STO", primaryColour: "#00205B" },
  { names: ["Griquas"], shortCode: "GRI", primaryColour: "#00A3A1" },
  { names: ["Pumas"], shortCode: "PUM", primaryColour: "#6B4423" },
  { names: ["Kaizer Chiefs"], shortCode: "KAI", primaryColour: "#FFD200" },
  { names: ["Orlando Pirates"], shortCode: "ORL", primaryColour: "#000000" },
  { names: ["Mamelodi Sundowns", "Sundowns"], shortCode: "SUN", primaryColour: "#FFE500" },
  { names: ["Chippa United"], shortCode: "CPU", primaryColour: "#005EB8" },
  { names: ["Golden Arrows"], shortCode: "ARR", primaryColour: "#D4A017" },
  { names: ["Durban City"], shortCode: "DUR", primaryColour: "#003DA5" },
  { names: ["Polokwane City"], shortCode: "POL", primaryColour: "#1F4E79" },
  { names: ["Arsenal"], shortCode: "ARS", primaryColour: "#EF0107" },
  { names: ["Brentford"], shortCode: "BRE", primaryColour: "#E30613" },
  { names: ["Chelsea"], shortCode: "CHE", primaryColour: "#034694" },
  { names: ["Everton"], shortCode: "EVE", primaryColour: "#003399" },
  { names: ["Fulham"], shortCode: "FUL", primaryColour: "#FFFFFF" },
  { names: ["Leeds United"], shortCode: "LEE", primaryColour: "#FFFFFF" },
  { names: ["Liverpool"], shortCode: "LIV", primaryColour: "#C8102E" },
  { names: ["Manchester City", "Man City"], shortCode: "MCI", primaryColour: "#6CABDD" },
  {
    names: ["Manchester United", "Man United", "Man Utd", "Manchester Utd"],
    shortCode: "MUN",
    primaryColour: "#DA291C",
  },
  { names: ["Newcastle United"], shortCode: "NEW", primaryColour: "#241F20" },
  { names: ["Sunderland"], shortCode: "SUN", primaryColour: "#EB172B" },
  { names: ["Tottenham Hotspur", "Tottenham", "Spurs"], shortCode: "TOT", primaryColour: "#132257" },
  { names: ["Proteas", "South Africa"], shortCode: "RSA", primaryColour: "#007A4D" },
  { names: ["India"], shortCode: "IND", primaryColour: "#0033A0" },
  { names: ["Namibia"], shortCode: "NAM", primaryColour: "#003580" },
  {
    names: ["Joburg Super Kings", "Johannesburg Super Kings"],
    shortCode: "JSK",
    primaryColour: "#F9CD05",
  },
  { names: ["MI Cape Town", "Mumbai Indians Cape Town"], shortCode: "MCT", primaryColour: "#004BA0" },
];

const TRAILING_CLUB = /(?:\s+(?:fc|afc|rfc|cf))+$/;

function normaliseWatchTeamName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^the\s+/, "");
  return base;
}

function kit(shortCode: string, primaryColour: string): WatchTeamBrand {
  if (!/^[A-Z]{3}$/.test(shortCode)) {
    throw new Error(`Watch team shortCode must be 3 letters: ${shortCode}`);
  }
  const colour = primaryColour.trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(colour)) {
    throw new Error(`Watch team colour must be #rrggbb: ${primaryColour}`);
  }
  return { shortCode, primaryColour: colour };
}

const BY_NAME = new Map<string, WatchTeamBrand>();

for (const team of TEAMS) {
  const brand = kit(team.shortCode, team.primaryColour);
  for (const name of team.names) {
    const key = normaliseWatchTeamName(name);
    if (!key) throw new Error("Watch team name is empty");
    if (BY_NAME.has(key)) throw new Error(`Duplicate watch team name: ${key}`);
    BY_NAME.set(key, brand);
  }
}

export function lookupWatchTeamBrand(name: string): WatchTeamBrand | null {
  const key = normaliseWatchTeamName(name);
  const direct = BY_NAME.get(key);
  if (direct) return direct;
  const stripped = key.replace(TRAILING_CLUB, "").trim();
  if (!stripped || stripped === key) return null;
  return BY_NAME.get(stripped) ?? null;
}
