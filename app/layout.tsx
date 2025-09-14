import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../styles/globals.css";
import Nav from "./ui/nav";
import { avenir, blackMango } from "./fonts/font";
import { ToastProvider } from "./ui/toaster";
import { OrdersWebhookProvider } from "./(dashboard)/orders/hooks/webhookProivider";

export const metadata: Metadata = {
  metadataBase: new URL("https://thepakeru.com"),
  title: "Pakeru. Defy the Norm",
  description:
    "Modern elegance meets street art. Raw inspiration, refined style, uplifting Africa through fashion.",
  keywords: [
    // Core brand terms
    "streetwear",
    "african fashion",
    "urban style",
    "modern clothing",

    // Style descriptors
    "contemporary fashion",
    "street art clothing",
    "artistic apparel",
    "creative wear",
    "minimalist streetwear",
    "elevated casual",
    "urban luxury",
    "designer streetwear",

    // African focus
    "african streetwear",
    "afrocentric fashion",
    "african inspired clothing",
    "african designers",
    "african street culture",
    "continental fashion",
    "african urban wear",

    // Brand positioning
    "defy the norm",
    "statement clothing",
    "cultural fashion",
    "artistic expression",
    "raw inspiration",
    "refined style",
    "fashion movement",
    "lifestyle brand",

    // Product categories
    "graphic tees",
    "urban outerwear",
    "street accessories",
    "limited edition",
    "unisex clothing",
    "youth fashion",
    "trendy apparel",
    "fashion forward",
  ],

  authors: [{ name: "Pakeru" }],
  creator: "Pakeru",
  publisher: "Pakeru",

  openGraph: {
    type: "website",
    title: "Pakeru. Defy the Norm",
    url: "https://thepakeru.com",
    description:
      "Modern elegance meets street art. Pakeru is more than style—it's status and inspiration.",
    siteName: "Pakeru",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pakeru streetwear — where raw meets refined",
        type: "image/jpeg",
      },
    ],
    locale: "en_US",
   
  },

  twitter: {
    card: "summary_large_image",
    site: "@pakeru_",
    creator: "@pakeru_",
    title: "Pakeru — Defy the Norm",
    description: "Modern elegance meets street art. Uplifted by Africa.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },

  alternates: {
    canonical: "https://thepakeru.com",
  },
  icons: {
    icon: [
      { url: "/meta/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/meta/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "../favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` ${avenir.variable} ${blackMango.style}  antialiased `}>
        <OrdersWebhookProvider>
          <ToastProvider />
          {children}
        </OrdersWebhookProvider>
      </body>
    </html>
  );
}
