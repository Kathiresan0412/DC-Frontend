import Link from "next/link"
import { businesses, formatCurrency, invoices } from "@/lib/business-data"
import { Button } from "@/components/ui/button"
import { CheckCircle2, CreditCard, FileText, Home, Mail } from "lucide-react"

export default async function AgreementPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params
  const invoice = invoices.find((item) => item.id === invoiceId) ?? invoices[0]
  const business = businesses.find((item) => item.name === invoice.business) ?? businesses[0]
  const balance = invoice.amount - invoice.paid

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 text-foreground md:py-12">
      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer agreement and payment letter</p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl">{invoice.id}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{business.name} • {business.service}</p>
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
                This letter confirms that {invoice.customer} agrees to the quoted {invoice.service} service from {business.name}. By continuing to payment, the customer confirms the service details, billing amount, due date, and contact information are correct.
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Service records, invoice history, payment status, and customer communication will be stored in the business management system for future reference.
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

            <div className="rounded-lg border border-border p-4">
              <h3 className="font-semibold">Customer Confirmation</h3>
              <label className="mt-4 flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-emerald-700" defaultChecked />
                <span>I agree to the service terms, invoice amount, and payment responsibility for this service.</span>
              </label>
            </div>
          </div>

          <aside className="rounded-lg border border-border bg-background p-5">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Amount due</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(balance)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Due {invoice.due}</p>

            <div className="mt-6 grid gap-2">
              <Button className="gap-2">
                <CreditCard className="h-4 w-4" />
                Agree and pay
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Email question
              </Button>
            </div>

            <div className="mt-6 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Secure record
              </p>
              <p className="mt-1 text-xs">Agreement and payment activity will be saved to the customer file.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
