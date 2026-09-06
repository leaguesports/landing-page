import type { IntentFaq } from "@/lib/intent/copy";
import type { IntentKind } from "@/lib/intent/paths";

type IntentFaqSectionProps = {
  intent: IntentKind;
  faqs: IntentFaq[];
};

export function IntentFaqSection({ intent, faqs }: IntentFaqSectionProps) {
  if (faqs.length === 0) return null;
  const accent = intent === "watch" ? "text-sky-400" : "text-emerald-400";

  return (
    <section className="border-t border-white/5 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p
          className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
        >
          FAQ
        </p>
        <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
          Common questions
        </h2>
        <dl className="mt-8 space-y-5">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-white/8 bg-[#141814] px-5 py-4"
            >
              <dt className="text-base font-medium text-white">{faq.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-zinc-400">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
