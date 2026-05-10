"use client"

import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  customerApi,
  getApiErrorMessage,
  invoiceApi,
  paymentApi,
  serviceApi,
  userApi,
  type Customer,
  type Invoice,
  type Payment,
  type ServiceOffering,
} from "@/lib/api"
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
  Mail,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value)

const statusClasses: Record<string, string> = {
  Paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Confirmed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Sent: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Due: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Overdue: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Draft: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
}

const businessImages: Record<string, string> = {
  "Frozen Solution": "/frozen-solution-snow.jpeg",
  "Primecut Services": "/primecut-lawn.jpeg",
}

const businessAccents: Record<string, string> = {
  "Frozen Solution": "text-sky-700 bg-sky-500/10 dark:text-sky-300",
  "Primecut Services": "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300",
}

type StatCardProps = {
  title: string
  value: string | number
  label: string
  icon: React.ElementType
  className: string
}

function StatCard({ title, value, label, icon: Icon, className }: StatCardProps) {
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

const paymentDate = (payment: Payment) => new Date(payment.paid_at || payment.date)

const isCurrentMonth = (date: Date) => {
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

const parseDueDate = (invoice: Invoice) => {
  const date = new Date(invoice.due)
  return Number.isNaN(date.getTime()) ? null : date
}

const hasDueDate = (item: { invoice: Invoice; date: Date | null }): item is { invoice: Invoice; date: Date } => item.date !== null

export default function DashboardPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [services, setServices] = React.useState<ServiceOffering[]>([])
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [canManageFinancials, setCanManageFinancials] = React.useState(false)
  const [sendingId, setSendingId] = React.useState<string | null>(null)

  const loadDashboard = React.useCallback(async () => {
    setIsLoading(true)

    try {
      const currentProfile = await userApi.getProfile()
      const hasFinancialAccess = currentProfile.role === "admin" || currentProfile.role === "manager"
      setCanManageFinancials(hasFinancialAccess)

      const [nextCustomers, nextServices] = await Promise.all([
        customerApi.getCustomers(),
        serviceApi.getServices(),
      ])

      setCustomers(nextCustomers)
      setServices(nextServices)

      if (hasFinancialAccess) {
        const [nextInvoices, nextPayments] = await Promise.all([
          invoiceApi.getInvoices(),
          paymentApi.getPayments(),
        ])

        setInvoices(nextInvoices)
        setPayments(nextPayments)
      } else {
        setInvoices([])
        setPayments([])
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load dashboard"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const totalDue = React.useMemo(
    () => invoices.reduce((sum, invoice) => sum + Math.max(invoice.receivable ?? invoice.amount - invoice.paid, 0), 0),
    [invoices],
  )
  const paidThisMonth = React.useMemo(
    () => payments.reduce((sum, payment) => sum + (isCurrentMonth(paymentDate(payment)) ? payment.amount : 0), 0),
    [payments],
  )
  const overdue = React.useMemo(() => invoices.filter((invoice) => invoice.status === "Overdue"), [invoices])
  const pipelineInvoices = React.useMemo(() => invoices.slice(0, 5), [invoices])
  const nextDueInvoice = React.useMemo(() => {
    const now = new Date()
    return invoices
      .map((invoice) => ({ invoice, date: parseDueDate(invoice) }))
      .filter(hasDueDate)
      .filter((item) => item.date >= now && item.invoice.status !== "Paid")
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0]
  }, [invoices])

  const businesses = React.useMemo(() => {
    const grouped = new Map<string, ServiceOffering[]>()

    for (const service of services) {
      grouped.set(service.business, [...(grouped.get(service.business) || []), service])
    }

    return Array.from(grouped.entries()).map(([name, businessServices]) => {
      const primaryService = businessServices[0]
      const activeServices = businessServices.filter((service) => service.status === "Active").length

      return {
        name,
        service: primaryService?.category || "Services",
        email: primaryService?.email || "",
        phone: primaryService?.contactPhone || "",
        secondaryPhone: primaryService?.secondaryPhone || "",
        servicesCount: businessServices.length,
        activeServices,
        image: primaryService?.imageUrl || businessImages[name] || "/primozen-meta-image.png",
        accent: businessAccents[name] || "text-primary bg-primary/10",
      }
    })
  }, [services])

  const tasks = React.useMemo(() => {
    const nextTasks: string[] = []
    const overdueInvoice = overdue[0]
    const draftInvoice = invoices.find((invoice) => invoice.status === "Draft")
    const dueInvoice = invoices.find((invoice) => invoice.status === "Due" || invoice.status === "Sent")

    if (overdueInvoice) nextTasks.push(`Follow up on overdue invoice ${overdueInvoice.invoice_id} for ${overdueInvoice.customer}`)
    if (draftInvoice) nextTasks.push(`Review draft invoice ${draftInvoice.invoice_id} for ${draftInvoice.customer}`)
    if (dueInvoice) nextTasks.push(`Check payment status for ${dueInvoice.invoice_id}`)
    if (nextDueInvoice) nextTasks.push(`Prepare for ${nextDueInvoice.invoice.invoice_id} due ${nextDueInvoice.invoice.due}`)

    return nextTasks.length ? nextTasks.slice(0, 4) : ["No urgent invoice or payment actions right now"]
  }, [invoices, nextDueInvoice, overdue])

  const handleSend = async (invoice: Invoice) => {
    setSendingId(invoice.id)

    try {
      const result = await invoiceApi.sendInvoice(invoice.invoice_id)
      setInvoices((current) => current.map((item) => item.id === invoice.id ? result.invoice : item))
      toast.success(`Invoice email prepared for ${result.email.to}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to send invoice"))
    } finally {
      setSendingId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Business Operations</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
              Manage customers, invoices, due bills, payments, and agreement links from live business records.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canManageFinancials && (
              <Link href="/dashboard/invoices" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
                <FileText className="h-4 w-4" />
                New invoice
              </Link>
            )}
            <Link href="/dashboard/activity" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted">
              <Mail className="h-4 w-4" />
              Activity log
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center rounded-lg border border-border bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Active customers" value={customers.filter((customer) => customer.status === "Active").length} label={`${customers.length} total customers`} icon={Users} className="bg-sky-500/10 text-sky-700" />
              <StatCard title="Active services" value={services.filter((service) => service.status === "Active").length} label={`${services.length} total services`} icon={CheckCircle2} className="bg-emerald-500/10 text-emerald-700" />
              {canManageFinancials && (
                <>
                  <StatCard title="Due bills" value={formatCurrency(totalDue)} label={`${overdue.length} overdue invoice${overdue.length === 1 ? "" : "s"} need action`} icon={AlertTriangle} className="bg-amber-500/10 text-amber-700" />
                  <StatCard title="Paid this month" value={formatCurrency(paidThisMonth)} label="Recorded payments this month" icon={DollarSign} className="bg-emerald-500/10 text-emerald-700" />
                  <StatCard title="Next due invoice" value={nextDueInvoice?.invoice.due || "None"} label={nextDueInvoice ? `${nextDueInvoice.invoice.customer} · ${nextDueInvoice.invoice.invoice_id}` : "No upcoming unpaid invoices"} icon={CalendarClock} className="bg-violet-500/10 text-violet-700" />
                </>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {businesses.length ? businesses.map((business) => (
                <section key={business.name} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                  <div className="relative h-56">
                    <Image src={business.image} alt={`${business.name} service poster`} fill className="object-cover object-top" sizes="(min-width: 1024px) 50vw, 100vw" priority={business.name === businesses[0]?.name} />
                  </div>
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className={cn("mb-2 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold", business.accent)}>{business.service}</div>
                      <h2 className="text-xl font-bold">{business.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {business.activeServices} active of {business.servicesCount} services
                      </p>
                      <p className="text-sm text-muted-foreground">{[business.phone, business.secondaryPhone].filter(Boolean).join(" / ")}</p>
                      <p className="text-sm text-muted-foreground">{business.email}</p>
                    </div>
                    <Link href="/dashboard/services" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted sm:self-end">
                      Open records
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </section>
              )) : (
                <section className="rounded-lg border border-border bg-card p-5 shadow-sm lg:col-span-2">
                  <h2 className="text-lg font-semibold">No services yet</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Add services to populate the business overview.</p>
                </section>
              )}
            </div>

            {canManageFinancials && (
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <section className="rounded-lg border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                  <h2 className="text-lg font-semibold">Invoice Pipeline</h2>
                  <p className="text-sm text-muted-foreground">Live invoices from the API, ready for agreement and payment follow-up.</p>
                </div>
                <div className="divide-y divide-border">
                  {pipelineInvoices.length ? pipelineInvoices.map((invoice) => (
                    <div key={invoice.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{invoice.invoice_id}</p>
                          <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", statusClasses[invoice.status])}>{invoice.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{invoice.customer} · {invoice.service} · Due {invoice.due}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 md:justify-end">
                        <p className="text-lg font-bold">{formatCurrency(invoice.receivable)}</p>
                        <Button variant="outline" size="sm" className="gap-1.5" disabled={sendingId === invoice.id} onClick={() => handleSend(invoice)}>
                          {sendingId === invoice.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                          Email
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-5 text-sm text-muted-foreground">No invoices have been created yet.</div>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Today’s Work</h2>
                    <p className="text-sm text-muted-foreground">Generated from current invoices</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {tasks.map((task) => (
                    <label key={task} className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
                      <input type="checkbox" className="h-4 w-4 accent-emerald-700" />
                      <span>{task}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
