import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ invoiceId: string }> }): Promise<Metadata> {
  const { invoiceId } = await params
  const title = `Agreement ${invoiceId}`
  const description = "Review the customer agreement, confirm service payment, and generate a payment proof slip."

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Primozen`,
      description,
      images: [
        {
          url: "/primozen-meta-image.png",
          width: 1200,
          height: 630,
          alt: "Primozen customer agreement and payment proof",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Primozen`,
      description,
      images: ["/primozen-meta-image.png"],
    },
  }
}

export default function AgreementLayout({ children }: { children: React.ReactNode }) {
  return children
}
