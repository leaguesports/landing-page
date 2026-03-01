"use client";

import { LeagueSportsLogo } from "@/app/components/page";
import Link from "next/link";

export default function HomeLink() {
  return (
    <Link href="/">
      <LeagueSportsLogo />
    </Link>
  );
}
