"use client"

import * as React from "react"
import { Activity, CalendarDays, Filter, Loader2, RotateCcw, Search } from "lucide-react"
import { toast } from "sonner"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage, activityApi, type ActivityEntityType, type ActivityLog, type ActivityLogFilters } from "@/lib/api"
import { cn } from "@/lib/utils"

const entityTypes: Array<{ value: ActivityEntityType | ""; label: string }> = [
  { value: "", label: "All types" },
  { value: "auth", label: "Auth" },
  { value: "profile", label: "Profile" },
  { value: "user", label: "Users" },
  { value: "item", label: "Inventory" },
  { value: "customer", label: "Customers" },
  { value: "service", label: "Services" },
  { value: "invoice", label: "Invoices" },
  { value: "payment", label: "Payments" },
]

const actionOptions = [
  { value: "", label: "All actions" },
  { value: "signed_in", label: "Signed in" },
  { value: "updated_profile", label: "Profile updated" },
  { value: "created_user", label: "User created" },
  { value: "updated_user", label: "User updated" },
  { value: "deleted_user", label: "User deleted" },
  { value: "created_customer", label: "Customer created" },
  { value: "updated_customer", label: "Customer updated" },
  { value: "deleted_customer", label: "Customer deleted" },
  { value: "created_service", label: "Service created" },
  { value: "updated_service", label: "Service updated" },
  { value: "deleted_service", label: "Service deleted" },
  { value: "created_invoice", label: "Invoice created" },
  { value: "sent_invoice", label: "Invoice sent" },
  { value: "recorded_payment", label: "Payment recorded" },
  { value: "customer_confirmed_payment", label: "Customer payment confirmed" },
  { value: "customer_confirmed_invoice", label: "Customer invoice confirmed" },
]

const businessOptions = [
  { value: "", label: "All businesses" },
  { value: "Frozen Solution", label: "Frozen Solution" },
  { value: "Primecut Services", label: "Primecut Services" },
]

const entityTone: Record<ActivityEntityType, string> = {
  auth: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  profile: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  user: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  item: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  customer: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  service: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  invoice: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  payment: "bg-lime-500/10 text-lime-700 dark:text-lime-300",
}

const formatDateTime = (value: string) => (
  new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
)

const formatKey = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()

const formatDetailValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-"
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

function ActivityRow({ log }: { log: ActivityLog }) {
  const details = Object.entries(log.details || {}).filter(([, value]) => value !== undefined && value !== "")

  return (
    <article className="grid gap-4 border-b border-border p-5 last:border-b-0 lg:grid-cols-[1fr_220px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-md px-2 py-1 text-xs font-semibold capitalize", entityTone[log.entityType])}>
            {log.entityType}
          </span>
          <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {log.action.replace(/_/g, " ")}
          </span>
          {log.business && (
            <span className="rounded-md border border-border px-2 py-1 text-xs font-medium">
              {log.business}
            </span>
          )}
        </div>

        <h2 className="mt-3 text-base font-semibold">{log.summary}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {log.actor.name} {log.actor.email ? `(${log.actor.email})` : ""} - {formatDateTime(log.created_at)}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Record</p>
            <p className="mt-1 truncate text-sm font-medium">{log.entityLabel || log.entityId}</p>
          </div>
          {log.invoiceId && (
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">Invoice</p>
              <p className="mt-1 truncate text-sm font-medium">{log.invoiceId}</p>
            </div>
          )}
          {log.paymentId && (
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">Payment</p>
              <p className="mt-1 truncate text-sm font-medium">{log.paymentId}</p>
            </div>
          )}
        </div>

        {details.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-background/60">
            <div className="grid gap-0 sm:grid-cols-2">
              {details.map(([key, value]) => (
                <div key={key} className="min-w-0 border-b border-border p-3 last:border-b-0 sm:border-r sm:odd:border-r">
                  <p className="text-xs capitalize text-muted-foreground">{formatKey(key)}</p>
                  <p className="mt-1 break-words text-sm font-medium">{formatDetailValue(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
        <p className="font-medium">Actor</p>
        <p className="mt-2 text-muted-foreground">{log.actor.name}</p>
        <p className="truncate text-muted-foreground">{log.actor.email || log.actor.role}</p>
        <p className="mt-3 font-medium">IDs</p>
        <p className="mt-2 break-all text-xs text-muted-foreground">{log.entityId}</p>
      </div>
    </article>
  )
}

export default function ActivityLogPage() {
  const [logs, setLogs] = React.useState<ActivityLog[]>([])
  const [filters, setFilters] = React.useState<ActivityLogFilters>({ limit: 75 })
  const [isLoading, setIsLoading] = React.useState(true)

  const loadLogs = React.useCallback(async () => {
    setIsLoading(true)

    try {
      const nextLogs = await activityApi.getActivityLogs(filters)
      setLogs(nextLogs)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load activity log"))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  React.useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const updateFilter = (key: keyof ActivityLogFilters, value: string | number) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({ limit: 75 })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Activity Log</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
              Review account, customer, invoice, payment, service, and inventory events with the full context behind each action.
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={loadLogs} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>

        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Filter className="h-4 w-4" />
            </div>
            <h2 className="font-semibold">Filters</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_.9fr_.9fr_.9fr_.7fr_.7fr_.7fr_auto] xl:items-end">
            <label className="grid gap-2">
              <span className="text-xs font-medium text-muted-foreground">Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.query || ""}
                  onChange={(event) => updateFilter("query", event.target.value)}
                  placeholder="Customer, invoice, actor, action"
                  className="h-9 pl-9"
                />
              </div>
            </label>

            <FilterSelect label="Type" value={filters.entityType || ""} options={entityTypes} onChange={(value) => updateFilter("entityType", value)} />
            <FilterSelect label="Action" value={filters.action || ""} options={actionOptions} onChange={(value) => updateFilter("action", value)} />
            <FilterSelect label="Business" value={filters.business || ""} options={businessOptions} onChange={(value) => updateFilter("business", value)} />

            <label className="grid gap-2">
              <span className="text-xs font-medium text-muted-foreground">From</span>
              <Input type="date" value={filters.from || ""} onChange={(event) => updateFilter("from", event.target.value)} className="h-9" />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-medium text-muted-foreground">To</span>
              <Input type="date" value={filters.to || ""} onChange={(event) => updateFilter("to", event.target.value)} className="h-9" />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-medium text-muted-foreground">Limit</span>
              <Input
                type="number"
                min={1}
                max={200}
                value={filters.limit || 75}
                onChange={(event) => updateFilter("limit", Number(event.target.value))}
                className="h-9"
              />
            </label>

            <Button type="button" variant="outline" className="gap-2" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Events</h2>
                <p className="text-sm text-muted-foreground">{logs.length} records shown</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Newest first
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading activity
            </div>
          ) : logs.length > 0 ? (
            <div>
              {logs.map((log) => (
                <ActivityRow key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
              <p className="font-medium">No activity found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try changing the filters or record a customer, invoice, or payment action.</p>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
