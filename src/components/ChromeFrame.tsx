"use client";

import { isPlayModeAppPath } from "@/lib/play/mode";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
  const play = isPlayModeAppPath(pathname);
  return (
    <>
      {nav}
      <main
        className={
          play
            ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-x-clip bg-white text-[#09090b]"
            : "min-w-0 flex-1 overflow-x-clip"
        }
      >
        {children}
      </main>
      {play ? null : footer}
    </>
  );
}
