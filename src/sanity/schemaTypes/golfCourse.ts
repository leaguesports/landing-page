import { defineArrayMember, defineField, defineType } from "../define.ts";

/**
 * Venue `golfCourse` objects used by live golf rounds.
 * Mirror of leaguesports/sanity-cms `schemaTypes/venue.ts` golfCourse, plus
 * handicap fields from landing-page #205.
 *
 * Studio lives outside this app — copy these types into the Sanity workspace.
 * Do not invent course/slope values; Content / Venue Scout fills after merge.
 *
 * Gender is not on the existing tee object, so it is not added.
 */

export const TEE_HANDICAP_INCOMPLETE_MESSAGE =
  "Incomplete for handicap: course rating and slope are required.";

export type GolfTeeHandicapFields = {
  courseRating?: number | null;
  slopeRating?: number | null;
  slope?: number | null;
};

function isFilledNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Slope from `slopeRating`, falling back to the existing CMS `slope` field. */
export function teeSlopeRating(
  tee: GolfTeeHandicapFields | null | undefined,
): number | null {
  if (isFilledNumber(tee?.slopeRating)) return tee.slopeRating;
  if (isFilledNumber(tee?.slope)) return tee.slope;
  return null;
}

export function isTeeCompleteForHandicap(
  tee: GolfTeeHandicapFields | null | undefined,
): boolean {
  return isFilledNumber(tee?.courseRating) && teeSlopeRating(tee) !== null;
}

/** Sanity custom-validation result: `true` or a warning string. */
export function teeHandicapCompleteness(
  value: unknown,
): true | typeof TEE_HANDICAP_INCOMPLETE_MESSAGE {
  if (!value || typeof value !== "object") return true;
  const tee = value as GolfTeeHandicapFields;
  return isTeeCompleteForHandicap(tee)
    ? true
    : TEE_HANDICAP_INCOMPLETE_MESSAGE;
}

type NumberRule = {
  min: (n: number) => NumberRule;
  max: (n: number) => NumberRule;
};

type RequiredNumberRule = NumberRule & {
  required: () => NumberRule;
};

type WarningRule = {
  custom: (fn: (value: unknown) => true | string) => {
    warning: () => unknown;
  };
};

export const golfTeeDistanceType = defineType({
  name: "golfTeeDistance",
  title: "Tee distance",
  type: "object",
  fields: [
    defineField({
      name: "teeName",
      title: "Tee name",
      type: "string",
      validation: (rule: { required: () => unknown }) => rule.required(),
    }),
    defineField({
      name: "meters",
      title: "Meters",
      type: "number",
      validation: (rule: RequiredNumberRule) =>
        rule.required().min(50).max(700),
    }),
  ],
  preview: {
    select: { title: "teeName", meters: "meters" },
    prepare({ title, meters }: { title?: string; meters?: number }) {
      return {
        title: title || "Tee",
        subtitle: meters ? `${meters} m` : undefined,
      };
    },
  },
});

export const golfTeeType = defineType({
  name: "golfTee",
  title: "Tee",
  type: "object",
  validation: (rule: WarningRule) =>
    rule.custom((value) => teeHandicapCompleteness(value)).warning(),
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule: { required: () => unknown }) => rule.required(),
    }),
    defineField({
      name: "color",
      title: "Color",
      type: "string",
      description: "e.g. White, Blue, Championship",
    }),
    defineField({
      name: "courseRating",
      title: "Course rating",
      type: "number",
      description:
        "WHS course rating for this tee. Leave empty until a real rating is known — do not invent.",
    }),
    defineField({
      name: "slopeRating",
      title: "Slope rating",
      type: "number",
      description:
        "WHS slope (typically 55–155). Leave empty until a real rating is known — do not invent.",
      validation: (rule: NumberRule) => rule.min(55).max(155),
    }),
    defineField({
      name: "slope",
      title: "Slope (legacy)",
      type: "number",
      description:
        "Existing CMS field. Prefer slopeRating. Kept so published tee documents stay readable.",
      deprecated: {
        reason: "Use slopeRating. Existing slope values remain valid until Content migrates.",
      },
      hidden: ({ value }: { value?: unknown }) => value === undefined,
      validation: (rule: NumberRule) => rule.min(55).max(155),
    }),
    defineField({
      name: "par",
      title: "Par (optional override)",
      type: "number",
      description:
        "Tee-specific total par when it differs from the course par. Leave empty to use course parTotal.",
      validation: (rule: NumberRule) => rule.min(27).max(80),
    }),
    defineField({
      name: "totalMeters",
      title: "Total length (m)",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "name",
      color: "color",
      courseRating: "courseRating",
      slopeRating: "slopeRating",
      slope: "slope",
    },
    prepare({
      title,
      color,
      courseRating,
      slopeRating,
      slope,
    }: {
      title?: string;
      color?: string;
      courseRating?: number;
      slopeRating?: number;
      slope?: number;
    }) {
      const slopeValue = teeSlopeRating({ courseRating, slopeRating, slope });
      const handicap = isTeeCompleteForHandicap({
        courseRating,
        slopeRating,
        slope,
      })
        ? `CR ${courseRating} / Slope ${slopeValue}`
        : "Incomplete for handicap";
      return {
        title: title || "Tee",
        subtitle: [color, handicap].filter(Boolean).join(" · "),
      };
    },
  },
});

export const golfHoleType = defineType({
  name: "golfHole",
  title: "Hole",
  type: "object",
  fields: [
    defineField({
      name: "number",
      title: "Hole number",
      type: "number",
      validation: (rule: RequiredNumberRule) =>
        rule.required().min(1).max(18),
    }),
    defineField({
      name: "par",
      title: "Par",
      type: "number",
      validation: (rule: RequiredNumberRule) =>
        rule.required().min(3).max(5),
    }),
    defineField({
      name: "strokeIndex",
      title: "Stroke index",
      type: "number",
      description: "Men's stroke index as stored (1–18).",
      validation: (rule: RequiredNumberRule) =>
        rule.required().min(1).max(18),
    }),
    defineField({
      name: "distances",
      title: "Distances by tee (meters)",
      type: "array",
      of: [defineArrayMember({ type: "golfTeeDistance" })],
    }),
  ],
  preview: {
    select: {
      number: "number",
      par: "par",
      strokeIndex: "strokeIndex",
    },
    prepare({
      number,
      par,
      strokeIndex,
    }: {
      number?: number;
      par?: number;
      strokeIndex?: number;
    }) {
      return {
        title: `Hole ${number ?? "?"}`,
        subtitle: `Par ${par ?? "?"} · SI ${strokeIndex ?? "?"}`,
      };
    },
  },
});

export const golfCourseType = defineType({
  name: "golfCourse",
  title: "Golf course scorecard",
  type: "object",
  description:
    "Hole-by-hole scorecard for live golf rounds. Only venues with this filled can start a round on the site.",
  fields: [
    defineField({
      name: "courseName",
      title: "Course name",
      type: "string",
      description: "Optional when the venue has multiple layouts (e.g. East / West).",
    }),
    defineField({
      name: "holesTotal",
      title: "Holes",
      type: "number",
      initialValue: 18,
      validation: (rule: NumberRule) => rule.min(9).max(18),
    }),
    defineField({
      name: "parTotal",
      title: "Total par",
      type: "number",
      validation: (rule: NumberRule) => rule.min(27).max(80),
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 2,
      description: "e.g. Scorecard source year, temporary greens, layout caveats.",
    }),
    defineField({
      name: "tees",
      title: "Tee boxes",
      type: "array",
      of: [defineArrayMember({ type: "golfTee" })],
    }),
    defineField({
      name: "holes",
      title: "Holes",
      type: "array",
      validation: (rule: NumberRule) => rule.min(9).max(18),
      of: [defineArrayMember({ type: "golfHole" })],
    }),
  ],
});

export const golfCourseSchemaTypes = [
  golfTeeDistanceType,
  golfTeeType,
  golfHoleType,
  golfCourseType,
];

export function golfTeeFieldNames(): string[] {
  return golfTeeType.fields.map((field) => field.name);
}

export function golfHoleFieldNames(): string[] {
  return golfHoleType.fields.map((field) => field.name);
}

export function golfCourseFieldNames(): string[] {
  return golfCourseType.fields.map((field) => field.name);
}
