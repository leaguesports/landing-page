/**
 * Call a `fetch` impl without illegal-invocation errors.
 *
 * Passing `window.fetch` as `deps.fetch` and invoking `deps.fetch(url)` binds
 * `this` to `deps`, which browsers reject. Always call through globalThis.
 * Arrow/mock fetch impls ignore `this` and keep working.
 */
export function invokeFetch(
  fetchImpl: typeof fetch,
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetchImpl.call(globalThis, input, init);
}
