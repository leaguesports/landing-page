"use client";

import Link from "next/link";

export default function HomeLink() {
  return (
    <Link
      href="/"
      className="font-display text-2xl tracking-wide text-white sm:text-[1.75rem]"
    >
      LEAGUE
      <span className="text-[var(--color-brand)]">SPORTS</span>
    </Link>
  );
}
