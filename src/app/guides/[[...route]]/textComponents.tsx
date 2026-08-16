import type { PortableTextComponents } from "@portabletext/react";
import Link from "next/link";

export const guidePortableTextComponents = {
    block: {
        normal: ({ children }) => (
            <p className="mb-5 text-balance text-zinc-300 text-base sm:text-lg leading-[1.75] font-medium last:mb-0">
                {children}
            </p>
        ),
        h2: ({ children }) => (
            <h3 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)] first:mt-0">
                {children}
            </h3>
        ),
        h3: ({ children }) => (
            <h3 className="mb-3 mt-10 font-display text-2xl tracking-wide text-white first:mt-0 sm:text-3xl">
                {children}
            </h3>
        ),
        blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-3xl border border-white/8 border-l-[3px] border-l-[var(--color-brand)] bg-[#141814] py-4 pl-5 pr-5 text-base italic leading-relaxed text-zinc-400 sm:text-lg">
                {children}
            </blockquote>
        ),
    },
    list: {
        bullet: ({ children }) => (
            <ul className="my-6 space-y-4 sm:my-8">{children}</ul>
        ),
        number: ({ children }) => (
            <ol className="my-6 list-decimal space-y-3 pl-5 text-zinc-300 marker:font-semibold marker:text-[var(--color-brand)] sm:my-8 sm:pl-6">
                {children}
            </ol>
        ),
    },
    listItem: {
        bullet: ({ children }) => (
            <li className="flex gap-3.5 text-zinc-300 text-base sm:text-lg leading-[1.65] font-medium">
                <span
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand)]"
                    aria-hidden
                />
                <span className="min-w-0 flex-1 [&_strong]:text-white">{children}</span>
            </li>
        ),
        number: ({ children }) => (
            <li className="text-zinc-300 text-base sm:text-lg leading-relaxed font-medium [&_strong]:text-white">
                {children}
            </li>
        ),
    },
    marks: {
        strong: ({ children }) => (
            <strong className="font-bold text-white">{children}</strong>
        ),
        em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
        link: ({ children, value }) => {
            const href =
                value && typeof value === "object" && "href" in value
                    ? String((value as { href?: string }).href ?? "#")
                    : "#";
            return (
                <Link
                    href={href}
                    className="font-semibold text-[var(--color-brand)] underline decoration-[var(--color-brand)]/35 underline-offset-[3px] transition-colors hover:text-emerald-300"
                >
                    {children}
                </Link>
            );
        },
    },
} satisfies PortableTextComponents;
