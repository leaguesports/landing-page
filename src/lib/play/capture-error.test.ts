import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatCaptureError,
  formatCaptureThrownError,
} from "./capture-error.ts";

describe("formatCaptureError", () => {
  it("maps capture HTTP statuses to clear copy", () => {
    assert.equal(formatCaptureError(401), "Sign in to capture a result.");
    assert.match(formatCaptureError(403), /named player/i);
    assert.match(formatCaptureError(404), /venue was not found/i);
    assert.equal(formatCaptureError(400), "Check the score and try again.");
    assert.equal(
      formatCaptureError(400, "startsAt or playedAt is required"),
      "startsAt or playedAt is required",
    );
    assert.equal(
      formatCaptureError(503, "503 Persistence failed"),
      "503 Persistence failed",
    );
    assert.equal(formatCaptureError(418), "Could not capture result.");
  });
});

describe("formatCaptureThrownError", () => {
  it("reads status + message from API errors", () => {
    assert.equal(
      formatCaptureThrownError({ status: 401, message: "401 Unauthorized" }),
      "Sign in to capture a result.",
    );
    assert.equal(
      formatCaptureThrownError(new Error("network down")),
      "network down",
    );
    assert.equal(formatCaptureThrownError("nope"), "Could not capture result.");
  });
});
