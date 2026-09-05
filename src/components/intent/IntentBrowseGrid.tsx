import type { IntentKind } from "@/lib/intent/paths";
import { intentPath } from "@/lib/intent/paths";
import Link from "next/link";

export type IntentChoiceCardItem = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
};

type IntentBrowseGridProps = {
  intent: IntentKind;
  activitySlug?: string;
  eyebrow: string;
  title: string;
  description: string;
  items: IntentChoiceCardItem[];
  emptyMessage: string;
};

export function IntentBrowseGrid({
  intent,
  activitySlug,
  eyebrow,
  title,
  description,
  items,
  emptyMessage,
}: IntentBrowseGridProps) {
  const accent = intent === "watch" ? "text-sky-400" : "text-emerald-400";
  const hoverBorder =
    intent === "watch"
      ? "hover:border-sky-400/30"
      : "hover:border-emerald-400/30";

  return (
    <section
      id="browse"
      className="scroll-mt-28 border-t border-white/5 px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 max-w-3xl sm:mb-10">
          <p
            className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
          >
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {description}
          </p>
        </header>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {items.map((item) => {
              const href = activitySlug
                ? intentPath(intent, activitySlug, item.slug)
                : intentPath(intent, item.slug);
              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`group block rounded-3xl border border-white/8 bg-[#141814] p-5 transition-colors sm:p-6 ${hoverBorder}`}
                >
                  <h3 className="text-lg font-medium text-white transition-colors group-hover:text-white">
                    {item.name}
                  </h3>
                  {item.subtitle ? (
                    <p className={`mt-2 text-sm ${accent}`}>{item.subtitle}</p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/8 bg-[#141814] px-6 py-12 text-center">
            <p className="text-sm text-zinc-400">{emptyMessage}</p>
            <Link
              href={intentPath(intent)}
              className={`mt-4 inline-flex text-sm font-medium ${accent}`}
            >
              Back to {intent}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
