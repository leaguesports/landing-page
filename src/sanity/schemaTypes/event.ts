import { defineArrayMember, defineField, defineType } from "../define.ts";

/**
 * Watch sports Content can attach to a fixture. Not a hard page limit —
 * rugby, PSL, cricket, F1, and PL/Six Nations all share `/events/{slug}`.
 */
export const EVENT_SPORT_OPTIONS = [
  { title: "Rugby", value: "rugby" },
  { title: "Soccer", value: "soccer" },
  { title: "Cricket", value: "cricket" },
  { title: "Motorsport", value: "motorsport" },
  { title: "Padel", value: "padel" },
  { title: "Tennis", value: "tennis" },
] as const;

/**
 * Series beyond f1 / six-nations. Priority for Content later:
 * Springboks/major rugby → PSL marquee → Proteas/SA20 → F1 → PL/Six Nations.
 */
export const EVENT_SERIES_OPTIONS = [
  { title: "Springboks", value: "springboks" },
  { title: "Rugby Championship", value: "rugby-championship" },
  { title: "United Rugby Championship", value: "urc" },
  { title: "Currie Cup", value: "currie-cup" },
  { title: "Six Nations", value: "six-nations" },
  { title: "PSL / Premiership", value: "psl" },
  { title: "Premier League", value: "premier-league" },
  { title: "Proteas", value: "proteas" },
  { title: "SA20", value: "sa20" },
  { title: "Formula 1", value: "f1" },
  { title: "Formula 2", value: "f2" },
  { title: "MotoGP", value: "motogp" },
] as const;

export const eventFaqType = defineType({
  name: "eventFaq",
  title: "Fixture FAQ",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      description: "A real search query, not a heading restated as a question.",
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      rows: 4,
      description: "Unique answer. Indexing needs 3–5 complete FAQs.",
    }),
  ],
});

export const eventTeamType = defineType({
  name: "eventTeam",
  title: "Team",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
  ],
});

/** Existing F1 nested object — keep field names the motorsport pages already query. */
export const f1DetailsType = defineType({
  name: "f1Details",
  title: "F1 details",
  type: "object",
  fields: [
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "dateTime",
      title: "Session date/time",
      type: "datetime",
    }),
    defineField({
      name: "round",
      title: "Round",
      type: "number",
    }),
    defineField({
      name: "track",
      title: "Track",
      type: "string",
    }),
    defineField({
      name: "laps",
      title: "Laps",
      type: "number",
    }),
    defineField({
      name: "distance",
      title: "Distance",
      type: "string",
    }),
  ],
});

/**
 * Sanity `event` document used by `/events/{slug}`.
 * Content Manager fills seoIntro / localAngle / faqs after these fields ship.
 * Thin stubs stay on the hub but are noindex until that bar is met.
 */
export const eventType = defineType({
  name: "event",
  title: "Event / fixture",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Fixture name shown on /events and used for the URL slug.",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "sport",
      title: "Sport",
      type: "string",
      options: { list: [...EVENT_SPORT_OPTIONS] },
      description: "Hub sport (rugby, soccer, cricket, motorsport, …).",
    }),
    defineField({
      name: "series",
      title: "Series",
      type: "string",
      options: { list: [...EVENT_SERIES_OPTIONS] },
      description:
        "Competition series. Not limited to f1 / six-nations — rugby, PSL, SA20, cricket, and PL are supported.",
    }),
    defineField({
      name: "startDateTime",
      title: "Kickoff",
      type: "datetime",
      description:
        "Canonical kickoff. GROQ falls back to startsAt, then f1Details.dateTime.",
    }),
    defineField({
      name: "startsAt",
      title: "Kickoff (legacy)",
      type: "datetime",
      description:
        "Legacy event-level kickoff. Prefer startDateTime for new fixtures.",
      hidden: ({ parent }: { parent?: { startDateTime?: unknown } }) =>
        Boolean(parent?.startDateTime),
    }),
    defineField({
      name: "teams",
      title: "Teams",
      type: "array",
      of: [defineArrayMember({ type: "eventTeam" })],
    }),
    defineField({
      name: "competition",
      title: "Competition",
      type: "string",
      description: "e.g. Rugby Championship, PSL, SA20, Premier League.",
    }),
    defineField({
      name: "broadcastInfo",
      title: "Broadcast info",
      type: "text",
      rows: 3,
      description: "Where it is on TV or streaming, if known. Do not invent.",
    }),
    defineField({
      name: "hostVenue",
      title: "Host venue",
      type: "reference",
      to: [{ type: "venue" }],
      description: "Stadium or listed venue. Leave empty when unknown.",
    }),
    defineField({
      name: "featured",
      title: "Featured on Events hub",
      type: "boolean",
    }),
    defineField({
      name: "f1Details",
      title: "F1 details",
      type: "f1Details",
      description: "Keep existing motorsport fields. Hidden unless series is F1/F2.",
      hidden: ({ parent }: { parent?: { series?: string } }) => {
        const series = parent?.series;
        return series !== "f1" && series !== "f2";
      },
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      description: "Optional. Defaults from competition / teams / date.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      description: "Optional. Defaults from the unique intro when present.",
    }),
    defineField({
      name: "seoIntro",
      title: "Unique intro",
      type: "text",
      rows: 8,
      description:
        "Required to index. Aim for ~80–120 unique words. Thin stubs stay noindex.",
    }),
    defineField({
      name: "localAngle",
      title: "Local angle",
      type: "text",
      rows: 6,
      description:
        "Required to index. Aim for ~60–100 words on Joburg, CT, Durban, or Pretoria.",
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [defineArrayMember({ type: "eventFaq" })],
      description:
        "Required to index: 3–5 items with both a question and an answer.",
    }),
    defineField({
      name: "relatedGuide",
      title: "Related guide",
      type: "reference",
      to: [{ type: "guide" }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      series: "series",
      sport: "sport",
      startDateTime: "startDateTime",
    },
    prepare({
      title,
      series,
      sport,
      startDateTime,
    }: {
      title?: string;
      series?: string;
      sport?: string;
      startDateTime?: string;
    }) {
      const bits = [sport, series, startDateTime].filter(Boolean);
      return {
        title: title || "Untitled fixture",
        subtitle: bits.join(" · "),
      };
    },
  },
});

export const eventSchemaTypes = [eventFaqType, eventTeamType, f1DetailsType, eventType];

export function eventSchemaFieldNames(): string[] {
  return eventType.fields.map((field) => field.name);
}
