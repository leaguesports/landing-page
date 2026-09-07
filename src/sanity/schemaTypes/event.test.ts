import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EVENT_SERIES_OPTIONS,
  EVENT_SPORT_OPTIONS,
  eventSchemaFieldNames,
  eventType,
  f1DetailsType,
} from "./event.ts";

describe("event Sanity schema", () => {
  it("is a defineType document named event", () => {
    assert.equal(eventType.name, "event");
    assert.equal(eventType.type, "document");
  });

  it("adds SEO + sports fields and keeps f1Details", () => {
    const names = eventSchemaFieldNames();
    for (const field of [
      "sport",
      "series",
      "startDateTime",
      "teams",
      "competition",
      "broadcastInfo",
      "hostVenue",
      "seoIntro",
      "localAngle",
      "faqs",
      "relatedGuide",
      "seoTitle",
      "seoDescription",
      "f1Details",
      "startsAt",
      "title",
      "slug",
    ]) {
      assert.ok(names.includes(field), `missing field ${field}`);
    }
  });

  it("keeps existing f1Details nested fields", () => {
    const nested = f1DetailsType.fields.map((field) => field.name);
    assert.deepEqual(nested, [
      "description",
      "dateTime",
      "round",
      "track",
      "laps",
      "distance",
    ]);
  });

  it("supports rugby, PSL, cricket, F1, and Six Nations in schema lists", () => {
    const sports = EVENT_SPORT_OPTIONS.map((item) => item.value);
    const series = EVENT_SERIES_OPTIONS.map((item) => item.value);
    assert.ok(sports.includes("rugby"));
    assert.ok(sports.includes("soccer"));
    assert.ok(sports.includes("cricket"));
    assert.ok(sports.includes("motorsport"));
    assert.ok(series.includes("springboks"));
    assert.ok(series.includes("psl"));
    assert.ok(series.includes("sa20"));
    assert.ok(series.includes("proteas"));
    assert.ok(series.includes("f1"));
    assert.ok(series.includes("premier-league"));
    assert.ok(series.includes("six-nations"));
  });

  it("references existing venue and guide document types", () => {
    const host = eventType.fields.find((field) => field.name === "hostVenue") as {
      to?: unknown;
    };
    const guide = eventType.fields.find((field) => field.name === "relatedGuide") as {
      to?: unknown;
    };
    assert.deepEqual(host.to, [{ type: "venue" }]);
    assert.deepEqual(guide.to, [{ type: "guide" }]);
  });
});
