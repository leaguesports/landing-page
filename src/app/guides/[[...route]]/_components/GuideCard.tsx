import { urlFor } from "@/sanity/client";
import Image from "next/image";
import Link from "next/link";
import type { Guide } from "../actions";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group block overflow-hidden rounded-3xl border border-white/8 bg-[#141814] transition-colors hover:border-white/16"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-800">
        {guide.mainImage ? (
          <Image
            src={urlFor(guide.mainImage)?.url() ?? ""}
            alt={guide.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-zinc-800" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#141814] via-transparent to-transparent" />
      </div>

      <div className="px-4 py-4 sm:px-5">
        <h2 className="text-[15px] font-medium leading-snug text-white group-hover:text-[var(--color-brand)] sm:text-base">
          {guide.title}
        </h2>
        {guide.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">
            {guide.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
