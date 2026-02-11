"use client";

import Link from "next/link";
import { useSuburb } from "@/context/SuburbContext";
import { toSlug } from "@/data/suburbs";

export default function HomeLink() {
  const { suburb } = useSuburb();
  const href = suburb ? `/${toSlug(suburb)}` : "/";

  return (
    <Link href={href} className="flex shrink-0 items-center space-x-2">
      <div className="text-xl font-bold tracking-tight text-white">
        <span>League</span>
        <span className="text-green-400">Sports</span>
      </div>
    </Link>
  );
}
