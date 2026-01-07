import type { Metadata } from "next";
import { Outfit, Manrope } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://leaguesports.io"),
  title: {
    default: "LeagueSports | Create & Manage Tournaments for Any Activity",
    template: "%s | LeagueSports",
  },
  description:
    "Build thriving communities around your passion. Create tournaments and leagues for sim golf, padel, sim racing, and more. Join thousands of players competing worldwide.",
  keywords: [
    "tournament management",
    "league management",
    "sim golf tournaments",
    "padel leagues",
    "sim racing leagues",
    "esports tournaments",
    "sports community platform",
    "competition management",
  ],
  authors: [{ name: "LeagueSports" }],
  creator: "LeagueSports",
  publisher: "LeagueSports",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://leaguesports.io",
    siteName: "LeagueSports",
    title: "LeagueSports | Create & Manage Tournaments for Any Activity",
    description:
      "Build thriving communities around your passion. Create tournaments and leagues for sim golf, padel, sim racing, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LeagueSports - Tournament & League Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeagueSports | Create & Manage Tournaments for Any Activity",
    description:
      "Build thriving communities around your passion. Create tournaments and leagues for sim golf, padel, sim racing, and more.",
    images: ["/og-image.png"],
    creator: "@leaguesports",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${outfit.variable} ${manrope.variable} antialiased bg-slate-950 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
