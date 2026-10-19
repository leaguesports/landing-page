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
  return (
    <>
      {nav}
      <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
      {footer}
    </>
  );
}
