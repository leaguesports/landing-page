const AUTH_RETURN_TO_KEY = "ls_auth_return_to";

function isSafeSameOriginReturnTo(value: string): boolean {
  try {
    const target = new URL(value, window.location.origin);
    if (target.origin !== window.location.origin) return false;
    if (target.username || target.password) return false;
    return target.pathname.startsWith("/");
  } catch {
    return false;
  }
}

/** Persist where to resume after Google OAuth (OAuth `state` may be ignored by older API). */
export function stashAuthReturnTo(returnTo?: string): void {
  if (typeof window === "undefined") return;
  const raw = returnTo?.trim();
  if (!raw) {
    sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
    return;
  }

  try {
    const absolute = new URL(
      raw.startsWith("http") ? raw : raw.startsWith("/") ? raw : `/${raw}`,
      window.location.origin,
    ).toString();
    if (!isSafeSameOriginReturnTo(absolute)) return;
    sessionStorage.setItem(AUTH_RETURN_TO_KEY, absolute);
  } catch {
    // ignore
  }
}

/**
 * If a post-login path was stashed and differs from the current URL, navigate there.
 * Returns true when a redirect was started.
 */
export function consumeAuthReturnTo(currentPathname: string): boolean {
  if (typeof window === "undefined") return false;

  const stashed = sessionStorage.getItem(AUTH_RETURN_TO_KEY);
  sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
  if (!stashed || !isSafeSameOriginReturnTo(stashed)) return false;

  try {
    const target = new URL(stashed);
    const here = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const want = `${target.pathname}${target.search}${target.hash}`;
    if (want === here || want === currentPathname) return false;
    window.location.replace(stashed);
    return true;
  } catch {
    return false;
  }
}
