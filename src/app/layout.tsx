import type { Metadata } from "next";
import { Outfit, Manrope } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

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
  metadataBase: new URL("https://leaguesports.co.za"),
  title: {
    default: "LeagueSports | Create & Manage Tournaments for Any Activity",
    template: "%s | LeagueSports",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
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
    url: "https://leaguesports.co.za",
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

// JSON-LD structured data for SEO
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LeagueSports",
  url: "https://leaguesports.co.za",
  logo: "https://leaguesports.co.za/logo.png",
  description:
    "The all-in-one platform for recreational sports. Track stats, run tournaments, and build communities for darts, padel, sim racing, and more.",
  sameAs: [
    "https://twitter.com/leaguesports",
    "https://www.linkedin.com/company/leaguesports",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hello@leaguesports.co.za",
  },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "LeagueSports",
  applicationCategory: "SportsApplication",
  operatingSystem: "Web, iOS, Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free during beta",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "500",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Tournament Management",
    "Live Brackets",
    "Stats Tracking",
    "Skill Ratings",
    "Achievement Badges",
    "Community Features",
    "Live Displays",
    "Multi-sport Support",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareAppSchema),
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${manrope.variable} antialiased bg-slate-950 text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
