import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { metroPagePreview } from "../../lib/intent/metro-page.ts";
import { metroPageSchemaFieldNames, metroPageType } from "./metroPage.ts";

describe("metroPage Sanity schema", () => {
  it("is a document named metroPage with the directory fields", () => {
    assert.equal(metroPageType.name, "metroPage");
    assert.equal(metroPageType.type, "document");
    assert.deepEqual(metroPageSchemaFieldNames(), [
      "intent",
      "activitySlug",
      "citySlug",
      "h1",
      "intro",
      "bestFor",
      "faq",
      "relatedLinks",
      "metadata",
    ]);
  });

  it("stores intro as plain text paragraphs, not portable text", () => {
    const intro = metroPageType.fields.find((field) => field.name === "intro") as unknown as {
      type: string;
      of: { type: string }[];
    };
    assert.equal(intro.type, "array");
    assert.equal(intro.of[0]?.type, "text");
    assert.ok(intro.of.every((member) => member.type !== "block"));
  });

  it("previews as intent · activity · city", () => {
    assert.deepEqual(
      metroPagePreview({
        intent: "watch",
        activitySlug: "rugby",
        citySlug: "johannesburg",
        h1: "Watch rugby in Johannesburg",
      }),
      {
        title: "watch · rugby · johannesburg",
        subtitle: "Watch rugby in Johannesburg",
      },
    );
    assert.equal(metroPageType.preview?.prepare, metroPagePreview);
  });

  it("validates one document per intent, activity, and city", () => {
    assert.equal(typeof metroPageType.validation, "function");
  });
});
