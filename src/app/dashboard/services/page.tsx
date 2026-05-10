"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { formatCurrency } from "@/lib/business-data"
import { getApiErrorMessage, serviceApi, type ServiceOffering, type ServicePayload, type ServiceStatus } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Check, Edit2, Loader2, Mail, MoreVertical, Phone, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

const serviceStatuses: ServiceStatus[] = ["Active", "Inactive"]

const emptyService: ServicePayload = {
  name: "",
  business: "Frozen Solution",
  category: "Snow Removal",
  description: "",
  price: 0,
  billing: "Starting price",
  status: "Active",
  includes: [],
  trustPoints: [],
  serviceArea: "",
  contactPhone: "",
  secondaryPhone: "",
  email: "",
  source: "Manual entry",
}

const businessAccent: Record<string, string> = {
  "Frozen Solution": "text-sky-700 bg-sky-500/10 dark:text-sky-300",
  "Primecut Services": "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300",
}

const splitLines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean)
const joinLines = (value: string[]) => value.join("\n")

function ServiceFormDialog({
  service,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSave,
}: {
  service?: ServiceOffering
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave: (payload: ServicePayload, id?: string) => Promise<void>
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [form, setForm] = React.useState<ServicePayload>(emptyService)
  const [includesText, setIncludesText] = React.useState("")
  const [trustText, setTrustText] = React.useState("")
  const open = controlledOpen ?? internalOpen

  const setOpen = React.useCallback((nextOpen: boolean) => {
    onOpenChange?.(nextOpen)
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen)
    }
  }, [controlledOpen, onOpenChange])

  React.useEffect(() => {
    if (!open) return

    const nextForm = service ? {
      name: service.name,
      business: service.business,
      category: service.category,
      description: service.description,
      price: service.price,
      billing: service.billing,
      status: service.status,
      includes: service.includes,
      trustPoints: service.trustPoints,
      serviceArea: service.serviceArea,
      contactPhone: service.contactPhone,
      secondaryPhone: service.secondaryPhone,
      email: service.email,
      source: service.source,
    } : emptyService

    setForm(nextForm)
    setIncludesText(joinLines(nextForm.includes))
    setTrustText(joinLines(nextForm.trustPoints))
  }, [open, service])

  const updateField = <Key extends keyof ServicePayload>(field: Key, value: ServicePayload[Key]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleBusinessChange = (business: string) => {
    setForm((current) => ({
      ...current,
      business,
      category: business === "Frozen Solution" ? "Snow Removal" : "Fresh Cut Services",
      contactPhone: business === "Frozen Solution" ? "+1 647-212-3424" : "+1 647-765-0949",
      secondaryPhone: "+1 647-854-5652",
      email: business === "Frozen Solution" ? "frozensolutions92@gmail.com" : "freshcutservices92@gmail.com",
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      await onSave({
        ...form,
        includes: splitLines(includesText),
        trustPoints: splitLines(trustText),
      }, service?.id)
      setOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "Add service"}</DialogTitle>
          <DialogDescription>
            Manage pricing, flyer details, contact information, and service bullet points.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid max-h-[75vh] gap-4 overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="service-name">Service name</Label>
              <Input id="service-name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-business">Business</Label>
              <select
                id="service-business"
                value={form.business}
                onChange={(event) => handleBusinessChange(event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="Frozen Solution">Frozen Solution</option>
                <option value="Primecut Services">Primecut Services</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="service-description">Description</Label>
            <textarea
              id="service-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              required
              className="min-h-20 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="service-category">Category</Label>
              <Input id="service-category" value={form.category} onChange={(event) => updateField("category", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-price">Price</Label>
              <Input id="service-price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField("price", Number(event.target.value))} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-billing">Billing</Label>
              <Input id="service-billing" value={form.billing} onChange={(event) => updateField("billing", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-status">Status</Label>
              <select
                id="service-status"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value as ServiceStatus)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {serviceStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="service-includes">Includes</Label>
              <textarea
                id="service-includes"
                value={includesText}
                onChange={(event) => setIncludesText(event.target.value)}
                placeholder="One item per line"
                className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-trust">Trust points</Label>
              <textarea
                id="service-trust"
                value={trustText}
                onChange={(event) => setTrustText(event.target.value)}
                placeholder="One point per line"
                className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="service-area">Service area</Label>
              <Input id="service-area" value={form.serviceArea} onChange={(event) => updateField("serviceArea", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-source">Source</Label>
              <Input id="service-source" value={form.source} onChange={(event) => updateField("source", event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-phone">Phone</Label>
              <Input id="service-phone" value={form.contactPhone} onChange={(event) => updateField("contactPhone", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-secondary-phone">Second phone</Label>
              <Input id="service-secondary-phone" value={form.secondaryPhone} onChange={(event) => updateField("secondaryPhone", event.target.value)} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="service-email">Email</Label>
              <Input id="service-email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
            </div>
          </div>

          <DialogFooter className="sticky bottom-0">
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {service ? "Save changes" : "Create service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ServicesPage() {
  const [query, setQuery] = React.useState("")
  const [services, setServices] = React.useState<ServiceOffering[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [editingService, setEditingService] = React.useState<ServiceOffering | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const loadServices = React.useCallback(async () => {
    setIsLoading(true)

    try {
      setServices(await serviceApi.getServices())
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load services"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadServices()
  }, [loadServices])

  const handleSave = async (payload: ServicePayload, id?: string) => {
    try {
      if (id) {
        const updatedService = await serviceApi.updateService(id, payload)
        setServices((current) => current.map((service) => service.id === id ? updatedService : service))
        toast.success("Service updated")
        return
      }

      const createdService = await serviceApi.createService(payload)
      setServices((current) => [...current, createdService].toSorted((first, second) => `${first.business}${first.name}`.localeCompare(`${second.business}${second.name}`)))
      toast.success("Service created")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save service"))
      throw error
    }
  }

  const handleDelete = async (service: ServiceOffering) => {
    if (!window.confirm(`Delete ${service.name}?`)) return

    setDeletingId(service.id)

    try {
      await serviceApi.deleteService(service.id)
      setServices((current) => current.filter((item) => item.id !== service.id))
      toast.success("Service deleted")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete service"))
    } finally {
      setDeletingId(null)
    }
  }

  const filteredServices = React.useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim()
    if (!normalizedQuery) return services

    return services.filter((service) =>
      `${service.name} ${service.business} ${service.category} ${service.description} ${service.email}`.toLowerCase().includes(normalizedQuery)
    )
  }, [query, services])

  const groupedServices = React.useMemo(() => {
    return filteredServices.reduce<Record<string, ServiceOffering[]>>((groups, service) => {
      groups[service.business] = [...(groups[service.business] || []), service]
      return groups
    }, {})
  }, [filteredServices])

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Services & Pricing</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage flyer-seeded snow removal and lawn care services.</p>
          </div>
          <ServiceFormDialog
            onSave={handleSave}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add service
              </Button>
            }
          />
        </div>

        <ServiceFormDialog
          service={editingService || undefined}
          open={Boolean(editingService)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditingService(null)
          }}
          onSave={handleSave}
        />

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search service, business, category, or email..." className="h-10 pl-10" />
        </div>

        {isLoading && (
          <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
            Loading services...
          </div>
        )}

        {!isLoading && filteredServices.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No services found.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(groupedServices).map(([business, businessServices]) => (
            <section key={business} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", businessAccent[business] || "bg-muted text-muted-foreground")}>
                    {businessServices[0]?.category || "Services"}
                  </span>
                  <h2 className="mt-2 text-xl font-bold">{business}</h2>
                </div>
                <div className="rounded-md bg-muted px-3 py-2 text-left text-xs text-muted-foreground sm:text-right">
                  <p>{businessServices[0]?.contactPhone}</p>
                  <p>{businessServices[0]?.secondaryPhone}</p>
                  <p>{businessServices[0]?.email}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {businessServices.map((service) => (
                  <div key={service.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{service.name}</h3>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            service.status === "Active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "bg-muted text-muted-foreground"
                          )}>
                            {service.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => setEditingService(service)} className="gap-2 cursor-pointer">
                            <Edit2 className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(service)}
                            disabled={deletingId === service.id}
                            className="gap-2 cursor-pointer text-destructive"
                          >
                            {deletingId === service.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 flex flex-col gap-1 rounded-md bg-muted/40 p-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{service.billing}</p>
                        <p className="text-xs text-muted-foreground">{service.serviceArea}</p>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(service.price)}</p>
                    </div>

                    {service.includes.length > 0 && (
                      <div className="mt-4 grid gap-2">
                        {service.includes.map((feature) => (
                          <p key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-emerald-700" />
                            {feature}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                      <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {service.contactPhone}</p>
                      <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {service.email}</p>
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
