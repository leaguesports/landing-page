import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "For casual players getting started",
    features: [
      "Track unlimited matches",
      "Basic stats & history",
      "Join communities",
      "Mobile app access",
    ],
    cta: "Get Started",
    href: "/waitlist",
    popular: false,
  },
  {
    name: "Pro",
    price: "9",
    description: "For serious players who want more",
    features: [
      "Everything in Free",
      "Advanced analytics",
      "Skill rating system",
      "Achievement badges",
      "Priority support",
      "Custom profile",
    ],
    cta: "Start Free Trial",
    href: "/waitlist",
    popular: true,
  },
  {
    name: "Organizer",
    price: "29",
    description: "For leagues and tournament organizers",
    features: [
      "Everything in Pro",
      "Unlimited tournaments",
      "Live bracket displays",
      "Custom branding",
      "Spectator mode",
      "Registration management",
      "Analytics dashboard",
    ],
    cta: "Contact Sales",
    href: "/waitlist",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <MarketingLayout>
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-slate-300">
                Early Access Pricing
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
              Simple, <span className="gradient-text">Fair</span> Pricing
            </h1>
            <p className="text-lg sm:text-xl text-slate-400">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card rounded-2xl p-6 sm:p-8 relative ${
                  plan.popular ? "border-primary/50 ring-2 ring-primary/20" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-primary text-slate-950 text-xs font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-slate-400">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <svg
                        className="w-5 h-5 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block w-full py-3 rounded-xl font-medium text-center transition-colors ${
                    plan.popular
                      ? "btn-primary"
                      : "bg-slate-800 text-white hover:bg-slate-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold font-heading text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  q: "Is there a free trial?",
                  a: "Yes! All paid plans come with a 14-day free trial. No credit card required.",
                },
                {
                  q: "Can I change plans later?",
                  a: "Absolutely. Upgrade, downgrade, or cancel anytime from your account settings.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
                },
                {
                  q: "Do you offer discounts for annual billing?",
                  a: "Yes! Save 20% when you choose annual billing on any paid plan.",
                },
              ].map((faq) => (
                <div key={faq.q} className="glass-card rounded-xl p-5">
                  <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
