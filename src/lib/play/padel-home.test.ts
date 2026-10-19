import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  PADEL_HOME_COPY,
  PADEL_HOME_OPEN_GAMES,
  PadelHomeView,
  beginPadelSession,
  padelEyebrow,
  padelFirstName,
  padelHomePress,
  padelTitle,
  reducePadelNotice,
} from "./padel-home.ts";
import { PLAY_MODE_SESSION_LIVE } from "./mode.ts";

function html(eyebrow: string, title: string, notice: string | null): string {
  return renderToStaticMarkup(
    createElement(PadelHomeView, {
      eyebrow,
      title,
      notice,
      onAction() {},
    }),
  );
}

describe("padel home eyebrow and title", () => {
  it("formats the local date as PADEL · weekday day MON", () => {
    const monday = new Date(2026, 9, 19);
    assert.equal(monday.getDay(), 1);
    assert.equal(padelEyebrow(monday), "PADEL · MON 19 OCT");
    assert.equal(padelEyebrow(new Date(2026, 9, 18)), "PADEL · SUN 18 OCT");
    assert.equal(padelEyebrow(new Date(2026, 0, 5)), "PADEL · MON 5 JAN");
    assert.equal(padelEyebrow(new Date(2026, 11, 31)), "PADEL · THU 31 DEC");
    assert.equal(padelEyebrow(null), "PADEL");
    assert.equal(padelEyebrow(new Date(Number.NaN)), "PADEL");
  });

  it("uses the session first name when signed in, and Game on when signed out", () => {
    assert.equal(padelFirstName("Brandon Lee"), "Brandon");
    assert.equal(padelFirstName("  mary jane "), "mary");
    assert.equal(padelFirstName("brandon@example.com"), "brandon");
    assert.equal(padelFirstName("@lee"), "lee");
    assert.equal(padelFirstName(""), null);
    assert.equal(padelFirstName("   "), null);

    assert.equal(
      padelTitle({ signedIn: true, displayName: "Brandon Lee" }),
      "Game on, Brandon",
    );
    assert.equal(padelTitle({ signedIn: true, displayName: "" }), "Game on");
    assert.equal(padelTitle({ signedIn: false, displayName: "Brandon Lee" }), "Game on");
    assert.equal(padelTitle({ signedIn: false, displayName: "" }), "Game on");
  });
});

describe("padel home empty screen", () => {
  it("renders Record a match, then Find a game, then Join with code", () => {
    assert.equal(PADEL_HOME_OPEN_GAMES, "omitted");
    assert.equal(PLAY_MODE_SESSION_LIVE, false);
    const signedOut = html("PADEL · MON 19 OCT", "Game on", null);
    const record = signedOut.indexOf("Record a match");
    const find = signedOut.indexOf("Find a game");
    const join = signedOut.indexOf("Join with code");
    assert.ok(record > -1 && find > record && join > find);
    assert.ok(
      signedOut.indexOf('data-padel-action="record"') <
        signedOut.indexOf('data-padel-action="find"'),
    );
    assert.ok(
      signedOut.indexOf('data-padel-action="find"') <
        signedOut.indexOf('data-padel-action="join"'),
    );
    assert.match(signedOut, /class="hello">PADEL · MON 19 OCT</);
    assert.match(signedOut, /<h1>Game on<\/h1>/);
    assert.match(signedOut, /Scores, sets and who played/);
    assert.match(signedOut, /type="button"/);
    assert.doesNotMatch(signedOut, /Create a match/);
    assert.match(signedOut, /Your level/);
    assert.equal(PADEL_HOME_COPY.levelMark, "—");
    assert.match(signedOut, /class="big"/);
    assert.match(signedOut, /class="dash"/);
    assert.doesNotMatch(signedOut, /class="big"[^>]*>\d/);
    assert.match(signedOut, /Record 3 matches to see your level\./);
    assert.match(signedOut, /Recent matches/);
    assert.match(signedOut, /No matches yet\. Record one and it shows here\./);
    assert.doesNotMatch(signedOut, /Coming soon|See all|Open games|<a /);
    assert.doesNotMatch(
      signedOut,
      /Intermediate|58%|wins|losses|Bloc11|Rosebank|progress|linearGradient/,
    );

    const signedIn = html("PADEL · MON 19 OCT", "Game on, Brandon", null);
    assert.match(signedIn, /<h1>Game on, Brandon<\/h1>/);
    assert.match(signedIn, /No matches yet\. Record one and it shows here\./);
    assert.doesNotMatch(signedIn, /Create a match|Intermediate|58%|Bloc11|Rosebank/);
  });

  it("shows a coming-soon notice for all three actions", () => {
    assert.equal(padelHomePress("record").live, false);
    assert.equal(padelHomePress("find").notice, "Coming soon");
    assert.equal(padelHomePress("join").notice, "Coming soon");
    assert.equal(reducePadelNotice(null, "record"), PADEL_HOME_COPY.notice);
    assert.equal(reducePadelNotice(null, "find"), "Coming soon");
    assert.equal(reducePadelNotice(null, "join"), "Coming soon");
    assert.equal(beginPadelSession("record"), null);
    assert.equal(beginPadelSession("find"), null);
    assert.equal(beginPadelSession("join"), null);

    const withNotice = html("PADEL · MON 19 OCT", "Game on", "Coming soon");
    assert.match(withNotice, /id="padel-coming-soon"/);
    assert.match(withNotice, /role="status"/);
    assert.match(withNotice, />Coming soon</);
    assert.equal(withNotice.match(/aria-describedby="padel-coming-soon"/g)?.length, 3);
    assert.doesNotMatch(withNotice, /Create a match|<a /);

    assert.deepEqual(padelHomePress("record", true), { live: true, action: "record" });
    assert.equal(beginPadelSession("find", true), "find");
    assert.equal(reducePadelNotice(null, "record", true), null);
    assert.equal(reducePadelNotice("Coming soon", "join", true), "Coming soon");
  });

  it("keeps the session API unwired and leaves Social on its home", () => {
    const home = readFileSync(new URL("./padel-home.ts", import.meta.url), "utf8");
    const shell = readFileSync(
      new URL("../../components/play/PadelHome.tsx", import.meta.url),
      "utf8",
    );
    const app = readFileSync(
      new URL("../../components/play/PlayModeApp.tsx", import.meta.url),
      "utf8",
    );
    const css = readFileSync(
      new URL("../../components/play/play-mode.css", import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      home + shell,
      /fetch\(|poolApi|router\.push|href=|Intermediate|58%|Bloc11|Rosebank/,
    );
    assert.match(shell, /reducePadelNotice/);
    assert.match(shell, /useAuth/);
    assert.match(shell, /padelEyebrow/);
    assert.match(app, /mode === "padel"/);
    assert.match(app, /PadelHome/);
    assert.match(app, /mode === "golf"/);
    assert.match(app, /GolfHome/);
    assert.match(app, /<SocialHome/);
    assert.doesNotMatch(app, /className="soon">Coming soon/);
    assert.match(css, /\.padel-home[\s\S]*border-radius:\s*999px/);
    assert.match(css, /#006045/);
    assert.match(css, /#3dff8a/);
    assert.match(css, /#09090b/);
    assert.doesNotMatch(app, /Open games near you|Create a match|See all/);
  });
});
