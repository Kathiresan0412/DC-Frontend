import DashboardLayout from "@/components/dashboard-layout"
import { businesses, formatCurrency, servicePackages } from "@/lib/business-data"
import { Button } from "@/components/ui/button"
import { Check, Plus } from "lucide-react"

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Services & Pricing</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage snow removal and lawn care packages under one system.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add service
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {businesses.map((business) => (
            <section key={business.key} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{business.service}</p>
                  <h2 className="text-xl font-bold">{business.name}</h2>
                </div>
                <div className="rounded-md bg-muted px-3 py-2 text-right text-xs text-muted-foreground">
                  <p>{business.phone}</p>
                  <p>{business.secondaryPhone}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {servicePackages.filter((item) => item.business === business.name).map((item) => (
                  <div key={item.name} className="rounded-lg border border-border p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.billing}</p>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {item.includes.map((feature) => (
                        <p key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-emerald-700" />
                          {feature}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
