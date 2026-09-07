/** Collapse "Springboks", "South Africa", "All Blacks" into one id per side. */

function stripDiacritics(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "");
}

export function normalizeTeamName(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const TEAM_ALIASES: Record<string, readonly string[]> = {
  "south-africa": [
    "south africa",
    "springboks",
    "springbok",
    "bokke",
    "ama bokke",
    "sa",
    "rsa",
  ],
  "new-zealand": [
    "new zealand",
    "all blacks",
    "all black",
    "nz",
    "nzl",
  ],
  australia: ["australia", "wallabies", "aus"],
  england: ["england", "eng"],
  ireland: ["ireland", "ire"],
  wales: ["wales", "wal"],
  scotland: ["scotland", "sco"],
  france: ["france", "fra"],
  argentina: ["argentina", "los pumas", "pumas", "arg"],
  italy: ["italy", "ita"],
  "kaizer-chiefs": ["kaizer chiefs", "chiefs", "ama khosi"],
  "orlando-pirates": ["orlando pirates", "pirates", "bucs"],
  "mamelodi-sundowns": ["mamelodi sundowns", "sundowns", "downs"],
};

const TEAM_LOOKUP = new Map<string, string>();
for (const [id, aliases] of Object.entries(TEAM_ALIASES)) {
  TEAM_LOOKUP.set(id.replace(/-/g, " "), id);
  TEAM_LOOKUP.set(id, id);
  for (const alias of aliases) {
    TEAM_LOOKUP.set(alias, id);
  }
}

export function canonicalTeamId(name: string): string {
  const normalized = normalizeTeamName(name);
  if (!normalized) return "";
  return TEAM_LOOKUP.get(normalized) ?? normalized.replace(/\s+/g, "-");
}

export function teamsMatch(a: string, b: string): boolean {
  const left = canonicalTeamId(a);
  const right = canonicalTeamId(b);
  return Boolean(left) && left === right;
}

const GP_ALIASES: Record<string, readonly string[]> = {
  monaco: ["monaco", "monaco grand prix", "monte carlo"],
  monza: ["monza", "italian grand prix", "italy gp"],
  silverstone: ["silverstone", "british grand prix", "great britain"],
  spa: ["spa", "spa francorchamps", "belgian grand prix", "belgium"],
  zandvoort: ["zandvoort", "dutch grand prix", "netherlands"],
  hungaroring: ["hungaroring", "hungarian grand prix", "hungary"],
  catalunya: ["catalunya", "barcelona", "spanish grand prix", "spain"],
  spielberg: ["spielberg", "red bull ring", "austrian grand prix", "austria"],
  bahrain: ["bahrain", "sakhir", "bahrain grand prix"],
  jeddah: ["jeddah", "saudi", "saudi arabian grand prix"],
  melbourne: ["melbourne", "albert park", "australian grand prix"],
  suzuka: ["suzuka", "japanese grand prix", "japan"],
  shanghai: ["shanghai", "chinese grand prix", "china"],
  miami: ["miami", "miami grand prix"],
  imola: ["imola", "emilia romagna"],
  montreal: ["montreal", "canadian grand prix", "canada"],
  barcelona: ["barcelona"],
  singapore: ["singapore", "marina bay", "singapore grand prix"],
  austin: ["austin", "cota", "united states grand prix", "usa"],
  mexico: ["mexico", "mexico city", "mexican grand prix"],
  interlagos: ["interlagos", "sao paulo", "brazilian grand prix", "brazil"],
  vegas: ["las vegas", "vegas", "las vegas grand prix"],
  lusail: ["lusail", "qatar", "qatar grand prix"],
  "yas-marina": ["yas marina", "abu dhabi", "abu dhabi grand prix"],
  baku: ["baku", "azerbaijan", "azerbaijan grand prix"],
};

const GP_LOOKUP = new Map<string, string>();
for (const [id, aliases] of Object.entries(GP_ALIASES)) {
  GP_LOOKUP.set(id, id);
  for (const alias of aliases) {
    GP_LOOKUP.set(normalizeTeamName(alias), id);
  }
}

export function canonicalGpId(...parts: Array<string | null | undefined>): string | null {
  const haystack = parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .map((part) => normalizeTeamName(part))
    .join(" ");
  if (!haystack) return null;

  let best: { id: string; length: number } | null = null;
  for (const [alias, id] of GP_LOOKUP) {
    if (haystack.includes(alias) && alias.length >= (best?.length ?? 0)) {
      best = { id, length: alias.length };
    }
  }
  return best?.id ?? null;
}

export function motorsportTitlesMatch(
  fixture: {
    title: string;
    competition?: string | null;
    series?: string | null;
  },
  meetingName: string,
  circuit?: string | null,
): boolean {
  const fixtureId = canonicalGpId(
    fixture.title,
    fixture.competition,
    fixture.series,
  );
  const eventId = canonicalGpId(meetingName, circuit);
  if (fixtureId && eventId) return fixtureId === eventId;

  const fixtureText = normalizeTeamName(
    [fixture.title, fixture.competition].filter(Boolean).join(" "),
  );
  const eventText = normalizeTeamName([meetingName, circuit].filter(Boolean).join(" "));
  if (!fixtureText || !eventText) return false;
  return fixtureText.includes(eventText) || eventText.includes(fixtureText);
}
