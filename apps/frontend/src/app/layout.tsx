import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { site, siteJsonLd, siteLogo, siteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    site.name,
    "ActivityPub",
    "Fediverse",
    "self-hosting",
    "single-user",
  ],
  authors: [{ name: site.name, url: site.softwareUrl }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.language,
    url: siteUrl,
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [siteLogo],
  },
  twitter: {
    card: "summary",
    title: site.name,
    description: site.shortDescription,
    images: [siteLogo],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={site.language}
      className={cn("font-sans dark", "font-sans", inter.variable)}
    >
      <body className="text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster richColors />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
