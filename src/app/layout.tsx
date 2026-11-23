import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Poppins } from "@/utils/fonts";
import "../styles/globals.css";
import "../styles/lightbox.css";
import Providers from "./providers";
import AppShell from "@/components/ui/layout/AppShell";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/utils/helpers";
import { IS_PRODUCTION } from "@/utils/constants";
import dynamic from "next/dynamic";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
const Disclaimer = dynamic(() => import("@/components/ui/overlay/Disclaimer"));

export const metadata: Metadata = {
  title: siteConfig.name,
  applicationName: siteConfig.name,
  description: siteConfig.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
  },
  icons: {
    icon: siteConfig.favicon,
    apple: "/icons/ios/180.png",
  },
  twitter: {
    card: "summary",
    title: {
      default: siteConfig.name,
      template: siteConfig.name,
    },
    description: siteConfig.description,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: {
      default: siteConfig.name,
      template: siteConfig.name,
    },
    description: siteConfig.description,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0C0F" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link rel="preconnect" href="https://vidlink.pro" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://multiembed.mov" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.nontongo.win" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://autoembed.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://vidsrc.to" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
      </head>
      <body className={cn("bg-background min-h-dvh antialiased select-none", Poppins.className)}>
        <Suspense>
          <NuqsAdapter>
            <Providers>
              {IS_PRODUCTION && <Disclaimer />}
              <AppShell>{children}</AppShell>
            </Providers>
          </NuqsAdapter>
        </Suspense>
        {/* Vercel-only services, they just 404 on other hosts */}
        {process.env.VERCEL && (
          <>
            <SpeedInsights debug={false} />
            <Analytics debug={false} />
          </>
        )}
      </body>
    </html>
  );
}
