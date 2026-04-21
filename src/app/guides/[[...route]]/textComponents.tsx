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
            <h3 className="mb-3 mt-10 text-sm font-black uppercase tracking-[0.2em] text-red-400 first:mt-0">
                {children}
            </h3>
        ),
        h3: ({ children }) => (
            <h3 className="mb-3 text-2xl font-black uppercase tracking-wider text-zinc-400 first:mt-0 mt-20">
                {children}
            </h3>
        ),
        blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-red-600/90 py-1 pl-5 text-zinc-400 text-base sm:text-lg italic leading-relaxed">
                {children}
            </blockquote>
        ),
    },
    list: {
        bullet: ({ children }) => (
            <ul className="my-6 space-y-4 sm:my-8">{children}</ul>
        ),
        number: ({ children }) => (
            <ol className="my-6 list-decimal space-y-3 pl-5 text-zinc-300 marker:font-black marker:text-red-500 sm:my-8 sm:pl-6">
                {children}
            </ol>
        ),
    },
    listItem: {
        bullet: ({ children }) => (
            <li className="flex gap-3.5 text-zinc-300 text-base sm:text-lg leading-[1.65] font-medium">
                <span
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.45)]"
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
                    className="font-semibold text-red-400 underline decoration-red-500/35 underline-offset-[3px] transition-colors hover:text-red-300"
                >
                    {children}
                </Link>
            );
        },
    },
} satisfies PortableTextComponents;