"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Download, Loader2, Plus, ReceiptText, Search } from "lucide-react"
import { toast } from "sonner"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/business-data"
import { getApiErrorMessage, invoiceApi, paymentApi, userApi, type Invoice, type Payment } from "@/lib/api"

const paymentMethods = ["E-transfer", "Credit card", "Cash", "Cheque", "Bank transfer"]

const todayInputValue = () => new Date().toISOString().slice(0, 10)

export default function PaymentsPage() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState("")
  const [method, setMethod] = React.useState(paymentMethods[0])
  const [amount, setAmount] = React.useState(0)
  const [paidAt, setPaidAt] = React.useState(todayInputValue())
  const [notes, setNotes] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [canManageFinancials, setCanManageFinancials] = React.useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = React.useState(true)
  const [isRecording, setIsRecording] = React.useState(false)

  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId || invoice.invoice_id === selectedInvoiceId)
  const payableInvoices = invoices.filter((invoice) => invoice.receivable > 0)
  const outstanding = invoices.reduce((sum, invoice) => sum + invoice.receivable, 0)
  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const methodsCount = new Set(payments.map((payment) => payment.method)).size

  const loadData = React.useCallback(async () => {
    if (!canManageFinancials) return

    setIsLoading(true)

    try {
      const [nextInvoices, nextPayments] = await Promise.all([
        invoiceApi.getInvoices(),
        paymentApi.getPayments(),
      ])

      setInvoices(nextInvoices)
      setPayments(nextPayments)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load payments"))
    } finally {
      setIsLoading(false)
    }
  }, [canManageFinancials])

  React.useEffect(() => {
    userApi.getProfile()
      .then((profile) => {
        const hasAccess = profile.role === "admin" || profile.role === "manager"
        setCanManageFinancials(hasAccess)

        if (!hasAccess) {
          toast.error("Only admins and managers can access payments")
          router.replace("/dashboard")
        }
      })
      .catch(() => router.replace("/"))
      .finally(() => setIsCheckingAccess(false))
  }, [router])

  React.useEffect(() => {
    if (canManageFinancials) {
      loadData()
    }
  }, [canManageFinancials, loadData])

  React.useEffect(() => {
    if (!selectedInvoice) return
    setAmount(selectedInvoice.receivable)
  }, [selectedInvoice])

  const handleRecordPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedInvoice) {
      toast.error("Select an invoice")
      return
    }

    setIsRecording(true)

    try {
      const result = await paymentApi.createPayment({
        invoiceId: selectedInvoice.invoice_id,
        method,
        amount,
        paid_at: paidAt,
        notes,
      })

      setPayments((current) => [result.payment, ...current])
      setInvoices((current) => current.map((invoice) => invoice.id === result.invoice.id ? result.invoice : invoice))
      setSelectedInvoiceId("")
      setAmount(0)
      setNotes("")
      toast.success("Payment recorded")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to record payment"))
    } finally {
      setIsRecording(false)
    }
  }

  const handleExport = () => {
    const header = ["Payment", "Invoice", "Customer", "Business", "Method", "Amount", "Date"]
    const rows = payments.map((payment) => [
      payment.payment_id,
      payment.invoice_id,
      payment.customer,
      payment.business,
      payment.method,
      String(payment.amount),
      payment.date,
    ])
    const csv = [header, ...rows].map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `payments-${todayInputValue()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredPayments = payments.filter((payment) =>
    `${payment.payment_id} ${payment.invoice_id} ${payment.customer} ${payment.business} ${payment.method} ${payment.service}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <DashboardLayout>
      {isCheckingAccess || !canManageFinancials ? (
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Payments</h1>
            <p className="mt-1 text-sm text-muted-foreground">Record payments, reconcile invoices, and export receipts for both businesses.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={payments.length === 0}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Collected</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(collected)}</p>
          </section>
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">{formatCurrency(outstanding)}</p>
          </section>
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Payment methods</p>
            <p className="mt-2 text-2xl font-bold">{methodsCount}</p>
          </section>
        </div>

        <form onSubmit={handleRecordPayment} className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm lg:grid-cols-[1.6fr_.8fr_.7fr_.7fr_1fr_auto] lg:items-end">
          <div className="grid gap-2">
            <Label htmlFor="payment-invoice">Invoice</Label>
            <select
              id="payment-invoice"
              value={selectedInvoiceId}
              onChange={(event) => setSelectedInvoiceId(event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              required
            >
              <option value="">Select invoice</option>
              {payableInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_id} - {invoice.customer} - {formatCurrency(invoice.receivable)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-method">Method</Label>
            <select
              id="payment-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod} value={paymentMethod}>{paymentMethod}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-amount">Amount</Label>
            <Input id="payment-amount" type="number" min="0.01" max={selectedInvoice?.receivable} step="0.01" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-date">Date</Label>
            <Input id="payment-date" type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-notes">Notes</Label>
            <Input id="payment-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional" />
          </div>

          <Button type="submit" disabled={isRecording || isLoading} className="gap-2">
            {isRecording ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Record
          </Button>
        </form>

        {selectedInvoice && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p className="font-medium">{selectedInvoice.customer} - {selectedInvoice.service}</p>
            <p className="mt-1 text-muted-foreground">
              {selectedInvoice.invoice_id} - Paid {formatCurrency(selectedInvoice.paid)} - Receivable {formatCurrency(selectedInvoice.receivable)}
            </p>
          </div>
        )}

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search payment, invoice, customer, business..." className="h-10 pl-10" />
        </div>

        <section className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Payment Ledger</h2>
            <p className="text-sm text-muted-foreground">Every customer payment stored with invoice, date, method, and business.</p>
          </div>
          <div className="divide-y divide-border">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{payment.customer}</p>
                  <p className="text-sm text-muted-foreground">{payment.invoice_id} - {payment.method} - {payment.business}</p>
                  {payment.notes && <p className="mt-1 text-xs text-muted-foreground">{payment.notes}</p>}
                </div>
                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="font-bold">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                  <Button variant="outline" size="icon-sm" title="Payment receipt">
                    <ReceiptText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {!isLoading && filteredPayments.length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground">No payments found.</div>
            )}
          </div>
        </section>
      </div>
      )}
    </DashboardLayout>
  )
}
