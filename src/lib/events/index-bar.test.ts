import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  completeFixtureFaqs,
  INDEX_FAQ_MIN,
  isFixtureIndexable,
  isMeaningfulText,
  wordCount,
} from "./index-bar.ts";

function words(count: number, seed = "intro"): string {
  return Array.from({ length: count }, (_, i) => `${seed}${i + 1}`).join(" ");
}

const INTRO = words(50, "kickoff");
const ANGLE = words(35, "joburg");
const FAQ = {
  question: "Where can I watch this fixture in Johannesburg?",
  answer: words(12, "screens"),
};

describe("wordCount + isMeaningfulText", () => {
  it("counts words and rejects empty or placeholder copy", () => {
    assert.equal(wordCount("  one two   three "), 3);
    assert.equal(wordCount(""), 0);
    assert.equal(isMeaningfulText(INTRO, 40), true);
    assert.equal(isMeaningfulText("Watch this.", 40), false);
    assert.equal(isMeaningfulText("   ", 1), false);
    assert.equal(isMeaningfulText("TBD", 1), false);
    assert.equal(isMeaningfulText("lorem ipsum", 1), false);
  });

  it("reads Portable Text blocks the same as plain text", () => {
    const blocks = [
      {
        _type: "block",
        children: [{ _type: "span", text: words(20, "a") }],
      },
      {
        _type: "block",
        children: [{ _type: "span", text: words(25, "b") }],
      },
    ];
    assert.equal(isMeaningfulText(blocks, 40), true);
  });
});

describe("isFixtureIndexable", () => {
  it("is not indexable when intro, local angle, or FAQs are missing", () => {
    assert.equal(isFixtureIndexable({}), false);
    assert.equal(
      isFixtureIndexable({ seoIntro: INTRO, localAngle: ANGLE, faqs: [] }),
      false,
    );
    assert.equal(
      isFixtureIndexable({
        seoIntro: "Thin stub.",
        localAngle: ANGLE,
        faqs: [FAQ, FAQ, FAQ],
      }),
      false,
    );
    assert.equal(
      isFixtureIndexable({
        seoIntro: INTRO,
        localAngle: "Local.",
        faqs: [FAQ, FAQ, FAQ],
      }),
      false,
    );
    assert.equal(
      isFixtureIndexable({
        seoIntro: INTRO,
        localAngle: ANGLE,
        faqs: [FAQ, FAQ],
      }),
      false,
    );
    assert.equal(
      isFixtureIndexable({
        seoIntro: INTRO,
        localAngle: ANGLE,
        faqs: [
          FAQ,
          FAQ,
          { question: "Q?", answer: "No." },
        ],
      }),
      false,
    );
  });

  it("is indexable when intro, local angle, and 3–5 complete FAQs are present", () => {
    assert.equal(
      isFixtureIndexable({
        seoIntro: INTRO,
        localAngle: ANGLE,
        faqs: [FAQ, { ...FAQ, question: "What time does kickoff start locally?" }, { ...FAQ, question: "Which bars screen this in Cape Town?" }],
      }),
      true,
    );
    assert.ok(INDEX_FAQ_MIN === 3);
    assert.equal(
      completeFixtureFaqs([FAQ, FAQ, FAQ, FAQ, FAQ, FAQ]).length,
      6,
    );
  });
});
