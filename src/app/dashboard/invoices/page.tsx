"use client"

import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { formatCurrency, invoices } from "@/lib/business-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Copy, FilePlus2, Link2, Mail, Search } from "lucide-react"
import * as React from "react"

const statusClasses: Record<string, string> = {
  Paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Due: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Overdue: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Draft: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
}

export default function InvoicesPage() {
  const [query, setQuery] = React.useState("")
  const filteredInvoices = invoices.filter((invoice) =>
    `${invoice.id} ${invoice.customer} ${invoice.business} ${invoice.service} ${invoice.status}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Invoices</h1>
            <p className="mt-1 text-sm text-muted-foreground">Generate invoices, send them by email, track due bills, and share agreement links.</p>
          </div>
          <Button className="gap-2">
            <FilePlus2 className="h-4 w-4" />
            Generate invoice
          </Button>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice, customer, business, status..." className="h-10 pl-10" />
        </div>

        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="min-w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Invoice</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Due</th>
                  <th className="px-4 py-3 text-right font-semibold">Balance</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="align-middle">
                    <td className="px-4 py-4 font-semibold">{invoice.id}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{invoice.customer}</p>
                      <p className="text-xs text-muted-foreground">{invoice.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p>{invoice.service}</p>
                      <p className="text-xs text-muted-foreground">{invoice.business}</p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{invoice.due}</td>
                    <td className="px-4 py-4 text-right font-bold">{formatCurrency(invoice.amount - invoice.paid)}</td>
                    <td className="px-4 py-4">
                      <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", statusClasses[invoice.status])}>{invoice.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon-sm" title="Send invoice email">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon-sm" title="Copy agreement link">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Link
                          href={`/agreements/${invoice.id}`}
                          title="Open agreement link"
                          className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-background text-sm transition-colors hover:bg-muted"
                        >
                          <Link2 className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
