import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  applicationName: "Primozen",
  title: {
    default: "Primozen | Frozen Solution + Primecut Services",
    template: "%s | Primozen",
  },
  description: "Customer, invoice, payment, and service management for Frozen Solution and Primecut Services.",
  keywords: ["Primozen", "Frozen Solution", "Primecut Services", "invoices", "payments", "customers", "service management"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Primozen | Frozen Solution + Primecut Services",
    description: "Customer, invoice, payment, and service management for Frozen Solution and Primecut Services.",
    siteName: "Primozen",
    url: "/",
    locale: "en_CA",
    type: "website",
    images: [
      {
        url: "/primozen-meta-image.png",
        width: 1200,
        height: 630,
        alt: "Primozen dashboard for Frozen Solution and Primecut Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Primozen | Frozen Solution + Primecut Services",
    description: "Customer, invoice, payment, and service management for Frozen Solution and Primecut Services.",
    images: ["/primozen-meta-image.png"],
  },
};

import { ThemeProvider } from "@/components/theme-provider";

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
