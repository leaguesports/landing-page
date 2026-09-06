import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  firstSearchParam,
  scorecardStartHref,
  venueQueryKey,
} from "./start-href.ts";

describe("firstSearchParam", () => {
  it("trims a string and takes the first array entry", () => {
    assert.equal(firstSearchParam("  padel-lab  "), "padel-lab");
    assert.equal(firstSearchParam([" golf ", "ignored"]), "golf");
    assert.equal(firstSearchParam(undefined), "");
    assert.equal(firstSearchParam(null), "");
    assert.equal(firstSearchParam(["  "]), "");
  });
});

describe("venueQueryKey", () => {
  it("prefers venue over cmsId and accepts either", () => {
    assert.equal(
      venueQueryKey({ venue: "padel-lab-rivonia", cmsId: "venue-1" }),
      "padel-lab-rivonia",
    );
    assert.equal(venueQueryKey({ cmsId: "venue-1" }), "venue-1");
    assert.equal(venueQueryKey({ venue: "  ", cmsId: "  " }), "");
  });
});

describe("scorecardStartHref", () => {
  it("defaults to the padel start flow with no venue", () => {
    assert.equal(scorecardStartHref(), "/padel/new");
    assert.equal(scorecardStartHref({}), "/padel/new");
    assert.equal(scorecardStartHref({ sport: "padel" }), "/padel/new");
    assert.equal(scorecardStartHref({ sport: "unknown" }), "/padel/new");
  });

  it("routes golf to /golf/new", () => {
    assert.equal(scorecardStartHref({ sport: "golf" }), "/golf/new");
    assert.equal(scorecardStartHref({ sport: "Golf" }), "/golf/new");
  });

  it("forwards a venue slug or cmsId on the start URL", () => {
    assert.equal(
      scorecardStartHref({ venue: "padel-lab-rivonia" }),
      "/padel/new?venue=padel-lab-rivonia",
    );
    assert.equal(
      scorecardStartHref({ sport: "golf", venue: "glendower" }),
      "/golf/new?venue=glendower",
    );
    assert.equal(
      scorecardStartHref({ cmsId: "venue-abc" }),
      "/padel/new?venue=venue-abc",
    );
    assert.equal(
      scorecardStartHref({ venue: "padel & co" }),
      `/padel/new?venue=${encodeURIComponent("padel & co")}`,
    );
  });

  it("treats a blank venue as optional", () => {
    assert.equal(scorecardStartHref({ venue: "  " }), "/padel/new");
    assert.equal(scorecardStartHref({ sport: "golf", cmsId: "" }), "/golf/new");
  });
});
