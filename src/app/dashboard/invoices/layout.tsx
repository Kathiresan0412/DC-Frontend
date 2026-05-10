import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Invoices",
  description: "Generate invoices, send customer agreement links, confirm payments, and track receivable amounts.",
  openGraph: {
    title: "ServiceHub Invoices",
    description: "Generate invoices, send customer agreement links, confirm payments, and track receivable amounts.",
    images: [
      {
        url: "/servicehub-logo.png",
        width: 1717,
        height: 916,
        alt: "ServiceHub invoice and payment management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ServiceHub Invoices",
    description: "Generate invoices, send customer agreement links, confirm payments, and track receivable amounts.",
    images: ["/servicehub-logo.png"],
  },
}

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
