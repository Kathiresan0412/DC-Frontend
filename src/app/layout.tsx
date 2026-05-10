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
  title: {
    default: "ServiceHub | Frozen Solution + Primecut Services",
    template: "%s | ServiceHub",
  },
  description: "Customer, invoice, payment, and service management for Frozen Solution and Primecut Services.",
  icons: {
    icon: "/servicehub-logo.png",
    apple: "/servicehub-logo.png",
  },
  openGraph: {
    title: "ServiceHub | Frozen Solution + Primecut Services",
    description: "Customer, invoice, payment, and service management for Frozen Solution and Primecut Services.",
    type: "website",
    images: [
      {
        url: "/servicehub-logo.png",
        width: 1717,
        height: 916,
        alt: "ServiceHub dashboard for Frozen Solution and Primecut Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ServiceHub | Frozen Solution + Primecut Services",
    description: "Customer, invoice, payment, and service management for Frozen Solution and Primecut Services.",
    images: ["/servicehub-logo.png"],
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
