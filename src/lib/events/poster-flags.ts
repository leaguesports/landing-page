/**
 * Host flags for the race poster. Codes are flag-icons 4x3 filenames.
 * The Ulster Banner (`gb-nir`) is never used. All-island Ireland and any
 * nation missing from the set fall back to a solid band with initials.
 */

export const FLAG_ASSET_DIR = "/flags/4x3";
export const FLAG_OBJECT_POSITION_DEFAULT = "center";

/** Stars sit at the top of the US flag. Japan and Brazil are centred. */
const FLAG_OBJECT_POSITION: Readonly<Record<string, string>> = {
  us: "left top",
  jp: "center",
  br: "center",
};

export const ULSTER_BANNER_CODE = "gb-nir";
const FALLBACK_FILL = "#3a4658";

export type PosterFlag =
  | {
      kind: "image";
      code: string;
      src: string;
      objectPosition: string;
      /** Used when the SVG fails to load. */
      initials: string;
    }
  | {
      kind: "fallback";
      initials: string;
      fill: string;
    };

type FlagEntry = {
  key: string;
  names: readonly string[];
  /** Null is a neutral treatment, not a flag file. */
  code: string | null;
  initials: string;
};

const FLAGS: readonly FlagEntry[] = [
  { key: "mx", names: ["mex", "mx", "mexico"], code: "mx", initials: "MX" },
  { key: "us", names: ["usa", "us", "united states", "united states of america", "america"], code: "us", initials: "US" },
  { key: "br", names: ["bra", "br", "brazil"], code: "br", initials: "BR" },
  { key: "it", names: ["ita", "it", "italy"], code: "it", initials: "IT" },
  { key: "gb", names: ["gbr", "gb", "uk", "united kingdom", "great britain", "britain"], code: "gb", initials: "GB" },
  { key: "gb-eng", names: ["england", "eng", "gb-eng"], code: "gb-eng", initials: "ENG" },
  { key: "gb-sct", names: ["scotland", "sct", "gb-sct"], code: "gb-sct", initials: "SCT" },
  { key: "gb-wls", names: ["wales", "wls", "cymru", "gb-wls"], code: "gb-wls", initials: "WLS" },
  { key: "ie", names: ["irl", "ie", "ireland", "eire", "gb-nir", "northern ireland"], code: null, initials: "IRE" },
  { key: "wi", names: ["west indies", "wi"], code: null, initials: "WI" },
  { key: "es", names: ["esp", "es", "spain"], code: "es", initials: "ES" },
  { key: "mc", names: ["mco", "mc", "mon", "monaco"], code: "mc", initials: "MC" },
  { key: "be", names: ["bel", "be", "belgium"], code: "be", initials: "BE" },
  { key: "nl", names: ["ned", "nld", "nl", "netherlands", "holland"], code: "nl", initials: "NL" },
  { key: "at", names: ["aut", "at", "austria"], code: "at", initials: "AT" },
  { key: "hu", names: ["hun", "hu", "hungary"], code: "hu", initials: "HU" },
  { key: "jp", names: ["jpn", "jp", "japan"], code: "jp", initials: "JP" },
  { key: "au", names: ["aus", "au", "australia"], code: "au", initials: "AU" },
  { key: "ca", names: ["can", "ca", "canada"], code: "ca", initials: "CA" },
  { key: "sg", names: ["sgp", "sg", "singapore"], code: "sg", initials: "SG" },
  { key: "ae", names: ["are", "ae", "uae", "united arab emirates", "abu dhabi"], code: "ae", initials: "AE" },
  { key: "qa", names: ["qat", "qa", "qatar"], code: "qa", initials: "QA" },
  { key: "sa", names: ["sau", "sa", "saudi arabia"], code: "sa", initials: "SA" },
  { key: "bh", names: ["bhr", "bh", "bahrain"], code: "bh", initials: "BH" },
  { key: "cn", names: ["chn", "cn", "china"], code: "cn", initials: "CN" },
  { key: "az", names: ["aze", "az", "azerbaijan"], code: "az", initials: "AZ" },
  { key: "my", names: ["mys", "my", "malaysia"], code: "my", initials: "MY" },
  { key: "fr", names: ["fra", "fr", "france"], code: "fr", initials: "FR" },
  { key: "de", names: ["deu", "de", "ger", "germany"], code: "de", initials: "DE" },
  { key: "ru", names: ["rus", "ru", "russia"], code: "ru", initials: "RU" },
  { key: "id", names: ["idn", "id", "indonesia"], code: "id", initials: "ID" },
  { key: "pl", names: ["pol", "pl", "poland"], code: "pl", initials: "PL" },
  { key: "bg", names: ["bgr", "bg", "bulgaria"], code: "bg", initials: "BG" },
];

const TITLE_FLAGS: readonly { needle: RegExp; key: string }[] = [
  { needle: /\bmexico\b/i, key: "mx" },
  { needle: /\b(las vegas|miami|united states|austin|cota)\b/i, key: "us" },
  { needle: /\b(s[aã]o paulo|interlagos|brazil)\b/i, key: "br" },
  { needle: /\b(monza|imola|italy|italian)\b/i, key: "it" },
  { needle: /\b(silverstone|british|britain)\b/i, key: "gb" },
  { needle: /\bengland\b/i, key: "gb-eng" },
  { needle: /\bscotland\b/i, key: "gb-sct" },
  { needle: /\b(wales|cymru)\b/i, key: "gb-wls" },
  { needle: /\b(ireland|eire)\b/i, key: "ie" },
  { needle: /\bwest indies\b/i, key: "wi" },
  { needle: /\b(barcelona|madrid|spanish|spain|catalunya|catalonia)\b/i, key: "es" },
  { needle: /\bmonaco\b/i, key: "mc" },
  { needle: /\b(spa|belgian|belgium)\b/i, key: "be" },
  { needle: /\b(zandvoort|dutch|netherlands)\b/i, key: "nl" },
  { needle: /\b(spielberg|austrian|austria)\b/i, key: "at" },
  { needle: /\b(hungarian|hungary|hungaroring)\b/i, key: "hu" },
  { needle: /\b(suzuka|japanese|japan)\b/i, key: "jp" },
  { needle: /\b(melbourne|australian|australia)\b/i, key: "au" },
  { needle: /\b(montreal|canadian|canada)\b/i, key: "ca" },
  { needle: /\bsingapore\b/i, key: "sg" },
  { needle: /\b(abu dhabi|yas marina)\b/i, key: "ae" },
  { needle: /\b(qatar|lusail)\b/i, key: "qa" },
  { needle: /\b(jeddah|saudi)\b/i, key: "sa" },
  { needle: /\b(malaysia|sepang)\b/i, key: "my" },
  { needle: /\b(bahrain|sakhir)\b/i, key: "bh" },
  { needle: /\b(shanghai|chinese|china)\b/i, key: "cn" },
  { needle: /\b(baku|azerbaijan)\b/i, key: "az" },
];

/** 2026 hosts this site lists, including the Malaysia round. */
export const F1_2026_HOST_FLAGS = [
  { code: "au", hint: "Australian Grand Prix" },
  { code: "cn", hint: "Chinese Grand Prix" },
  { code: "jp", hint: "Japanese Grand Prix" },
  { code: "bh", hint: "Bahrain Grand Prix" },
  { code: "sa", hint: "Saudi Arabian Grand Prix" },
  { code: "us", hint: "United States Grand Prix" },
  { code: "us", hint: "Miami Grand Prix" },
  { code: "us", hint: "Las Vegas Grand Prix" },
  { code: "ca", hint: "Canadian Grand Prix" },
  { code: "mc", hint: "Monaco Grand Prix" },
  { code: "es", hint: "Barcelona Grand Prix" },
  { code: "at", hint: "Austrian Grand Prix" },
  { code: "gb", hint: "British Grand Prix" },
  { code: "be", hint: "Belgian Grand Prix" },
  { code: "hu", hint: "Hungarian Grand Prix" },
  { code: "nl", hint: "Dutch Grand Prix" },
  { code: "it", hint: "Italian Grand Prix" },
  { code: "es", hint: "Spanish Grand Prix" },
  { code: "az", hint: "Azerbaijan Grand Prix" },
  { code: "my", hint: "Malaysia Grand Prix" },
  { code: "sg", hint: "Singapore Grand Prix" },
  { code: "mx", hint: "Mexico City Grand Prix" },
  { code: "br", hint: "São Paulo Grand Prix" },
  { code: "qa", hint: "Qatar Grand Prix" },
  { code: "ae", hint: "Abu Dhabi Grand Prix" },
] as const;

function normaliseNationToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function flagByKey(key: string): FlagEntry | null {
  return FLAGS.find((entry) => entry.key === key) ?? null;
}

function initialsFromToken(value: string): string {
  const words = value.split(" ").filter(Boolean);
  if (words.length >= 2) {
    return words
      .map((word) => word[0] ?? "")
      .join("")
      .slice(0, 3)
      .toUpperCase();
  }
  const compact = value.replace(/[^a-z0-9]/g, "");
  return (compact.slice(0, 3) || "—").toUpperCase();
}

function fallback(initials: string): PosterFlag {
  return { kind: "fallback", initials, fill: FALLBACK_FILL };
}

function imageFlag(entry: FlagEntry): PosterFlag {
  if (!entry.code || entry.code === ULSTER_BANNER_CODE) return fallback(entry.initials);
  return {
    kind: "image",
    code: entry.code,
    src: `${FLAG_ASSET_DIR}/${entry.code}.svg`,
    objectPosition: FLAG_OBJECT_POSITION[entry.code] ?? FLAG_OBJECT_POSITION_DEFAULT,
    initials: entry.initials,
  };
}

export function resolvePosterFlag(input: {
  countryCode?: string | null;
  countryName?: string | null;
  /** Used only when no country code or name was supplied. */
  hint?: string | null;
}): PosterFlag {
  const code = normaliseNationToken(input.countryCode ?? "");
  const name = normaliseNationToken(input.countryName ?? "");
  if (code || name) {
    const entry = FLAGS.find(
      (flag) => flag.names.includes(code) || flag.names.includes(name),
    );
    if (!entry) return fallback(initialsFromToken(name || code));
    return imageFlag(entry);
  }

  const hint = input.hint ?? "";
  const matched = TITLE_FLAGS.find((entry) => entry.needle.test(hint));
  const entry = matched ? flagByKey(matched.key) : null;
  if (!entry) return fallback(initialsFromToken(hint) || "—");
  return imageFlag(entry);
}
