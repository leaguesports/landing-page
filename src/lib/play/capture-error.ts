/**
 * User-facing copy for capture POST failures (400 / 401 / 403 / 404 / 503).
 * Prefer the API `error` string when it is already specific.
 */

const FALLBACK = "Could not capture result.";

export function formatCaptureError(
  status: number,
  message?: string | null,
): string {
  const detail = message?.trim() ?? "";
  if (status === 401) {
    return "Sign in to capture a result.";
  }
  if (status === 403) {
    return (
      detail ||
      "You must be seated as a named player — add yourself to the lineup."
    );
  }
  if (status === 404) {
    return detail || "That venue was not found. Pick one from the directory.";
  }
  if (status === 400) {
    return detail || "Check the score and try again.";
  }
  if (status === 503) {
    return detail || "Capture is temporarily unavailable.";
  }
  return detail || FALLBACK;
}

export function formatCaptureThrownError(err: unknown): string {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status?: unknown }).status;
    const message = (err as { message?: unknown }).message;
    if (typeof status === "number") {
      return formatCaptureError(
        status,
        typeof message === "string" ? message : "",
      );
    }
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return FALLBACK;
}
