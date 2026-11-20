import { notFound } from "next/navigation";

/**
 * F1 race replay UI was removed in the cleanup that dropped
 * `src/components/f1-replay`. Keep the route so old links 404 cleanly
 * instead of failing the production build on missing modules.
 */
export default function EventReplayPage() {
  notFound();
}
