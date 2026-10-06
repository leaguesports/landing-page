import { defineArrayMember, defineField, defineType } from "../define.ts";
import {
  METRO_PAGE_UNIQUE_MESSAGE,
  metroPagePreview,
  validateMetroPageUnique,
} from "../../lib/intent/metro-page.ts";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugRule(rule: {
  required: () => {
    custom: (fn: (value: string | undefined) => true | string) => unknown;
  };
}) {
  return rule.required().custom((value) => {
    if (!value) return true;
    if (!SLUG_PATTERN.test(value)) {
      return "Use a lowercase slug such as johannesburg, padel, or premier-league";
    }
    return true;
  });
}

/**
 * Play/watch sport×city directory copy.
 * Intro is an array of plain text paragraphs (not Portable Text): wave-1
 * drafts are 2–3 unformatted paragraphs, matching event FAQ answers.
 */
export const metroPageType = defineType({
  name: "metroPage",
  title: "Metro page",
  type: "document",
  description:
    "Copy for /play/{sport}/{city} and /watch/{sport|series}/{city}. One document per intent + activity + city. Store the public URL slug (f1, not motorsport; johannesburg, not joburg).",
  fields: [
    defineField({
      name: "intent",
      title: "Intent",
      type: "string",
      options: {
        list: [
          { title: "Play", value: "play" },
          { title: "Watch", value: "watch" },
        ],
        layout: "radio",
      },
      validation: (rule: { required: () => unknown }) => rule.required(),
    }),
    defineField({
      name: "activitySlug",
      title: "Activity slug",
      type: "string",
      description:
        "Sport or watch series slug from the URL: padel, rugby, cricket, soccer, f1, motorsport, premier-league.",
      validation: slugRule,
    }),
    defineField({
      name: "citySlug",
      title: "City slug",
      type: "string",
      description: "Directory city slug: johannesburg, cape-town. Not joburg.",
      validation: slugRule,
    }),
    defineField({
      name: "h1",
      title: "H1",
      type: "string",
      description: "Visible heading. Leave empty to keep the templated heading.",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "array",
      description: "2–3 short paragraphs. One plain-text paragraph per item.",
      of: [
        defineArrayMember({
          type: "text",
          rows: 4,
          title: "Paragraph",
        }),
      ],
      validation: (rule: { max: (limit: number) => unknown }) => rule.max(6),
    }),
    defineField({
      name: "bestFor",
      title: "Best for",
      type: "text",
      rows: 2,
      description: "One line, for example “Best for: Sandton weekday evenings”.",
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "metroPageFaq",
          title: "FAQ",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (rule: { required: () => unknown }) => rule.required(),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 4,
              description: "Plain text. Inline links use [label](/path).",
              validation: (rule: { required: () => unknown }) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "relatedLinks",
      title: "Related links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "metroPageLink",
          title: "Link",
          fields: [
            defineField({
              name: "href",
              title: "Href",
              type: "string",
              description: "Site path such as /guides/best-padel-courts-joburg or /events.",
              validation: (rule: { required: () => unknown }) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule: { required: () => unknown }) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "metadata",
      title: "Metadata",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          description: "Document title. Leave empty to keep the template. A title ending in “| LeagueSports” is used as-is.",
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "ogTitle",
          title: "OG title",
          type: "string",
        }),
        defineField({
          name: "ogDescription",
          title: "OG description",
          type: "text",
          rows: 3,
        }),
      ],
    }),
  ],
  validation: (rule: {
    custom: (fn: typeof validateMetroPageUnique) => unknown;
  }) => rule.custom(validateMetroPageUnique),
  preview: {
    select: {
      intent: "intent",
      activitySlug: "activitySlug",
      citySlug: "citySlug",
      h1: "h1",
    },
    prepare: metroPagePreview,
  },
});

export const metroPageSchemaTypes = [metroPageType];

export function metroPageSchemaFieldNames(): string[] {
  return metroPageType.fields.map((field) => field.name);
}

export { METRO_PAGE_UNIQUE_MESSAGE };
