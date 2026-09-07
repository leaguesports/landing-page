import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatOrganisedGameError,
  formatOrganisedGameThrownError,
} from "./errors.ts";

describe("formatOrganisedGameError", () => {
  it("maps HTTP statuses to clear copy and prefers API detail", () => {
    assert.equal(formatOrganisedGameError(401), "Sign in to continue.");
    assert.match(formatOrganisedGameError(403), /permission/i);
    assert.match(formatOrganisedGameError(404), /not found/i);
    assert.equal(
      formatOrganisedGameError(400),
      "Check the details and try again.",
    );
    assert.equal(
      formatOrganisedGameError(
        400,
        "Host can start from 12 hours before startsAt until 24 hours after",
      ),
      "Host can start from 12 hours before startsAt until 24 hours after",
    );
    assert.equal(
      formatOrganisedGameError(409, "This organised game is full"),
      "This organised game is full",
    );
    assert.equal(
      formatOrganisedGameError(503, "503 Persistence failed"),
      "503 Persistence failed",
    );
    assert.equal(
      formatOrganisedGameError(418),
      "Could not update this organised game.",
    );
  });
});

describe("formatOrganisedGameThrownError", () => {
  it("reads status + message from API errors", () => {
    assert.equal(
      formatOrganisedGameThrownError({
        status: 401,
        message: "401 Unauthorized",
      }),
      "Sign in to continue.",
    );
    assert.equal(
      formatOrganisedGameThrownError(new Error("network down")),
      "network down",
    );
    assert.equal(
      formatOrganisedGameThrownError("nope"),
      "Could not update this organised game.",
    );
  });
});
