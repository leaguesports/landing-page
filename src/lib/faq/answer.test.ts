import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  faqAnswerPlainText,
  isSafeFaqHref,
  parseFaqAnswer,
} from "./answer.ts";

describe("parseFaqAnswer", () => {
  it("keeps plain answers as a single text part", () => {
    assert.deepEqual(parseFaqAnswer("Book early for Tests."), [
      { type: "text", text: "Book early for Tests." },
    ]);
  });

  it("splits safe markdown links and leaves the surrounding sentence", () => {
    assert.deepEqual(
      parseFaqAnswer(
        "Open [Bench Warmers](/venues/benchwarmers-sports-bar) in Rosebank.",
      ),
      [
        { type: "text", text: "Open " },
        {
          type: "link",
          text: "Bench Warmers",
          href: "/venues/benchwarmers-sports-bar",
        },
        { type: "text", text: " in Rosebank." },
      ],
    );
  });

  it("does not link off-site or protocol-relative targets", () => {
    assert.equal(isSafeFaqHref("//evil.example"), false);
    assert.equal(isSafeFaqHref("https://evil.example/venues"), false);
    assert.equal(isSafeFaqHref("javascript:alert(1)"), false);
    const parsed = parseFaqAnswer("See [docs](https://evil.example/x).");
    assert.equal(
      parsed.some((part) => part.type === "link"),
      false,
    );
    assert.match(parsed.map((part) => part.text).join(""), /https:\/\/evil\.example\/x/);
  });
});

describe("faqAnswerPlainText", () => {
  it("uses the link label and strips HTML", () => {
    assert.equal(
      faqAnswerPlainText(
        "Open the <strong>[sports-bar guide](/guides/best-sports-bars-johannesburg)</strong> before you go.",
      ),
      "Open the sports-bar guide before you go.",
    );
  });
});
