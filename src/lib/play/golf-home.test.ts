import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  GOLF_HOME_COPY,
  GOLF_HOME_COURSES,
  GolfHomeView,
  beginGolfSession,
  golfDayPart,
  golfFirstName,
  golfGreeting,
  golfHomePress,
  reduceGolfNotice,
} from "./golf-home.ts";
import { PLAY_MODE_SESSION_LIVE } from "./mode.ts";

function html(greeting: string, notice: string | null): string {
  return renderToStaticMarkup(
    createElement(GolfHomeView, {
      greeting,
      notice,
      onAction() {},
    }),
  );
}

describe("golf home greeting", () => {
  it("uses the local part of day and the session first name", () => {
    assert.equal(golfDayPart(0), "morning");
    assert.equal(golfDayPart(11), "morning");
    assert.equal(golfDayPart(12), "afternoon");
    assert.equal(golfDayPart(16), "afternoon");
    assert.equal(golfDayPart(17), "evening");
    assert.equal(golfDayPart(23), "evening");
    assert.equal(golfFirstName("Brandon Lee"), "Brandon");
    assert.equal(golfFirstName("  mary jane "), "mary");
    assert.equal(golfFirstName("brandon@example.com"), "brandon");
    assert.equal(golfFirstName("@lee"), "lee");
    assert.equal(golfFirstName(""), null);
    assert.equal(golfFirstName("   "), null);

    assert.equal(
      golfGreeting({ signedIn: true, displayName: "Brandon Lee", hour: 9 }),
      "Morning, Brandon",
    );
    assert.equal(
      golfGreeting({ signedIn: true, displayName: "Brandon Lee", hour: 14 }),
      "Afternoon, Brandon",
    );
    assert.equal(
      golfGreeting({ signedIn: true, displayName: "Brandon Lee", hour: 20 }),
      "Evening, Brandon",
    );
    assert.equal(
      golfGreeting({ signedIn: true, displayName: "", hour: 9 }),
      "Morning",
    );
  });

  it("says Golf when signed out or before local time is known", () => {
    assert.equal(
      golfGreeting({ signedIn: false, displayName: "Brandon Lee", hour: 9 }),
      "Golf",
    );
    assert.equal(
      golfGreeting({ signedIn: false, displayName: "", hour: null }),
      "Golf",
    );
    assert.equal(
      golfGreeting({ signedIn: true, displayName: "Brandon Lee", hour: null }),
      "Golf",
    );
  });
});

describe("golf home empty screen", () => {
  it("renders the empty states and no sample rounds, venues, or chart", () => {
    assert.equal(GOLF_HOME_COURSES, "omitted");
    assert.equal(PLAY_MODE_SESSION_LIVE, false);
    const signedOut = html("Golf", null);
    assert.match(signedOut, /class="hello">Golf</);
    assert.match(signedOut, /Ready for 18\?/);
    assert.match(signedOut, /Start a round/);
    assert.match(signedOut, /Scorecard · Stableford · friends/);
    assert.match(signedOut, /Join with code/);
    assert.match(signedOut, /data-golf-action="start"/);
    assert.match(signedOut, /data-golf-action="join"/);
    assert.match(signedOut, /type="button"/);
    assert.match(signedOut, /Handicap index/);
    assert.equal(GOLF_HOME_COPY.handicapMark, "—");
    assert.match(signedOut, /class="big"/);
    assert.match(signedOut, /class="dash"/);
    assert.doesNotMatch(signedOut, /class="big"[^>]*>\d/);
    assert.match(signedOut, /Play 3 rounds to get your index\./);
    assert.match(signedOut, /Recent rounds/);
    assert.match(signedOut, /No rounds yet\. Start one and it shows here\./);
    assert.doesNotMatch(signedOut, /Coming soon|See all|Courses near you|<a /);
    assert.doesNotMatch(signedOut, /linearGradient|Killarney|Houghton|Johannesburg|14\.2/);

    const signedIn = html("Morning, Brandon", null);
    assert.match(signedIn, /class="hello">Morning, Brandon</);
    assert.match(signedIn, /No rounds yet\. Start one and it shows here\./);
    assert.doesNotMatch(signedIn, /14\.2|Killarney|Houghton/);
  });

  it("shows a coming-soon notice for Start a round and Join with code", () => {
    assert.equal(golfHomePress("start").live, false);
    assert.equal(golfHomePress("join").notice, "Coming soon");
    assert.equal(reduceGolfNotice(null, "start"), GOLF_HOME_COPY.notice);
    assert.equal(reduceGolfNotice(null, "join"), "Coming soon");
    assert.equal(beginGolfSession("start"), null);
    assert.equal(beginGolfSession("join"), null);

    const withNotice = html("Golf", "Coming soon");
    assert.match(withNotice, /id="golf-coming-soon"/);
    assert.match(withNotice, /role="status"/);
    assert.match(withNotice, />Coming soon</);
    assert.match(withNotice, /aria-describedby="golf-coming-soon"/);

    assert.deepEqual(golfHomePress("start", true), { live: true, action: "start" });
    assert.equal(beginGolfSession("join", true), "join");
    assert.equal(reduceGolfNotice(null, "start", true), null);
    assert.equal(reduceGolfNotice("Coming soon", "join", true), "Coming soon");
  });

  it("keeps the session API unwired and leaves Padel on its home", () => {
    const home = readFileSync(new URL("./golf-home.ts", import.meta.url), "utf8");
    const shell = readFileSync(
      new URL("../../components/play/GolfHome.tsx", import.meta.url),
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
    assert.doesNotMatch(home + shell, /fetch\(|poolApi|router\.push|href=|14\.2|Killarney|Houghton|Johannesburg/);
    assert.match(shell, /reduceGolfNotice/);
    assert.match(shell, /useAuth/);
    assert.match(app, /mode === "golf"/);
    assert.match(app, /GolfHome/);
    assert.match(app, /<SocialHome/);
    assert.doesNotMatch(app, /className="soon">Coming soon/);
    assert.match(css, /\.hello[\s\S]*text-transform:\s*uppercase/);
    assert.match(css, /#006045/);
    assert.match(css, /#3dff8a/);
    assert.match(css, /#09090b/);
    assert.doesNotMatch(app, /Courses near you|See all/);
  });
});
