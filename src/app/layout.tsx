import type { Metadata, Viewport } from "next";
import { Outfit, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";

const GTM_ID = "GTM-55K2SSJ5";

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
    default: "LeagueSports | South Africa's Tournament Management & Live Scoring Platform",
    template: "%s | LeagueSports South Africa",
  },
  description:
    "South Africa's leading sports platform. Create tournaments and leagues for padel, sim golf, darts, cricket, and more. Join thousands of SA players competing nationwide.",
  keywords: [
    "South Africa sports",
    "SA tournament management",
    "South African leagues",
    "padel South Africa",
    "darts leagues SA",
    "cricket tournaments South Africa",
    "sim golf South Africa",
    "sim racing SA",
    "sports community South Africa",
    "live scoring SA",
    "leaderboards South Africa",
    "Johannesburg sports leagues",
    "Cape Town tournaments",
    "Durban sports",
  ],
  authors: [{ name: "LeagueSports" }],
  creator: "LeagueSports",
  publisher: "LeagueSports",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://leaguesports.co.za",
    siteName: "LeagueSports South Africa",
    title: "LeagueSports | South Africa's Tournament Management & Live Scoring Platform",
    description:
      "South Africa's leading sports platform. Create tournaments and leagues for padel, sim golf, darts, cricket, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LeagueSports - South Africa's Tournament & League Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeagueSports | South Africa's Sports Platform",
    description:
      "South Africa's leading sports platform. Create tournaments and leagues for padel, sim golf, darts, cricket, and more.",
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo-icon.svg",
  },
  manifest: "/site.webmanifest",
};

// Viewport configuration (Next.js 14+ recommended export)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

// JSON-LD structured data for SEO
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LeagueSports",
  url: "https://leaguesports.co.za",
  logo: "https://leaguesports.co.za/logo.png",
  description:
    "South Africa's all-in-one platform for recreational sports. Track stats, run tournaments, and build communities for darts, padel, cricket, sim racing, and more.",
  sameAs: [
    "https://twitter.com/leaguesports",
    "https://www.linkedin.com/company/leaguesports",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hello@leaguesports.co.za",
  },
  areaServed: {
    "@type": "Country",
    name: "South Africa",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "ZA",
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
    priceCurrency: "ZAR",
    description: "Free during beta",
    availableAtOrFrom: {
      "@type": "Country",
      name: "South Africa",
    },
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
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
