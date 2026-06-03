import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Permanent_Marker } from 'next/font/google';
import { GoogleAnalytics } from "@next/third-parties/google";

export const permanentMarker = Permanent_Marker({
  weight: '400', // Permanent Marker only comes in 400
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-permanent-marker', // Using a CSS variable is best for flexibility
});


export const metadata: Metadata = {
  title: {
    default: "LeagueSports | Find Venues & Events",
    template: "%s | LeagueSports",
  },
  description: "Find venues and events to participate in. Connect with players and venues in your area.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className={permanentMarker.variable}>
      <body className="flex min-h-screen flex-col bg-[#0f0f0f] text-white antialiased">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
      {GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
