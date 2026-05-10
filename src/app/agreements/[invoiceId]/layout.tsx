import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ invoiceId: string }> }): Promise<Metadata> {
  const { invoiceId } = await params
  const title = `Agreement ${invoiceId}`
  const description = "Review the customer agreement, confirm service payment, and generate a payment proof slip."

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ServiceHub`,
      description,
      images: [
        {
          url: "/servicehub-logo.png",
          width: 1717,
          height: 916,
          alt: "ServiceHub customer agreement and payment proof",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ServiceHub`,
      description,
      images: ["/servicehub-logo.png"],
    },
  }
}

export default function AgreementLayout({ children }: { children: React.ReactNode }) {
  return children
}
