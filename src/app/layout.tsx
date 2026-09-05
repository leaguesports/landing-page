import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AppSessionProvider } from "@/components/providers/AppSessionProvider";
import { Bebas_Neue, Outfit, Permanent_Marker } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

export const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-permanent-marker",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://leaguesports.co.za",
  ),
  title: {
    default: "LeagueSports | Watch, play & track sport in South Africa",
    template: "%s | LeagueSports",
  },
  description:
    "Find where to watch fixtures, book courts to play, and lock live scorecards across South Africa.",
  openGraph: {
    siteName: "LeagueSports",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0f0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html
      lang="en"
      className={`${permanentMarker.variable} ${bebas.variable} ${outfit.variable}`}
    >
      <body className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-[var(--background)] text-[var(--foreground)] antialiased">
        <AppSessionProvider>
          <Navigation />
          {/*
            Flex items default to min-width:auto, so a wide intrinsic child
            (iOS datetime-local on padel/golf start) can expand the whole page.
          */}
          <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
          <Footer />
        </AppSessionProvider>
      </body>
      {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
    </html>
  );
}
