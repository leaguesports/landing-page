import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Athlete tools | LeagueSports",
  alternates: { canonical: "/athletes" },
  robots: { index: false, follow: true },
};

/** Dead public URL (#120). Marketing lives at `/athletes`; signed-in hub is `/`. */
export default function AthleteToolsRedirectPage() {
  permanentRedirect("/athletes");
}
