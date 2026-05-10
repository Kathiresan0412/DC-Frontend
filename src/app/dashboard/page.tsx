import Image from "next/image"
import DashboardLayout from "@/components/dashboard-layout"
import { businesses, customers, formatCurrency, invoices, payments } from "@/lib/business-data"
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  FileText,
  Mail,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const totalDue = invoices.reduce((sum, invoice) => sum + invoice.amount - invoice.paid, 0)
const paidThisMonth = payments.reduce((sum, payment) => sum + payment.amount, 0)
const overdue = invoices.filter((invoice) => invoice.status === "Overdue")

const statusClasses: Record<string, string> = {
  Paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Due: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Overdue: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Draft: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
}

function StatCard({ title, value, label, icon: Icon, className }: any) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("rounded-lg p-2", className)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Business Operations</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
              Manage Frozen Solution and Primecut Services from one place: customers, invoices, due bills, payments, and agreement links.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              New invoice
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Send reminders
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active customers" value={customers.length} label="Across both businesses" icon={Users} className="bg-sky-500/10 text-sky-700" />
          <StatCard title="Due bills" value={formatCurrency(totalDue)} label={`${overdue.length} overdue invoice needs action`} icon={AlertTriangle} className="bg-amber-500/10 text-amber-700" />
          <StatCard title="Paid this month" value={formatCurrency(paidThisMonth)} label="Recorded payments in May" icon={DollarSign} className="bg-emerald-500/10 text-emerald-700" />
          <StatCard title="Upcoming service" value="May 14" label="Residential lawn appointment" icon={CalendarClock} className="bg-violet-500/10 text-violet-700" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {businesses.map((business) => (
            <section key={business.key} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="relative h-56">
                <Image src={business.image} alt={`${business.name} service poster`} fill className="object-cover object-top" sizes="(min-width: 1024px) 50vw, 100vw" priority={business.key === "snow"} />
              </div>
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className={cn("mb-2 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold", business.accent)}>{business.service}</div>
                  <h2 className="text-xl font-bold">{business.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{business.phone} / {business.secondaryPhone}</p>
                  <p className="text-sm text-muted-foreground">{business.email}</p>
                </div>
                <Button variant="outline" className="gap-2 sm:self-end">
                  Open records
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-semibold">Invoice Pipeline</h2>
              <p className="text-sm text-muted-foreground">Send invoices by email, then use the link for agreement and payment confirmation.</p>
            </div>
            <div className="divide-y divide-border">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{invoice.id}</p>
                      <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", statusClasses[invoice.status])}>{invoice.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{invoice.customer} • {invoice.service} • Due {invoice.due}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <p className="text-lg font-bold">{formatCurrency(invoice.amount - invoice.paid)}</p>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Today’s Work</h2>
                <p className="text-sm text-muted-foreground">Operational checklist</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {["Create May snow invoices", "Send overdue reminder to S. Patel", "Confirm agreement link on draft invoice", "Record Greenway payment receipt"].map((task) => (
                <label key={task} className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-emerald-700" />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
