"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Copy, CreditCard, FilePlus2, Link2, Loader2, Mail, Search, Send } from "lucide-react"
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
    if (!selectedService) return
    setAmount(selectedService.price)
  }, [selectedService])

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedCustomerId || !selectedServiceId) {
      toast.error("Select a customer and service")
      return
    }

    setIsCreating(true)

    try {
      const createdInvoice = await invoiceApi.createInvoice({
        customerId: selectedCustomerId,
        serviceId: selectedServiceId,
        due,
        amount,
        paid,
        status: "Draft",
      })

      setInvoices((current) => [createdInvoice, ...current])
      toast.success("Invoice created")
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

        <form onSubmit={handleCreate} className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm lg:grid-cols-[1.2fr_1.2fr_.7fr_.7fr_.7fr_auto] lg:items-end">
          <div className="grid gap-2">
            <Label htmlFor="invoice-customer">Customer</Label>
            <select
              id="invoice-customer"
              value={selectedCustomerId}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              required
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name} - {customer.email}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="invoice-service">Service</Label>
            <select
              id="invoice-service"
              value={selectedServiceId}
              onChange={(event) => setSelectedServiceId(event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              required
            >
              <option value="">Select service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.business} - {service.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="invoice-due">Due date</Label>
            <Input id="invoice-due" type="date" value={due} onChange={(event) => setDue(event.target.value)} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="invoice-amount">Price</Label>
            <Input id="invoice-amount" type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required />
          </div>

          {/* <div className="grid gap-2">
            <Label htmlFor="invoice-paid">Paid</Label>
            <Input id="invoice-paid" type="number" min="0" step="0.01" value={paid} onChange={(event) => setPaid(Number(event.target.value))} required />
          </div> */}

          <Button type="submit" disabled={isCreating || isLoading} className="gap-2">
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
            Generate
          </Button>
        </form>

        {(selectedCustomer || selectedService) && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p className="font-medium">{selectedCustomer?.name || "No customer selected"} {selectedService ? `- ${selectedService.name}` : ""}</p>
            <p className="mt-1 text-muted-foreground">
              {selectedCustomer?.email || "Select a customer email"} - Total {formatCurrency(amount || 0)} - Receivable {formatCurrency(Math.max(amount - paid, 0))}
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
                          href={`/agreements/${invoice.invoice_id}`}
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
