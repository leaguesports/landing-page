import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeGuideContent,
  resolveGuideLinkHref,
  unknownPortableTextMark,
  unknownPortableTextType,
} from "./portableText.ts";

describe("resolveGuideLinkHref", () => {
  it("coerces an undefined href to a hash anchor instead of throwing", () => {
    assert.deepEqual(resolveGuideLinkHref(undefined), {
      kind: "anchor",
      href: "#",
    });
    assert.deepEqual(resolveGuideLinkHref(null), {
      kind: "anchor",
      href: "#",
    });
    assert.deepEqual(resolveGuideLinkHref(""), {
      kind: "anchor",
      href: "#",
    });
  });

  it("uses internal paths for same-origin URLs and next/link-safe hrefs", () => {
    assert.deepEqual(resolveGuideLinkHref("/guides/best-padel-courts-joburg"), {
      kind: "internal",
      href: "/guides/best-padel-courts-joburg",
    });
    assert.deepEqual(
      resolveGuideLinkHref(
        "https://leaguesports.co.za/guides/best-padel-courts-joburg",
      ),
      {
        kind: "internal",
        href: "/guides/best-padel-courts-joburg",
      },
    );
  });

  it("keeps absolute http(s) URLs as external anchors", () => {
    assert.deepEqual(resolveGuideLinkHref("https://example.com/bars"), {
      kind: "external",
      href: "https://example.com/bars",
    });
  });
});

describe("unknown PortableText fallbacks", () => {
  it("unknown block type renders nothing instead of throwing", () => {
    assert.equal(unknownPortableTextType(), null);
  });

  it("unknown mark type keeps children", () => {
    assert.equal(unknownPortableTextMark({ children: "keep me" }), "keep me");
  });
});

describe("normalizeGuideContent", () => {
  it("drops link markDefs without href and dangling mark keys", () => {
    const normalized = normalizeGuideContent([
      {
        _type: "block",
        _key: "b1",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Premier League",
            marks: ["badlink", "strong"],
          },
        ],
        markDefs: [{ _type: "link", _key: "badlink" }],
      },
    ]);

    const block = normalized[0] as unknown as {
      markDefs: unknown[];
      children: { marks: string[] }[];
    };
    assert.deepEqual(block.markDefs, []);
    assert.deepEqual(block.children[0]?.marks, ["strong"]);
  });

  it("passes unknown block types through so unknownType can skip them", () => {
    const normalized = normalizeGuideContent([
      { _type: "customWidget", _key: "w1", payload: true },
    ]);
    assert.equal(normalized[0]?._type, "customWidget");
    assert.equal(unknownPortableTextType(), null);
  });

  it("returns an empty array when content is missing", () => {
    assert.deepEqual(normalizeGuideContent(undefined), []);
    assert.deepEqual(normalizeGuideContent(null), []);
  });
});
