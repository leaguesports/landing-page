import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Permanent_Marker } from 'next/font/google';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${permanentMarker.variable}`}>
      <body className="flex min-h-screen flex-col bg-[#0f0f0f] text-white antialiased">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
