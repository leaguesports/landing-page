"use client";

import Navigation from "./Navigation";
import Footer from "./Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen noise">
      {/* Background effects */}
      <div className="mesh-gradient" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Navigation />

      <main className="relative pt-20 sm:pt-24">{children}</main>

      <Footer />
    </div>
  );
}
