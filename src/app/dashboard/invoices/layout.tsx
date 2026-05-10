import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Invoices",
  description: "Generate invoices, send customer agreement links, confirm payments, and track receivable amounts.",
  openGraph: {
    title: "Primozen Invoices",
    description: "Generate invoices, send customer agreement links, confirm payments, and track receivable amounts.",
    images: [
      {
        url: "/primozen-meta-image.png",
        width: 1200,
        height: 630,
        alt: "Primozen invoice and payment management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Primozen Invoices",
    description: "Generate invoices, send customer agreement links, confirm payments, and track receivable amounts.",
    images: ["/primozen-meta-image.png"],
  },
}

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
