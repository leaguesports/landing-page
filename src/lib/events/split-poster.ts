import { normaliseWatchTeamColour, parseWatchFixtureTitle } from "../intent/watch-fixture-card.ts";
import { lookupWatchTeamBrand } from "../intent/watch-team-colours.ts";
import { FIXTURE_TIMEZONE } from "../sports/events-feed.ts";

/**
 * Split-poster colour resolution for the event-page hero.
 *
 * Team fill: a valid CMS hex wins. A blank CMS colour falls back to the
 * curated Watch kit map. A non-empty value that is not hex stays unset and
 * paints the neutral slate — it does not silently swap in the curated kit.
 * Nation mark: a known host country paints an abstract, original treatment
 * (bands, canton, disc, diamond, serration). Anything else paints one
 * neutral band, never a guessed flag, crest, or official mark.
 */

export const SPLIT_POSTER_NEUTRAL = "#3a4658";
export const SPLIT_POSTER_NEUTRAL_ALT = "#2c3646";
export const SPLIT_POSTER_INK = "#0B0B0B";
export const SPLIT_POSTER_PAPER = "#ffffff";

export type SplitPosterColourSource = "cms" | "curated" | "neutral";

export type ResolvedTeamColour = {
  name: string;
  fill: string;
  source: SplitPosterColourSource;
};

export type NationStripeSource = "curated" | "neutral";

/** Abstract poster mark. Original geometry, not a flag image or emblem. */
export type NationMark =
  | {
      kind: "bands";
      direction: "vertical" | "horizontal";
      colours: readonly string[];
      /** Relative band sizes. Omitted bands are equal. */
      weights?: readonly number[];
    }
  | {
      kind: "centre-block";
      colours: readonly [string, string, string];
      block: string;
      weights: readonly [number, number, number];
    }
  | {
      kind: "canton-stars";
      stripe: string;
      paper: string;
      canton: string;
      star: string;
    }
  | {
      kind: "canton-crescent";
      stripe: string;
      paper: string;
      canton: string;
      crescent: string;
    }
  | {
      kind: "half-crescent";
      top: string;
      bottom: string;
      crescent: string;
    }
  | {
      kind: "disc";
      field: string;
      disc: string;
      align: "center" | "hoist";
    }
  | {
      kind: "diamond";
      field: string;
      diamond: string;
      disc: string;
    }
  | {
      kind: "pale";
      hoist: string;
      centre: string;
      /** Simple centre shape. Not a leaf. */
      mark: string;
    }
  | {
      kind: "union";
      field: string;
      saltire: string;
      cross: string;
    }
  | {
      kind: "dots";
      field: string;
      dot: string;
    }
  | {
      kind: "serrated";
      field: string;
      hoist: string;
      teeth: number;
    }
  | {
      kind: "hoist";
      hoist: string;
      bands: readonly string[];
    }
  | {
      kind: "crescent";
      bands: readonly [string, string, string];
      crescent: string;
    };

export type ResolvedNationStripes = {
  /** Stable key, `neutral` when no host nation matched. */
  key: string;
  stripes: readonly string[];
  mark: NationMark;
  source: NationStripeSource;
};

export type PosterSide = {
  name: string;
  displayName: string;
  fill: string;
  ink: string;
  source: SplitPosterColourSource;
  /** Pirates read as black-and-white pinstripe. Light fields get a halftone. */
  texture: "solid" | "pinstripe" | "halftone";
  /** Small tracked corner label, when the kit has one. */
  epithet: string | null;
};

export type SplitPosterModel =
  | {
      kind: "match";
      headlineHome: string;
      headlineAway: string;
      breadcrumb: string;
      eyebrow: string;
      sportLabel: string | null;
      metaDate: string | null;
      metaClock: string;
      home: PosterSide;
      away: PosterSide;
      /** Big corner line on the away side, e.g. the rivalry name. */
      cornerTitle: string | null;
      dateLine: string;
    }
  | {
      kind: "race";
      headline: string;
      breadcrumb: string;
      eyebrow: string;
      sportLabel: string | null;
      metaDate: string | null;
      metaClock: string;
      lead: string;
      rest: string;
      stripes: readonly string[];
      mark: NationMark;
      stripeSource: NationStripeSource;
      dateLine: string;
      weekendLine: string | null;
      numeral: string | null;
    }
  | {
      kind: "title";
      headline: string;
      breadcrumb: string;
      eyebrow: string;
      sportLabel: string | null;
      metaDate: string | null;
      metaClock: string | null;
      dateLine: string | null;
      fill: string;
    };

export type SplitPosterInput = {
  title: string;
  sportSlug?: string | null;
  sportName?: string | null;
  competition?: string | null;
  series?: string | null;
  startsAt?: string | null;
  teams?: readonly { name: string; primaryColour?: string | null }[] | null;
  countryCode?: string | null;
  countryName?: string | null;
  place?: string | null;
  weekendStart?: string | null;
  weekendEnd?: string | null;
};

type NationEntry = {
  key: string;
  names: readonly string[];
  mark: NationMark;
};

/**
 * Abstract host marks for the 2026 grands prix, plus the tricolour clashes
 * those marks have to stay clear of. Not flag artwork, crests, or text.
 *
 * 2026 hosts on this site: Australia, China, Japan, Bahrain, Saudi Arabia,
 * United States (Miami, Austin, Las Vegas), Canada, Monaco, Spain, Austria,
 * United Kingdom, Belgium, Hungary, Netherlands, Italy, Azerbaijan, Malaysia,
 * Singapore, Mexico, Brazil, Qatar, United Arab Emirates.
 */
const NATIONS: readonly NationEntry[] = [
  {
    key: "mex",
    names: ["mex", "mx", "mexico"],
    mark: {
      kind: "centre-block",
      colours: ["#0B6B47", "#F3EFE6", "#C8213A"],
      block: "#0B6B47",
      weights: [1, 1.45, 1],
    },
  },
  {
    key: "usa",
    names: ["usa", "us", "united states", "united states of america", "america"],
    mark: { kind: "canton-stars", stripe: "#B22234", paper: "#FFFFFF", canton: "#3C3B6E", star: "#FFFFFF" },
  },
  {
    key: "fra",
    names: ["fra", "fr", "france"],
    mark: { kind: "bands", direction: "vertical", colours: ["#0055A4", "#FFFFFF", "#EF4135"] },
  },
  {
    key: "ned",
    names: ["ned", "nld", "nl", "netherlands", "holland"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#AE1C28", "#FFFFFF", "#21468B"] },
  },
  {
    key: "rus",
    names: ["rus", "ru", "russia"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#FFFFFF", "#0039A6", "#D52B1E"] },
  },
  {
    key: "ita",
    names: ["ita", "it", "italy"],
    mark: { kind: "bands", direction: "vertical", colours: ["#009246", "#F4F5F0", "#CE2B37"] },
  },
  {
    key: "irl",
    names: ["irl", "ie", "ireland"],
    mark: { kind: "bands", direction: "vertical", colours: ["#169B62", "#FFFFFF", "#FF883E"] },
  },
  {
    key: "bel",
    names: ["bel", "be", "belgium"],
    mark: { kind: "bands", direction: "vertical", colours: ["#000000", "#FAE042", "#ED2939"] },
  },
  {
    key: "deu",
    names: ["deu", "de", "ger", "germany"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#000000", "#DD0000", "#FFCE00"] },
  },
  {
    key: "mco",
    names: ["mco", "mc", "mon", "monaco"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#CE1126", "#FFFFFF"] },
  },
  {
    key: "idn",
    names: ["idn", "id", "indonesia"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#CE1126", "#FFFFFF"], weights: [2, 1] },
  },
  {
    key: "pol",
    names: ["pol", "pl", "poland"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#FFFFFF", "#DC143C"] },
  },
  {
    key: "aut",
    names: ["aut", "at", "austria"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#ED2939", "#FFFFFF", "#ED2939"] },
  },
  {
    key: "hun",
    names: ["hun", "hu", "hungary"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#CE2939", "#FFFFFF", "#477050"] },
  },
  {
    key: "bgr",
    names: ["bgr", "bg", "bulgaria"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#FFFFFF", "#00966E", "#D62612"] },
  },
  {
    key: "esp",
    names: ["esp", "es", "spain"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#AA151B", "#F1BF00", "#AA151B"], weights: [1, 2, 1] },
  },
  {
    key: "gbr",
    names: ["gbr", "gb", "uk", "united kingdom", "great britain", "britain"],
    mark: { kind: "union", field: "#012169", saltire: "#FFFFFF", cross: "#C8102E" },
  },
  {
    key: "jpn",
    names: ["jpn", "jp", "japan"],
    mark: { kind: "disc", field: "#FFFFFF", disc: "#BC002D", align: "center" },
  },
  {
    key: "chn",
    names: ["chn", "cn", "china"],
    mark: { kind: "disc", field: "#DE2910", disc: "#FFDE00", align: "hoist" },
  },
  {
    key: "bra",
    names: ["bra", "br", "brazil"],
    mark: { kind: "diamond", field: "#009C3B", diamond: "#FFDF00", disc: "#002776" },
  },
  {
    key: "can",
    names: ["can", "ca", "canada"],
    mark: { kind: "pale", hoist: "#FF0000", centre: "#FFFFFF", mark: "#FF0000" },
  },
  {
    key: "aus",
    names: ["aus", "au", "australia"],
    mark: { kind: "dots", field: "#012169", dot: "#FFFFFF" },
  },
  {
    key: "sau",
    names: ["sau", "sa", "saudi arabia"],
    mark: { kind: "bands", direction: "horizontal", colours: ["#006C35", "#FFFFFF"], weights: [4, 1] },
  },
  {
    key: "bhr",
    names: ["bhr", "bh", "bahrain"],
    mark: { kind: "serrated", field: "#CE1126", hoist: "#FFFFFF", teeth: 5 },
  },
  {
    key: "qat",
    names: ["qat", "qa", "qatar"],
    mark: { kind: "serrated", field: "#8A1538", hoist: "#FFFFFF", teeth: 9 },
  },
  {
    key: "are",
    names: ["are", "ae", "uae", "united arab emirates", "abu dhabi"],
    mark: { kind: "hoist", hoist: "#FF0000", bands: ["#00732F", "#FFFFFF", "#000000"] },
  },
  {
    key: "aze",
    names: ["aze", "az", "azerbaijan"],
    mark: { kind: "crescent", bands: ["#00B5E2", "#EF3340", "#509E2F"], crescent: "#FFFFFF" },
  },
  {
    key: "sgp",
    names: ["sgp", "sg", "singapore"],
    mark: { kind: "half-crescent", top: "#EF3340", bottom: "#FFFFFF", crescent: "#FFFFFF" },
  },
  {
    key: "mys",
    names: ["mys", "my", "malaysia"],
    mark: { kind: "canton-crescent", stripe: "#CC0001", paper: "#FFFFFF", canton: "#010066", crescent: "#FFCC00" },
  },
];

/** Hosts listed for 2026, including the Malaysia round carried on this site. */
export const F1_2026_HOST_KEYS = [
  "aus",
  "chn",
  "jpn",
  "bhr",
  "sau",
  "usa",
  "can",
  "mco",
  "esp",
  "aut",
  "gbr",
  "bel",
  "hun",
  "ned",
  "ita",
  "aze",
  "mys",
  "sgp",
  "mex",
  "bra",
  "qat",
  "are",
] as const;

const TITLE_NATION: readonly { needle: RegExp; key: string }[] = [
  { needle: /\bmexico\b/i, key: "mex" },
  { needle: /\b(las vegas|miami|united states|austin|cota)\b/i, key: "usa" },
  { needle: /\b(s[aã]o paulo|interlagos|brazil)\b/i, key: "bra" },
  { needle: /\b(monza|imola|italy|italian)\b/i, key: "ita" },
  { needle: /\b(silverstone|british|britain)\b/i, key: "gbr" },
  { needle: /\b(barcelona|madrid|spanish|spain|catalunya|catalonia)\b/i, key: "esp" },
  { needle: /\bmonaco\b/i, key: "mco" },
  { needle: /\b(spa|belgian|belgium)\b/i, key: "bel" },
  { needle: /\b(zandvoort|dutch|netherlands)\b/i, key: "ned" },
  { needle: /\b(spielberg|austrian|austria)\b/i, key: "aut" },
  { needle: /\b(hungar|hungary)\b/i, key: "hun" },
  { needle: /\b(suzuka|japanese|japan)\b/i, key: "jpn" },
  { needle: /\b(melbourne|australian|australia)\b/i, key: "aus" },
  { needle: /\b(montreal|canadian|canada)\b/i, key: "can" },
  { needle: /\bsingapore\b/i, key: "sgp" },
  { needle: /\b(abu dhabi|yas marina)\b/i, key: "are" },
  { needle: /\b(qatar|lusail)\b/i, key: "qat" },
  { needle: /\b(jeddah|saudi)\b/i, key: "sau" },
  { needle: /\b(malaysia|sepang)\b/i, key: "mys" },
  { needle: /\b(bahrain|sakhir)\b/i, key: "bhr" },
  { needle: /\b(shanghai|chinese|china)\b/i, key: "chn" },
  { needle: /\b(baku|azerbaijan)\b/i, key: "aze" },
  { needle: /\b(france|french)\b/i, key: "fra" },
  { needle: /\b(russia|sochi)\b/i, key: "rus" },
  { needle: /\bireland\b/i, key: "irl" },
  { needle: /\b(germany|nurburgring|hockenheim)\b/i, key: "deu" },
  { needle: /\bindonesia\b/i, key: "idn" },
  { needle: /\bpoland\b/i, key: "pol" },
  { needle: /\bbulgaria\b/i, key: "bgr" },
];

const GENERIC_LAST = new Set([
  "fc",
  "afc",
  "rfc",
  "cf",
  "sc",
  "united",
  "city",
  "town",
  "rovers",
  "athletic",
  "wanderers",
]);

const DATE_STAMP = new Intl.DateTimeFormat("en-GB", {
  timeZone: FIXTURE_TIMEZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const DAY_MONTH = new Intl.DateTimeFormat("en-GB", {
  timeZone: FIXTURE_TIMEZONE,
  day: "numeric",
  month: "short",
});

const CLOCK = new Intl.DateTimeFormat("en-GB", {
  timeZone: FIXTURE_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const NEUTRAL_MARK: NationMark = {
  kind: "bands",
  direction: "vertical",
  colours: [SPLIT_POSTER_NEUTRAL],
};

const NEUTRAL_STRIPES: ResolvedNationStripes = {
  key: "neutral",
  stripes: NEUTRAL_MARK.colours,
  mark: NEUTRAL_MARK,
  source: "neutral",
};

export function splitPosterNationKeys(): readonly string[] {
  return NATIONS.map((nation) => nation.key);
}

function markColours(mark: NationMark): readonly string[] {
  switch (mark.kind) {
    case "bands":
      return mark.colours;
    case "centre-block":
      return mark.colours;
    case "canton-stars":
      return [mark.stripe, mark.paper, mark.canton];
    case "canton-crescent":
      return [mark.stripe, mark.paper, mark.canton];
    case "half-crescent":
      return [mark.top, mark.bottom];
    case "disc":
      return [mark.field, mark.disc];
    case "diamond":
      return [mark.field, mark.diamond, mark.disc];
    case "pale":
      return [mark.hoist, mark.centre, mark.hoist];
    case "union":
      return [mark.field, mark.saltire, mark.cross];
    case "dots":
      return [mark.field, mark.dot];
    case "serrated":
      return [mark.field, mark.hoist];
    case "hoist":
      return [mark.hoist, ...mark.bands];
    case "crescent":
      return mark.bands;
    default: {
      const exhaustive: never = mark;
      return exhaustive;
    }
  }
}

function resolvedNation(nation: NationEntry): ResolvedNationStripes {
  return {
    key: nation.key,
    stripes: markColours(nation.mark),
    mark: nation.mark,
    source: "curated",
  };
}

function nationByKey(key: string): NationEntry | null {
  return NATIONS.find((nation) => nation.key === key) ?? null;
}

function normaliseNationToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function posterInk(fill: string): "#0B0B0B" | "#ffffff" {
  const hex = normaliseWatchTeamColour(fill) ?? SPLIT_POSTER_NEUTRAL;
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.62 ? SPLIT_POSTER_INK : SPLIT_POSTER_PAPER;
}

export function resolveTeamPosterColour(input: {
  name: string;
  primaryColour?: string | null;
}): ResolvedTeamColour {
  const name = input.name.trim();
  const provided = (input.primaryColour ?? "").trim();
  if (provided) {
    const hex = normaliseWatchTeamColour(provided);
    if (hex) return { name, fill: hex, source: "cms" };
    return { name, fill: SPLIT_POSTER_NEUTRAL, source: "neutral" };
  }
  const curated = normaliseWatchTeamColour(lookupWatchTeamBrand(name)?.primaryColour);
  if (curated) return { name, fill: curated, source: "curated" };
  return { name, fill: SPLIT_POSTER_NEUTRAL, source: "neutral" };
}

export function resolveNationStripes(input: {
  countryCode?: string | null;
  countryName?: string | null;
  /** Used only when no country code or name was supplied. */
  hint?: string | null;
}): ResolvedNationStripes {
  const code = normaliseNationToken(input.countryCode ?? "");
  const name = normaliseNationToken(input.countryName ?? "");
  if (code || name) {
    const nation = NATIONS.find(
      (entry) => entry.names.includes(code) || entry.names.includes(name),
    );
    if (!nation) return NEUTRAL_STRIPES;
    return resolvedNation(nation);
  }

  const hint = input.hint ?? "";
  const matched = TITLE_NATION.find((entry) => entry.needle.test(hint));
  const nation = matched ? nationByKey(matched.key) : null;
  if (!nation) return NEUTRAL_STRIPES;
  return resolvedNation(nation);
}

/** Giant-type name: the distinctive last word, otherwise the full name. */
export function posterDisplayName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  const words = trimmed.split(" ").filter(Boolean);
  if (words.length >= 2) {
    const last = words[words.length - 1] ?? "";
    if (last.length >= 4 && !GENERIC_LAST.has(last.toLowerCase())) return last;
  }
  return trimmed;
}

function raceBreadcrumb(title: string): string {
  const stripped = title
    .replace(/\bgrand\s+prix\b/gi, "")
    .replace(/\bgp\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return stripped ? `${stripped} GP` : "Grand Prix";
}

export function grandPrixPosterLines(title: string): { lead: string; rest: string } {
  const stripped = title
    .replace(/\bgrand\s+prix\b/gi, "")
    .replace(/\bgp\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = stripped.split(" ").filter(Boolean);
  if (words.length === 0) return { lead: "GRAND", rest: "PRIX" };
  if (words.length === 1) return { lead: words[0]!.toLocaleUpperCase("en"), rest: "" };
  return {
    lead: words[0]!.toLocaleUpperCase("en"),
    rest: words.slice(1).join(" ").toLocaleUpperCase("en"),
  };
}

function parsedInstant(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatMetaDate(instant: Date): string {
  return DATE_STAMP.format(instant).replace(/,/g, "").replace(/\s+/g, " ").trim();
}

function formatDayMonth(instant: Date): string {
  return DAY_MONTH.format(instant).replace(/,/g, "").replace(/\s+/g, " ").trim();
}

function formatClock(instant: Date): string {
  return CLOCK.format(instant);
}

function numeralFrom(instant: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: FIXTURE_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
  }).formatToParts(instant);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  return day && month ? `${day}.${month}` : "";
}

function clockPhrase(kind: "match" | "race", instant: Date | null): string {
  const label = kind === "race" ? "Lights out" : "Kick-off";
  if (!instant) return `${label} TBC`;
  return `${label} ${formatClock(instant)}`;
}

function posterDateLine(kind: "match" | "race", instant: Date | null): string {
  const clock = clockPhrase(kind, instant).toLocaleUpperCase("en");
  if (!instant) return clock;
  return `${formatMetaDate(instant).toLocaleUpperCase("en")} · ${clock}`;
}

function weekendLine(startIso: string | null | undefined, endIso: string | null | undefined): string | null {
  const start = parsedInstant(startIso);
  const end = parsedInstant(endIso);
  if (!start && !end) return null;
  if (start && end) {
    const a = formatDayMonth(start).toLocaleUpperCase("en");
    const b = formatDayMonth(end).toLocaleUpperCase("en");
    if (a === b) return `RACE DAY · ${a}`;
    return `RACE WEEKEND · ${a} – ${b}`;
  }
  const only = formatDayMonth((start ?? end)!).toLocaleUpperCase("en");
  return `RACE DAY · ${only}`;
}

function epithetFor(name: string): string | null {
  const code = lookupWatchTeamBrand(name)?.shortCode;
  if (code === "KAI") return "Gold & black";
  if (code === "ORL") return "Black & white";
  return null;
}

function sideTexture(name: string, fill: string): PosterSide["texture"] {
  if (lookupWatchTeamBrand(name)?.shortCode === "ORL" && posterInk(fill) === SPLIT_POSTER_PAPER) {
    return "pinstripe";
  }
  if (posterInk(fill) === SPLIT_POSTER_INK) return "halftone";
  return "solid";
}

function toSide(input: { name: string; primaryColour?: string | null }, fillOverride?: string): PosterSide {
  const resolved = resolveTeamPosterColour(input);
  const fill = fillOverride ?? resolved.fill;
  return {
    name: resolved.name,
    displayName: posterDisplayName(resolved.name),
    fill,
    ink: posterInk(fill),
    source: resolved.source,
    texture: sideTexture(resolved.name, fill),
    epithet: epithetFor(resolved.name),
  };
}

function rivalryLabel(a: string, b: string): string | null {
  const codes = [lookupWatchTeamBrand(a)?.shortCode, lookupWatchTeamBrand(b)?.shortCode]
    .filter((code): code is string => Boolean(code))
    .sort();
  if (codes[0] === "KAI" && codes[1] === "ORL") return "The Soweto derby";
  return null;
}

function teamPair(input: SplitPosterInput): { home: PosterSide; away: PosterSide } | null {
  const teams = (input.teams ?? []).filter((team) => team.name.trim());
  if (teams.length >= 2) {
    const home = toSide(teams[0]!);
    let away = toSide(teams[1]!);
    if (home.source === "neutral" && away.source === "neutral" && home.fill === away.fill) {
      away = { ...away, fill: SPLIT_POSTER_NEUTRAL_ALT, ink: posterInk(SPLIT_POSTER_NEUTRAL_ALT) };
    }
    return { home, away };
  }
  const parsed = parseWatchFixtureTitle(input.title);
  if (!parsed) return null;
  const home = toSide({ name: parsed.home });
  let away = toSide({ name: parsed.away });
  if (home.source === "neutral" && away.source === "neutral" && home.fill === away.fill) {
    away = { ...away, fill: SPLIT_POSTER_NEUTRAL_ALT, ink: posterInk(SPLIT_POSTER_NEUTRAL_ALT) };
  }
  return { home, away };
}

function isMotorsport(input: SplitPosterInput): boolean {
  const sport = (input.sportSlug ?? "").trim().toLowerCase();
  const series = (input.series ?? "").trim().toLowerCase();
  if (sport === "motorsport" || sport === "f1" || sport === "formula-1") return true;
  if (series === "f1" || series === "formula-1" || series === "formula 1" || series === "f2") return true;
  return /\bgrand\s+prix\b/i.test(input.title);
}

function sportLabel(input: SplitPosterInput): string | null {
  const name = input.sportName?.trim();
  if (name) return name;
  const slug = input.sportSlug?.trim();
  if (!slug) return null;
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function eyebrow(sport: string | null, context: string | null): string {
  const lead = sport ? `Watch ${sport}` : "Watch";
  return context ? `${lead} · ${context}` : lead;
}

export function buildSplitPoster(input: SplitPosterInput): SplitPosterModel {
  const instant = parsedInstant(input.startsAt);
  const sport = sportLabel(input);
  const metaDate = instant ? formatMetaDate(instant) : null;
  const pair = teamPair(input);

  if (pair) {
    const rivalry = rivalryLabel(pair.home.name, pair.away.name);
    const competition = input.competition?.trim() || null;
    const corner = rivalry ?? competition;
    const metaClock = clockPhrase("match", instant);
    return {
      kind: "match",
      headlineHome: pair.home.displayName,
      headlineAway: pair.away.displayName,
      breadcrumb: `${pair.home.displayName} vs ${pair.away.displayName}`,
      eyebrow: eyebrow(sport, rivalry ?? competition),
      sportLabel: sport,
      metaDate,
      metaClock,
      home: pair.home,
      away: pair.away,
      cornerTitle: corner,
      dateLine: posterDateLine("match", instant),
    };
  }

  if (isMotorsport(input)) {
    const lines = grandPrixPosterLines(input.title);
    const place =
      input.place?.trim() ||
      input.title.replace(/\bgrand\s+prix\b/gi, "").replace(/\bgp\b/gi, "").replace(/\s+/g, " ").trim() ||
      input.countryName?.trim() ||
      null;
    const stripes = resolveNationStripes({
      countryCode: input.countryCode,
      countryName: input.countryName,
      hint: `${input.place ?? ""} ${input.countryName ?? ""} ${input.title}`,
    });
    const headline = `${[lines.lead, lines.rest].filter(Boolean).join(" ")} GP`.replace(/\s+/g, " ");
    return {
      kind: "race",
      headline,
      breadcrumb: raceBreadcrumb(input.title),
      eyebrow: eyebrow(sport, place),
      sportLabel: sport,
      metaDate,
      metaClock: clockPhrase("race", instant),
      lead: lines.lead,
      rest: lines.rest,
      stripes: stripes.stripes,
      mark: stripes.mark,
      stripeSource: stripes.source,
      dateLine: posterDateLine("race", instant),
      weekendLine:
        weekendLine(input.weekendStart, input.weekendEnd) ??
        (instant ? `RACE DAY · ${formatDayMonth(instant).toLocaleUpperCase("en")}` : null),
      numeral: instant ? numeralFrom(instant) : null,
    };
  }

  const headline = input.title.trim() || "Event";
  return {
    kind: "title",
    headline,
    breadcrumb: headline,
    eyebrow: eyebrow(sport, input.competition?.trim() || null),
    sportLabel: sport,
    metaDate,
    metaClock: instant ? clockPhrase("match", instant) : null,
    dateLine: instant ? posterDateLine("match", instant) : null,
    fill: SPLIT_POSTER_NEUTRAL,
  };
}

function calendarStamp(instant: Date): string {
  const year = instant.getUTCFullYear().toString().padStart(4, "0");
  const month = (instant.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = instant.getUTCDate().toString().padStart(2, "0");
  const hour = instant.getUTCHours().toString().padStart(2, "0");
  const minute = instant.getUTCMinutes().toString().padStart(2, "0");
  const second = instant.getUTCSeconds().toString().padStart(2, "0");
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

/** Google Calendar template. No start time still opens the composer with the title. */
export function fixtureCalendarUrl(input: {
  title: string;
  startsAt?: string | null;
  detailsUrl: string;
  durationMinutes?: number;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title.trim(),
    details: input.detailsUrl,
  });
  const start = parsedInstant(input.startsAt);
  if (start) {
    const end = new Date(start.getTime() + (input.durationMinutes ?? 120) * 60 * 1000);
    params.set("dates", `${calendarStamp(start)}/${calendarStamp(end)}`);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
