"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import * as React from "react"
import { CheckCircle2, CreditCard, FileText, Home, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/business-data"
import { getApiErrorMessage, invoiceApi, type Invoice } from "@/lib/api"

export default function AgreementPage() {
  const params = useParams<{ invoiceId: string }>()
  const invoiceId = params.invoiceId
  const [invoice, setInvoice] = React.useState<Invoice | null>(null)
  const [paidAmount, setPaidAmount] = React.useState(0)
  const [feedback, setFeedback] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isConfirming, setIsConfirming] = React.useState(false)

  React.useEffect(() => {
    const loadInvoice = async () => {
      setIsLoading(true)

      try {
        const nextInvoice = await invoiceApi.getPublicInvoice(invoiceId)
        setInvoice(nextInvoice)
        setPaidAmount(nextInvoice.receivable || nextInvoice.amount)
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Invoice not found"))
      } finally {
        setIsLoading(false)
      }
    }

    loadInvoice()
  }, [invoiceId])

  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsConfirming(true)

    try {
      const result = await invoiceApi.confirmInvoice(invoiceId, { paidAmount, feedback })
      setInvoice(result.invoice)
      toast.success("Agreement confirmed and payment slip emailed")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to confirm agreement"))
    } finally {
      setIsConfirming(false)
    }
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
          <Link href="/" className="mt-4 inline-flex text-sm font-medium text-primary">Return to ServiceHub</Link>
        </div>
      </main>
    )
  }

  const receivable = Math.max(invoice.amount - invoice.paid, 0)
  const isConfirmed = Boolean(invoice.confirmed_at || invoice.proofPayment)

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 text-foreground md:py-12">
      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer agreement and payment letter</p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl">{invoice.invoice_id}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{invoice.business} - {invoice.service}</p>
            </div>
            <Link href="/dashboard/invoices" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
              Back to system
            </Link>
          </div>
        </div>

        <section className="grid gap-6 p-6 md:grid-cols-[1fr_280px] md:p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Agreement Letter</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This letter confirms that {invoice.customer} agrees to the quoted {invoice.service} service from {invoice.business}. By confirming, the customer accepts the service details, billing amount, due date, and payment responsibility.
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                After confirmation, ServiceHub updates the customer file with the latest service date, service name, paid amount, receivable amount, and customer feedback.
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

            {isConfirmed && invoice.proofPayment ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Payment proof generated
                </h3>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground">Total amount</dt>
                    <dd className="font-bold">{formatCurrency(invoice.proofPayment.totalAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Paid amount</dt>
                    <dd className="font-bold">{formatCurrency(invoice.proofPayment.paidAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Receivable</dt>
                    <dd className="font-bold">{formatCurrency(invoice.proofPayment.receivableAmount)}</dd>
                  </div>
                </dl>
                {invoice.feedback && <p className="mt-4 text-sm text-muted-foreground">Feedback: {invoice.feedback}</p>}
              </div>
            ) : (
              <form onSubmit={handleConfirm} className="rounded-lg border border-border p-4">
                <h3 className="font-semibold">Customer Confirmation</h3>
                <label className="mt-4 flex items-start gap-3 text-sm">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-emerald-700" required />
                  <span>I agree to the service terms, invoice amount, and payment responsibility for this service.</span>
                </label>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="paid-amount">Paid amount</Label>
                    <Input id="paid-amount" type="number" min="0" max={invoice.amount} step="0.01" value={paidAmount} onChange={(event) => setPaidAmount(Number(event.target.value))} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="feedback">Feedback or suggestion</Label>
                    <Input id="feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Optional message" />
                  </div>
                </div>

                <Button type="submit" disabled={isConfirming} className="mt-4 gap-2">
                  {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  Confirm and generate proof
                </Button>
              </form>
            )}
          </div>

          <aside className="rounded-lg border border-border bg-background p-5">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Amount due</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(receivable)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Due {invoice.due}</p>

            <div className="mt-6 grid gap-2">
              <a href={`mailto:${invoice.email}?subject=${encodeURIComponent(`Question about ${invoice.invoice_id}`)}`}>
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Email question
                </Button>
              </a>
            </div>

            <div className="mt-6 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Secure record
              </p>
              <p className="mt-1 text-xs">Agreement, feedback, and payment proof are saved to the customer file.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
