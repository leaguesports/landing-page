/**
 * User-facing copy for organised-game API failures.
 * Prefer the API `error` string when it is already specific.
 */

const FALLBACK = "Could not update this organised game.";

export function formatOrganisedGameError(
  status: number,
  message?: string | null,
): string {
  const detail = message?.trim() ?? "";
  if (status === 401) {
    return "Sign in to continue.";
  }
  if (status === 403) {
    return detail || "You don’t have permission to do that.";
  }
  if (status === 404) {
    return detail || "That game was not found.";
  }
  if (status === 400) {
    return detail || "Check the details and try again.";
  }
  if (status === 409) {
    return detail || "This game can’t take that action right now.";
  }
  if (status === 503) {
    return detail || "Organised games are temporarily unavailable.";
  }
  return detail || FALLBACK;
}

export function formatOrganisedGameThrownError(err: unknown): string {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status?: unknown }).status;
    const message = (err as { message?: unknown }).message;
    if (typeof status === "number") {
      return formatOrganisedGameError(
        status,
        typeof message === "string" ? message : "",
      );
    }
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return FALLBACK;
}
