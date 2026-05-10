import DashboardLayout from "@/components/dashboard-layout"
import { formatCurrency, invoices, payments } from "@/lib/business-data"
import { Button } from "@/components/ui/button"
import { CreditCard, Download, Plus, ReceiptText } from "lucide-react"

export default function PaymentsPage() {
  const outstanding = invoices.reduce((sum, invoice) => sum + invoice.amount - invoice.paid, 0)
  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Payments</h1>
            <p className="mt-1 text-sm text-muted-foreground">Record payments, reconcile invoices, and export receipts for both businesses.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Record payment
            </Button>
          </div>
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
            <p className="mt-2 text-2xl font-bold">3</p>
          </section>
        </div>

        <section className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Payment Ledger</h2>
            <p className="text-sm text-muted-foreground">Every customer payment stored with invoice, date, method, and business.</p>
          </div>
          <div className="divide-y divide-border">
            {payments.map((payment) => (
              <div key={payment.id} className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-700">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{payment.customer}</p>
                  <p className="text-sm text-muted-foreground">{payment.invoice} • {payment.method} • {payment.business}</p>
                </div>
                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="font-bold">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                  <Button variant="outline" size="icon-sm" title="View receipt">
                    <ReceiptText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
