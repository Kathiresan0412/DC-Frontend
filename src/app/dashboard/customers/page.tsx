"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { customers, formatCurrency } from "@/lib/business-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Mail, MapPin, Phone, Plus, Search } from "lucide-react"

const statusClasses: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Due: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "New lead": "bg-sky-500/10 text-sky-700 dark:text-sky-300",
}

export default function CustomersPage() {
  const [query, setQuery] = React.useState("")
  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.business} ${customer.plan}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Customers</h1>
            <p className="mt-1 text-sm text-muted-foreground">Store customer details, addresses, service plans, and balance records.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add customer
          </Button>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, business, email, or service..." className="h-10 pl-10" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredCustomers.map((customer) => (
            <section key={customer.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{customer.name}</h2>
                    <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", statusClasses[customer.status])}>{customer.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{customer.id} • {customer.business}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className={cn("text-xl font-bold", customer.balance > 0 ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300")}>{formatCurrency(customer.balance)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {customer.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {customer.phone}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {customer.address}</p>
              </div>

              <div className="mt-5 rounded-md bg-muted/40 p-3">
                <p className="text-sm font-medium">{customer.plan}</p>
                <p className="text-xs text-muted-foreground">Last service: {customer.lastService}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
