import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TypedObject } from "@portabletext/types";
import { getGuideFaqs, JOBURG_PADEL_GUIDE_SLUG } from "../../data/guides/faqs.ts";
import { stripMatchingFaqBlocks } from "./stripFaqBlocks.ts";

function block(
  style: string,
  text: string,
  key = style + text.slice(0, 12),
): TypedObject {
  return {
    _type: "block",
    _key: key,
    style,
    children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
    markDefs: [],
  };
}

const faqs = getGuideFaqs(JOBURG_PADEL_GUIDE_SLUG);

describe("stripMatchingFaqBlocks", () => {
  it("removes matching FAQ headings and their answers, keeping the rest", () => {
    const content: TypedObject[] = [
      block("h3", "The Heavy Hitters (Premium & Elite Venues)"),
      block("normal", "Elite clubs with premium amenities."),
      block("h3", faqs[0]!.question),
      block("normal", faqs[0]!.answer),
      block("h3", faqs[1]!.question),
      block("normal", faqs[1]!.answer),
      block("h3", faqs[2]!.question),
      block("normal", faqs[2]!.answer),
      block("h3", "Ready to Claim the Court?"),
      block("normal", "Head over to the venue directory."),
    ];

    const stripped = stripMatchingFaqBlocks(content, faqs);
    const headings = stripped
      .filter((item) => "style" in item && item.style === "h3")
      .map((item) => {
        const children = "children" in item && Array.isArray(item.children)
          ? item.children
          : [];
        return children
          .map((child) =>
            child && typeof child === "object" && "text" in child
              ? String(child.text)
              : "",
          )
          .join("");
      });

    assert.deepEqual(headings, [
      "The Heavy Hitters (Premium & Elite Venues)",
      "Ready to Claim the Court?",
    ]);
    assert.equal(
      stripped.some(
        (item) =>
          JSON.stringify(item).includes("R240 to R300") ||
          JSON.stringify(item).includes("Playtomic app"),
      ),
      false,
    );
  });

  it("matches curly apostrophes in Sanity headings", () => {
    const content: TypedObject[] = [
      block("h3", "Ready to Claim the Court?"),
      block("normal", "Keep this."),
      block(
        "h3",
        "How do I find other players if I don’t have a four-ball?",
      ),
      block("normal", "Sanity answer that should be dropped."),
    ];

    const stripped = stripMatchingFaqBlocks(content, faqs);
    assert.equal(stripped.length, 2);
    assert.equal(JSON.stringify(stripped).includes("Keep this."), true);
    assert.equal(
      JSON.stringify(stripped).includes("Sanity answer that should be dropped."),
      false,
    );
  });

  it("drops a leftover FAQ section heading when questions are stripped", () => {
    const content: TypedObject[] = [
      block("h2", "Frequently asked questions"),
      block("h3", faqs[0]!.question),
      block("normal", faqs[0]!.answer),
      block("h3", "Ready to Claim the Court?"),
    ];

    const stripped = stripMatchingFaqBlocks(content, faqs);
    assert.equal(stripped.length, 1);
    assert.equal(JSON.stringify(stripped[0]).includes("Ready to Claim"), true);
  });

  it("leaves content unchanged when there are no structured FAQs", () => {
    const content: TypedObject[] = [
      block("h3", faqs[0]!.question),
      block("normal", faqs[0]!.answer),
    ];

    assert.equal(stripMatchingFaqBlocks(content, []), content);
  });
});
