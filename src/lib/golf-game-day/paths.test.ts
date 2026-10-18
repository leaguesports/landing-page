import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatGameDayDate,
  gameDayHeadline,
  localIsoDate,
  presentGameDay,
} from "./paths.ts";

describe("game day dates", () => {
  it("derives Sun 1 Nov 2026 in Africa/Johannesburg", () => {
    assert.equal(formatGameDayDate("2026-11-01"), "Sun 1 Nov");
    assert.equal(
      gameDayHeadline("Zebula Golf Estate & Spa", "2026-11-01"),
      "ZEBULA · SUN 1 NOV",
    );
  });

  it("rolls the local calendar day at Johannesburg midnight", () => {
    assert.equal(localIsoDate(new Date("2026-10-31T21:30:00.000Z")), "2026-10-31");
    assert.equal(localIsoDate(new Date("2026-10-31T22:30:00.000Z")), "2026-11-01");
  });

  it("renders from the date field when the stored label disagrees", () => {
    const shown = presentGameDay({
      venueName: "Zebula Golf Estate & Spa",
      date: "2026-11-01",
      dateLabel: "Sat 1 Nov",
      headline: "ZEBULA · SAT 1 NOV",
    });
    assert.equal(shown.dateLabel, "Sun 1 Nov");
    assert.equal(shown.headline, "ZEBULA · SUN 1 NOV");
    assert.equal(shown.place, "Zebula");
  });
});
