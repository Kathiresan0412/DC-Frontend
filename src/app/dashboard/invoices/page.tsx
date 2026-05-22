"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Copy, CreditCard, FilePlus2, Link2, Loader2, Mail, Search, Send, Plus, Trash2, Snowflake, TreePine } from "lucide-react"
import { toast } from "sonner"

import DashboardLayout from "@/components/dashboard-layout"
import { formatCurrency } from "@/lib/business-data"
import { cn } from "@/lib/utils"
import { customerApi, getApiErrorMessage, invoiceApi, paymentApi, serviceApi, userApi, type Customer, type Invoice, type ServiceOffering } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const statusClasses: Record<string, string> = {
  Paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Confirmed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Sent: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Due: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Overdue: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Draft: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
}

const todayInputValue = () => new Date().toISOString().slice(0, 10)

export default function InvoicesPage() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [services, setServices] = React.useState<ServiceOffering[]>([])
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("")
  const [selectedServiceId, setSelectedServiceId] = React.useState("")
  const [selectedServicesList, setSelectedServicesList] = React.useState<ServiceOffering[]>([])
  const [due, setDue] = React.useState(todayInputValue())
  const [amount, setAmount] = React.useState(0)
  const paid = 0
  const [isLoading, setIsLoading] = React.useState(true)
  const [canManageFinancials, setCanManageFinancials] = React.useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = React.useState(true)
  const [isCreating, setIsCreating] = React.useState(false)
  const [paymentInvoice, setPaymentInvoice] = React.useState<Invoice | null>(null)
  const [paymentAmount, setPaymentAmount] = React.useState("")
  const [isRecordingPayment, setIsRecordingPayment] = React.useState(false)
  const [sendingInvoiceId, setSendingInvoiceId] = React.useState<string | null>(null)

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId)
  const selectedService = services.find((service) => service.id === selectedServiceId)

  const loadData = React.useCallback(async () => {
    if (!canManageFinancials) return

    setIsLoading(true)

    try {
      const [nextCustomers, nextServices, nextInvoices] = await Promise.all([
        customerApi.getCustomers(),
        serviceApi.getServices(),
        invoiceApi.getInvoices(),
      ])

      setCustomers(nextCustomers)
      setServices(nextServices)
      setInvoices(nextInvoices)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load invoices"))
    } finally {
      setIsLoading(false)
    }
  }, [canManageFinancials])

  React.useEffect(() => {
    userApi.getProfile()
      .then((profile) => {
        const hasAccess = profile.role === "admin" || profile.role === "manager"
        setCanManageFinancials(hasAccess)

        if (!hasAccess) {
          toast.error("Only admins and managers can access invoices")
          router.replace("/dashboard")
        }
      })
      .catch(() => router.replace("/"))
      .finally(() => setIsCheckingAccess(false))
  }, [router])

  React.useEffect(() => {
    if (canManageFinancials) {
      loadData()
    }
  }, [canManageFinancials, loadData])

  React.useEffect(() => {
    const sum = selectedServicesList.reduce((acc, curr) => acc + curr.price, 0)
    setAmount(sum)
  }, [selectedServicesList])

  React.useEffect(() => {
    if (typeof window !== "undefined" && customers.length > 0 && services.length > 0) {
      const params = new URLSearchParams(window.location.search)
      const customerIdParam = params.get("customerId")
      const serviceIdParam = params.get("serviceId")
      
      if (customerIdParam) {
        const foundCustomer = customers.find((c) => c.id === customerIdParam)
        if (foundCustomer) {
          setSelectedCustomerId(customerIdParam)
          
          let prefillServices: ServiceOffering[] = []
          
          if (foundCustomer.serviceIds && Array.isArray(foundCustomer.serviceIds) && foundCustomer.serviceIds.length > 0) {
            prefillServices = services.filter((s) => foundCustomer.serviceIds?.includes(s.id))
          } else if (serviceIdParam) {
            const fs = services.find((s) => s.id === serviceIdParam)
            if (fs) {
              prefillServices = [fs]
            }
          }
          
          if (prefillServices.length > 0) {
            setSelectedServicesList(prefillServices)
          }
        }
      } else if (serviceIdParam) {
        const fs = services.find((s) => s.id === serviceIdParam)
        if (fs) {
          setSelectedServicesList([fs])
        }
      }
    }
  }, [customers, services])

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedCustomerId) {
      toast.error("Please select a customer")
      return
    }

    if (selectedServicesList.length === 0) {
      toast.error("Please add at least one service to the invoice")
      return
    }

    setIsCreating(true)

    try {
      const createdInvoice = await invoiceApi.createInvoice({
        customerId: selectedCustomerId,
        serviceId: selectedServicesList[0]?.id || "",
        serviceIds: selectedServicesList.map((s) => s.id),
        due,
        amount,
        paid,
        status: "Draft",
      })

      setInvoices((current) => [createdInvoice, ...current])
      setSelectedServicesList([])
      setSelectedCustomerId("")
      setAmount(0)
      toast.success("Invoice generated successfully")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create invoice"))
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenPaymentModal = (invoice: Invoice) => {
    if (invoice.receivable <= 0) {
      toast.info("This invoice is already fully paid")
      return
    }

    setPaymentInvoice(invoice)
    setPaymentAmount(String(invoice.receivable))
  }

  const handleSendInvoice = async (invoice: Invoice) => {
    setSendingInvoiceId(invoice.id)

    try {
      const result = await invoiceApi.sendInvoice(invoice.invoice_id)

      setInvoices((current) => current.map((item) => item.id === result.invoice.id ? result.invoice : item))
      toast.success(`Invoice sent to ${invoice.email}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to send invoice email"))
    } finally {
      setSendingInvoiceId(null)
    }
  }

  const handleRecordPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!paymentInvoice) return

    const nextPaymentAmount = Number(paymentAmount)

    if (!Number.isFinite(nextPaymentAmount) || nextPaymentAmount <= 0) {
      toast.error("Enter an amount greater than 0")
      return
    }

    if (nextPaymentAmount > paymentInvoice.receivable) {
      toast.error("Payment amount cannot exceed the receivable amount")
      return
    }

    setIsRecordingPayment(true)

    try {
      const result = await paymentApi.createPayment({
        invoiceId: paymentInvoice.invoice_id,
        method: "Invoice action",
        amount: nextPaymentAmount,
        paid_at: todayInputValue(),
        notes: `Payment entered from invoice action for ${paymentInvoice.invoice_id}`,
      })

      setInvoices((current) => current.map((item) => item.id === result.invoice.id ? result.invoice : item))
      setPaymentInvoice(null)
      setPaymentAmount("")
      toast.success("Payment amount saved")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save payment amount"))
    } finally {
      setIsRecordingPayment(false)
    }
  }

  const handleCopyLink = async (invoice: Invoice) => {
    await navigator.clipboard.writeText(invoice.agreementLink)
    toast.success("Agreement link copied")
  }

  const filteredInvoices = invoices.filter((invoice) =>
    `${invoice.invoice_id} ${invoice.customer} ${invoice.business} ${invoice.service} ${invoice.status}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <DashboardLayout>
      {isCheckingAccess || !canManageFinancials ? (
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Invoices</h1>
            <p className="mt-1 text-sm text-muted-foreground">Create invoices, send agreement links, and track customer confirmation.</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="invoice-customer" className="text-xs font-semibold text-muted-foreground uppercase">Customer</Label>
              <select
                id="invoice-customer"
                value={selectedCustomerId}
                onChange={(event) => setSelectedCustomerId(event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full"
                required
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name} - {customer.email}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invoice-due" className="text-xs font-semibold text-muted-foreground uppercase">Due date</Label>
              <Input id="invoice-due" type="date" value={due} onChange={(event) => setDue(event.target.value)} required />
            </div>
          </div>

          <div className="grid gap-2 rounded-xl border border-dashed border-border p-4 bg-muted/20">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Service Items in Invoice</Label>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <div className="flex-1">
                <select
                  id="invoice-service-select"
                  value={selectedServiceId}
                  onChange={(event) => setSelectedServiceId(event.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Choose service to add...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.business} - {service.name} ({formatCurrency(service.price)})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!selectedServiceId) {
                    toast.error("Please select a service first")
                    return
                  }
                  const serviceToAdd = services.find(s => s.id === selectedServiceId)
                  if (serviceToAdd) {
                    if (selectedServicesList.some(s => s.id === serviceToAdd.id)) {
                      toast.info("Service is already in the list")
                    } else {
                      setSelectedServicesList(prev => [...prev, serviceToAdd])
                      toast.success(`Added ${serviceToAdd.name}`)
                    }
                  }
                  setSelectedServiceId("")
                }}
                className="gap-2 shrink-0 h-10 font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </div>

            {/* Selected services table */}
            <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
              <div className="min-w-full overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Service</th>
                      <th className="px-4 py-2.5">Company</th>
                      <th className="px-4 py-2.5 text-right">Price</th>
                      <th className="px-4 py-2.5 text-center w-14">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedServicesList.map((service) => (
                      <tr key={service.id} className="align-middle hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="font-semibold text-foreground">{service.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{service.description}</div>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {service.business.includes("Frozen Solution") ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                              <Snowflake className="h-3.5 w-3.5 animate-pulse text-blue-500" />
                              Frozen Solution
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                              <TreePine className="h-3.5 w-3.5 text-emerald-500" />
                              Primecut Services
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-foreground">
                          {formatCurrency(service.price)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedServicesList(prev => prev.filter(s => s.id !== service.id))
                              toast.success(`Removed ${service.name}`)
                            }}
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {selectedServicesList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-xs font-medium">
                          No services added yet. Select a service from the dropdown above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 items-end pt-2">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="invoice-amount" className="text-xs font-semibold text-muted-foreground uppercase">Invoice Total (Adjustable)</Label>
                {selectedServicesList.length > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground">
                    Subtotal: {formatCurrency(selectedServicesList.reduce((acc, curr) => acc + curr.price, 0))}
                  </span>
                )}
              </div>
              <Input
                id="invoice-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="h-10 text-base font-bold"
                required
              />
            </div>
            <Button type="submit" disabled={isCreating || isLoading} className="h-10 gap-2 w-full font-bold">
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
              Generate Invoice
            </Button>
          </div>
        </form>

        {(selectedCustomer || selectedServicesList.length > 0) && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm shadow-inner">
            <p className="font-semibold text-foreground">
              {selectedCustomer?.name || "No customer selected"}{" "}
              {selectedServicesList.length > 0
                ? `- ${selectedServicesList.map((s) => s.name).join(", ")}`
                : ""}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedCustomer?.email || "Select a customer email"} • Total {formatCurrency(amount || 0)} • Receivable {formatCurrency(Math.max(amount - paid, 0))}
            </p>
          </div>
        )}

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
                  <th className="px-4 py-3 text-right font-semibold">Receivable</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="align-middle">
                    <td className="px-4 py-4 font-semibold">{invoice.invoice_id}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{invoice.customer}</p>
                      <p className="text-xs text-muted-foreground">{invoice.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p>{invoice.service}</p>
                      <p className="text-xs text-muted-foreground">{invoice.business}</p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{invoice.due}</td>
                    <td className="px-4 py-4 text-right font-bold">{formatCurrency(invoice.receivable)}</td>
                    <td className="px-4 py-4">
                      <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", statusClasses[invoice.status])}>{invoice.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          title="Send invoice email"
                          onClick={() => handleSendInvoice(invoice)}
                          disabled={sendingInvoiceId === invoice.id}
                        >
                          {sendingInvoiceId === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon-sm" title="Record payment amount" onClick={() => handleOpenPaymentModal(invoice)}>
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        {/* <Button variant="outline" size="icon-sm" title="Copy agreement link" onClick={() => handleCopyLink(invoice)}>
                          <Copy className="h-4 w-4" />
                        </Button> */}
                        {/* <a href={`mailto:${invoice.email}?subject=${encodeURIComponent(`${invoice.business} invoice ${invoice.invoice_id}`)}&body=${encodeURIComponent(`Please review and confirm your invoice: ${invoice.agreementLink}`)}`}>
                          <Button variant="outline" size="icon-sm" title="Open email draft">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </a> */}
                        <Link
                          href={`/agreements/${invoice.invoice_id}?source=system`}
                          title="Open agreement link"
                          target="_blank"
                          className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-background text-sm transition-colors hover:bg-muted"
                        >
                          <Link2 className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No invoices found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <Dialog open={Boolean(paymentInvoice)} onOpenChange={(open) => {
          if (!open && !isRecordingPayment) {
            setPaymentInvoice(null)
            setPaymentAmount("")
          }
        }}>
          <DialogContent>
            <form onSubmit={handleRecordPayment} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>Record Payment Amount</DialogTitle>
                <DialogDescription>
                  Enter how much the customer wants to pay now. This will update the invoice paid and receivable amounts.
                </DialogDescription>
              </DialogHeader>

              {paymentInvoice && (
                <div className="grid gap-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                    <p className="font-medium">{paymentInvoice.invoice_id} - {paymentInvoice.customer}</p>
                    <p className="mt-1 text-muted-foreground">
                      Total {formatCurrency(paymentInvoice.amount)} - Paid {formatCurrency(paymentInvoice.paid)} - Receivable {formatCurrency(paymentInvoice.receivable)}
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="invoice-action-payment">Amount paying now</Label>
                    <Input
                      id="invoice-action-payment"
                      type="number"
                      min="0.01"
                      max={paymentInvoice.receivable}
                      step="0.01"
                      value={paymentAmount}
                      onChange={(event) => setPaymentAmount(event.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  if (!isRecordingPayment) {
                    setPaymentInvoice(null)
                    setPaymentAmount("")
                  }
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isRecordingPayment} className="gap-2">
                  {isRecordingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  Save Amount
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      )}
    </DashboardLayout>
  )
}
