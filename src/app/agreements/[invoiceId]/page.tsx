"use client"

import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import * as React from "react"
import { CheckCircle2, Download, FileText, Home, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { businesses, formatCurrency } from "@/lib/business-data"
import { getApiErrorMessage, invoiceApi, type Invoice } from "@/lib/api"

const formatProofDateTime = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function AgreementPage() {
  const params = useParams<{ invoiceId: string }>()
  const invoiceId = params.invoiceId
  const [invoice, setInvoice] = React.useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [showSystemBackLink, setShowSystemBackLink] = React.useState(false)

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const openedFromSystem = searchParams.get("source") === "system" || document.referrer.includes("/dashboard/invoices")

    setShowSystemBackLink(openedFromSystem)

    const loadInvoice = async () => {
      setIsLoading(true)

      try {
        const nextInvoice = await invoiceApi.getPublicInvoice(invoiceId)
        setInvoice(nextInvoice)
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Invoice not found"))
      } finally {
        setIsLoading(false)
      }
    }

    loadInvoice()
  }, [invoiceId])

  const handleDownloadPdf = () => {
    if (!invoice) return

    const previousTitle = document.title
    document.title = `${invoice.invoice_id} invoice record`
    window.print()
    document.title = previousTitle
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-muted/30 px-4 text-foreground">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading agreement
        </div>
      </main>
    )
  }

  if (!invoice) {
    return (
      <main className="grid min-h-screen place-items-center bg-muted/30 px-4 text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invoice not found</h1>
          <Link href="/" className="mt-4 inline-flex text-sm font-medium text-primary">Return to Primozen</Link>
        </div>
      </main>
    )
  }

  const receivable = Math.max(invoice.amount - invoice.paid, 0)
  const proofPayments = invoice.proofPayments?.length ? invoice.proofPayments : (invoice.proofPayment && invoice.proofPayment.paidAmount > 0 ? [invoice.proofPayment] : [])
  const company = businesses.find((business) => business.name === invoice.business) || businesses[0]
  const companyEmailHref = `mailto:${company.email}?subject=${encodeURIComponent(`Question about ${invoice.invoice_id}`)}`

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 text-foreground md:py-12">
      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative size-16 shrink-0 rounded-lg border border-border bg-background p-2">
                <Image src="/primozen-logo.png" alt={`${company.name} logo`} fill className="object-contain p-2" sizes="64px" priority />
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">{company.service}</p>
                <h2 className="text-xl font-bold">{company.name}</h2>
                <p className="text-sm text-muted-foreground">{company.email}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground sm:text-right">
              <p className="font-medium text-foreground">Company details</p>
              <p>Primary: {company.phone}</p>
              <p>Secondary: {company.secondaryPhone}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invoice and payment history</p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl">{invoice.invoice_id}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{invoice.business} - {invoice.service}</p>
            </div>
            <div className="no-print flex flex-wrap gap-3 md:justify-end">
              <Button variant="outline" className="gap-2" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              {showSystemBackLink && (
                <Link href="/dashboard/invoices" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4" />
                  Back to system
                </Link>
              )}
            </div>
          </div>
        </div>

        <section className="grid gap-6 p-6 md:grid-cols-[1fr_280px] md:p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Invoice Record</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This page shows the service details, invoice total, saved payments, and current pending balance for {invoice.service} from {invoice.business}.
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Viewing this page does not record a payment and does not change the paid amount.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="font-semibold">Invoice Details</h3>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Customer</dt>
                  <dd className="font-medium">{invoice.customer}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{invoice.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Issued</dt>
                  <dd className="font-medium">{invoice.issued}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Due date</dt>
                  <dd className="font-medium">{invoice.due}</dd>
                </div>
              </dl>
            </div>

            {proofPayments.length > 0 ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Payment history
                </h3>
                <div className="mt-4 space-y-3">
                  {proofPayments.map((proof, index) => (
                    <div key={`${proof.payment_id || proof.generated_at}-${index}`} className="rounded-md border border-emerald-500/20 bg-background/70 p-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold">{proof.payment_id || `Proof ${proofPayments.length - index}`}</p>
                          <p className="text-xs text-muted-foreground">
                            {proof.method || "Customer confirmation"} - {formatProofDateTime(proof.generated_at)}
                          </p>
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(proof.paidAmount)}</p>
                      </div>
                      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-muted-foreground">Total amount</dt>
                          <dd className="font-bold">{formatCurrency(proof.totalAmount)}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Receivable after payment</dt>
                          <dd className="font-bold">{formatCurrency(proof.receivableAmount)}</dd>
                        </div>
                      </dl>
                      {proof.notes && <p className="mt-3 text-sm text-muted-foreground">Notes: {proof.notes}</p>}
                    </div>
                  ))}
                </div>
                {invoice.feedback && <p className="mt-4 text-sm text-muted-foreground">Feedback: {invoice.feedback}</p>}
              </div>
            ) : (
              <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                No previous payments have been recorded for this invoice yet.
              </div>
            )}

            <div className="rounded-lg border border-border p-4">
              <h3 className="font-semibold">Balance Status</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {receivable > 0
                  ? `Pending amount remaining: ${formatCurrency(receivable)}.`
                  : "This invoice is fully paid. No pending amount remains."}
              </p>
            </div>
          </div>

          <aside className="rounded-lg border border-border bg-background p-5">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Amount due</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(receivable)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Due {invoice.due}</p>

            <div className="mt-6 grid gap-2">
              <Button variant="default" className="no-print w-full gap-2" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <a
                href={companyEmailHref}
                className="no-print inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                Email question
              </a>
            </div>

            <div className="mt-6 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Secure record
              </p>
              <p className="mt-1 text-xs">Payments shown here are saved from the company payment ledger.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
