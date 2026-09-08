import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Unsubscribe | Coverage notify",
  robots: { index: false, follow: false },
};

export default function CoverageUnsubscribeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
