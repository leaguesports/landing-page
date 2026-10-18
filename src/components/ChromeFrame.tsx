"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isGameDayChromePath } from "@/lib/golf-game-day/paths";

export function ChromeFrame({
  nav,
  footer,
  children,
}: {
  nav: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  if (isGameDayChromePath(pathname)) {
    return (
      <main className="min-h-dvh min-w-0 flex-1 overflow-x-clip bg-white text-zinc-950">
        {children}
      </main>
    );
  }
  return (
    <>
      {nav}
      <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
      {footer}
    </>
  );
}
