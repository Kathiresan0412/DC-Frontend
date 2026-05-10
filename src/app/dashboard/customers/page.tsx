"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { formatCurrency } from "@/lib/business-data"
import { customerApi, getApiErrorMessage, type Customer, type CustomerPayload, type CustomerStatus } from "@/lib/api"
import { VoiceInputButton } from "@/components/voice-input-button"
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
import { Edit2, Loader2, Mail, MapPin, MoreVertical, Phone, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

const customerStatuses: CustomerStatus[] = ["Active", "Due", "New lead"]

const emptyCustomer: CustomerPayload = {
  name: "",
  email: "",
  phone: "",
  address: "",
  business: "",
  plan: "",
  status: "Active",
  balance: 0,
  lastService: "",
}

const statusClasses: Record<CustomerStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Due: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "New lead": "bg-sky-500/10 text-sky-700 dark:text-sky-300",
}

const customerVoiceAliases = {
  name: ["customer name", "name"],
  email: ["customer email", "email address", "email", "e mail", "mail"],
  phone: ["phone", "mobile", "number"],
  address: ["address", "location"],
  business: ["business", "company"],
  plan: ["plan", "service", "package"],
  status: ["status"],
  balance: ["balance", "receivable", "amount due"],
  lastService: ["last service", "last visit"],
} satisfies Record<keyof CustomerPayload, string[]>

const voiceLabels = Object.values(customerVoiceAliases).flat().sort((a, b) => b.length - a.length)
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const getVoiceField = (transcript: string, aliases: string[]) => {
  const boundary = voiceLabels.map(escapeRegExp).join("|")
  const labels = [...aliases].sort((a, b) => b.length - a.length).map(escapeRegExp).join("|")
  const match = transcript.match(new RegExp(`(?:^|[,.;]\\s*|\\s)(${labels})\\s*(?:is|as|:)?\\s*(.*?)(?=\\s+(?:${boundary})\\s*(?:is|as|:)?|[,.;]\\s*(?:${boundary})\\s*(?:is|as|:)?|$)`, "i"))

  return match?.[2]?.trim()
}

const normalizeEmail = (value: string) => value
  .toLowerCase()
  .replace(/\s+(at|@)\s+/g, "@")
  .replace(/\s+(dot|period|point)\s+/g, ".")
  .replace(/\s+(underscore|under score)\s+/g, "_")
  .replace(/\s+(dash|hyphen|minus)\s+/g, "-")
  .replace(/\s+(plus)\s+/g, "+")
  .replace(/\s+(gmail|yahoo|hotmail|outlook|icloud)\s+(com|ca|net|org)\b/g, "$1.$2")
  .replace(/\s+(com|ca|net|org|co|io)\b/g, ".$1")
  .replace(/\s+/g, "")

const parseCustomerVoice = (transcript: string): Partial<CustomerPayload> => {
  const updates: Partial<CustomerPayload> = {}

  for (const [field, aliases] of Object.entries(customerVoiceAliases) as [keyof CustomerPayload, string[]][]) {
    const value = getVoiceField(transcript, aliases)
    if (!value) continue

    if (field === "email") {
      updates.email = normalizeEmail(value)
    } else if (field === "balance") {
      updates.balance = Number(value.replace(/[^0-9.]/g, "")) || 0
    } else if (field === "status") {
      const normalizedStatus = customerStatuses.find((status) => value.toLowerCase().includes(status.toLowerCase()))
      if (normalizedStatus) updates.status = normalizedStatus
    } else {
      updates[field] = value as never
    }
  }

  return updates
}

function CustomerFormDialog({
  customer,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSave,
}: {
  customer?: Customer
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave: (payload: CustomerPayload, id?: string) => Promise<void>
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [form, setForm] = React.useState<CustomerPayload>(emptyCustomer)
  const open = controlledOpen ?? internalOpen

  const setOpen = React.useCallback((nextOpen: boolean) => {
    onOpenChange?.(nextOpen)
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen)
    }
  }, [controlledOpen, onOpenChange])

  React.useEffect(() => {
    if (!open) return

    setForm(customer ? {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      business: customer.business,
      plan: customer.plan,
      status: customer.status,
      balance: customer.balance,
      lastService: customer.lastService,
    } : emptyCustomer)
  }, [customer, open])

  const updateField = <Key extends keyof CustomerPayload>(field: Key, value: CustomerPayload[Key]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleVoiceTranscript = (transcript: string) => {
    const updates = parseCustomerVoice(transcript)

    if (Object.keys(updates).length === 0) {
      toast.error("No customer fields found")
      return
    }

    setForm((current) => ({ ...current, ...updates }))
    toast.success("Customer form filled from voice")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      await onSave(form, customer?.id)
      setOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <DialogTitle>{customer ? "Edit customer" : "Add customer"}</DialogTitle>
              <DialogDescription>
                {customer ? "Update customer details, status, and receivable." : "Create a customer record with receivable tracking."}
              </DialogDescription>
            </div>
            <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={isSaving} className="w-fit" />
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="customer-name">Name</Label>
              <Input id="customer-name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input id="customer-email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input id="customer-phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-address">Address</Label>
              <Input id="customer-address" value={form.address} onChange={(event) => updateField("address", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-status">Status</Label>
              <select
                id="customer-status"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value as CustomerStatus)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {customerStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-balance">Receivable</Label>
              <Input id="customer-balance" type="number" min="0" step="0.01" value={form.balance} onChange={(event) => updateField("balance", Number(event.target.value))} required />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {customer ? "Save changes" : "Create customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CustomersPage() {
  const [query, setQuery] = React.useState("")
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null)

  const loadCustomers = React.useCallback(async () => {
    setIsLoading(true)

    try {
      setCustomers(await customerApi.getCustomers())
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load customers"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleSave = async (payload: CustomerPayload, id?: string) => {
    try {
      if (id) {
        const updatedCustomer = await customerApi.updateCustomer(id, payload)
        setCustomers((current) => current.map((customer) => customer.id === id ? updatedCustomer : customer))
        toast.success("Customer updated")
        return
      }

      const createdCustomer = await customerApi.createCustomer(payload)
      setCustomers((current) => [createdCustomer, ...current])
      toast.success("Customer created")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save customer"))
      throw error
    }
  }

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`Delete ${customer.name}?`)) return

    setDeletingId(customer.id)

    try {
      await customerApi.deleteCustomer(customer.id)
      setCustomers((current) => current.filter((item) => item.id !== customer.id))
      toast.success("Customer deleted")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete customer"))
    } finally {
      setDeletingId(null)
    }
  }

  const filteredCustomers = React.useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim()
    if (!normalizedQuery) return customers

    return customers.filter((customer) =>
      `${customer.name} ${customer.email} ${customer.business} ${customer.plan} ${customer.phone} ${customer.address}`.toLowerCase().includes(normalizedQuery)
    )
  }, [customers, query])

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Customers</h1>
            <p className="mt-1 text-sm text-muted-foreground">Store customer contact details, status, and receivable records.</p>
          </div>
          <CustomerFormDialog
            onSave={handleSave}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add customer
              </Button>
            }
          />
        </div>

        <CustomerFormDialog
          customer={editingCustomer || undefined}
          open={Boolean(editingCustomer)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditingCustomer(null)
          }}
          onSave={handleSave}
        />

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, email, phone, or address..." className="h-10 pl-10" />
        </div>

        {isLoading && (
          <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
            Loading customers...
          </div>
        )}

        {!isLoading && filteredCustomers.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No customers found.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredCustomers.map((customer) => (
            <section key={customer.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{customer.name}</h2>
                    <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", statusClasses[customer.status])}>{customer.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{[customer.id, customer.business].filter(Boolean).join(" • ")}</p>
                </div>
                <div className="flex items-start justify-between gap-3 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground">Receivable</p>
                    <p className={cn("text-xl font-bold", customer.balance > 0 ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300")}>{formatCurrency(customer.balance)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem onClick={() => setEditingCustomer(customer)} className="gap-2 cursor-pointer">
                        <Edit2 className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(customer)}
                        disabled={deletingId === customer.id}
                        className="gap-2 cursor-pointer text-destructive"
                      >
                        {deletingId === customer.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {customer.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {customer.phone}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {customer.address}</p>
              </div>

              {(customer.plan || customer.lastService) && (
                <div className="mt-5 rounded-md bg-muted/40 p-3">
                  {customer.plan && <p className="text-sm font-medium">{customer.plan}</p>}
                  {customer.lastService && <p className="text-xs text-muted-foreground">Last service: {customer.lastService}</p>}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
