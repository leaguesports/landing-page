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
  if (isPlayModeAppPath(pathname)) {
    return (
      <main className="min-h-dvh min-w-0 flex-1 overflow-x-clip bg-white text-[#09090b]">
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
