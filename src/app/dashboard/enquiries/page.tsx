"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Trash2, 
  CheckCircle, 
  MessageSquare, 
  Filter, 
  FilePlus2, 
  Loader2, 
  ExternalLink, 
  Snowflake, 
  TreePine, 
  Search,
  Building2,
  Calendar,
  Sparkles,
  ChevronDown
} from "lucide-react"
import { toast } from "sonner"

import DashboardLayout from "@/components/dashboard-layout"
import { formatCurrency } from "@/lib/business-data"
import { cn } from "@/lib/utils"
import { 
  customerApi, 
  serviceApi, 
  getApiErrorMessage, 
  type Customer, 
  type ServiceOffering 
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EnquiriesPage() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [enquiries, setEnquiries] = React.useState<Customer[]>([])
  const [services, setServices] = React.useState<ServiceOffering[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [convertingId, setConvertingId] = React.useState<string | null>(null)
  
  // Filtering States
  const [businessFilter, setBusinessFilter] = React.useState<"All" | "Frozen Solution" | "Primecut Services">("All")
  const [serviceFilter, setServiceFilter] = React.useState<string>("All")

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [allCustomers, allServices] = await Promise.all([
        customerApi.getCustomers(),
        serviceApi.getServices()
      ])
      
      // Filter out only enquiries (status === "New lead")
      const onlyEnquiries = allCustomers.filter(c => c.status === "New lead")
      setEnquiries(onlyEnquiries)
      setServices(allServices)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load enquiries data"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Conversion handler
  const handleConvert = async (enquiry: Customer) => {
    setConvertingId(enquiry.id)
    try {
      await customerApi.updateCustomer(enquiry.id, { status: "Active" })
      setEnquiries((current) => current.filter((item) => item.id !== enquiry.id))
      toast.success(`${enquiry.name} has been successfully converted to an Active Customer!`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to convert enquiry"))
    } finally {
      setConvertingId(null)
    }
  }

  // Deletion handler
  const handleDelete = async (enquiry: Customer) => {
    if (!window.confirm(`Are you sure you want to delete the enquiry from ${enquiry.name}?`)) return
    setDeletingId(enquiry.id)
    try {
      await customerApi.deleteCustomer(enquiry.id)
      setEnquiries((current) => current.filter((item) => item.id !== enquiry.id))
      toast.success("Enquiry deleted successfully")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete enquiry"))
    } finally {
      setDeletingId(null)
    }
  }

  // Helper: Format relative time
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Some time ago"
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  }

  // Helper: Get Initials & Colors for Avatar
  const getAvatarProps = (name: string) => {
    const initials = name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"

    const colorPairs = [
      "from-blue-500 to-indigo-600 text-white",
      "from-emerald-400 to-teal-600 text-white",
      "from-purple-500 to-pink-600 text-white",
      "from-amber-400 to-orange-600 text-white",
      "from-sky-400 to-blue-600 text-white",
      "from-rose-500 to-red-600 text-white",
    ]
    
    // Simple deterministic hash
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colorClass = colorPairs[Math.abs(hash) % colorPairs.length]

    return { initials, colorClass }
  }

  // Clean Enquiry Message (extract from lastService if prefix matches)
  const extractMessage = (lastServiceStr?: string) => {
    if (!lastServiceStr) return ""
    if (lastServiceStr.startsWith("Enquiry: ")) {
      return lastServiceStr.replace("Enquiry: ", "")
    }
    if (lastServiceStr === "Enquiry submitted from customer landing page") {
      return ""
    }
    return lastServiceStr
  }

  // Filtered Services to populate the Service dropdown based on selected business
  const filteredServicesDropdownOptions = React.useMemo(() => {
    if (businessFilter === "All") return services
    return services.filter(s => s.business === businessFilter)
  }, [services, businessFilter])

  // Reset service filter if it's no longer present in the business' services
  React.useEffect(() => {
    if (serviceFilter !== "All") {
      const exists = filteredServicesDropdownOptions.some(s => s.id === serviceFilter || s.name === serviceFilter)
      if (!exists) setServiceFilter("All")
    }
  }, [businessFilter, filteredServicesDropdownOptions, serviceFilter])

  // Filter and Search logic
  const filteredEnquiries = React.useMemo(() => {
    return enquiries.filter((item) => {
      // 1. Text Search Filter
      const searchStr = `${item.name} ${item.email} ${item.phone} ${item.address} ${item.plan}`.toLowerCase()
      const matchesSearch = searchStr.includes(query.toLowerCase().trim())

      // 2. Business Filter
      let matchesBusiness = true
      if (businessFilter !== "All") {
        matchesBusiness = item.business.includes(businessFilter)
      }

      // 3. Service Filter
      let matchesService = true
      if (serviceFilter !== "All") {
        if (item.serviceIds && item.serviceIds.length > 0) {
          // If we have serviceIds, check if the filtered service ID is present
          matchesService = item.serviceIds.includes(serviceFilter)
        } else {
          // Fallback to name search in comma-separated plan text
          matchesService = item.plan.toLowerCase().includes(serviceFilter.toLowerCase())
        }
      }

      return matchesSearch && matchesBusiness && matchesService
    })
  }, [enquiries, query, businessFilter, serviceFilter])

  // Calculate Metrics based on all enquiries (pre-filter)
  const metrics = React.useMemo(() => {
    let total = enquiries.length
    let snowInterest = 0
    let lawnInterest = 0

    enquiries.forEach((item) => {
      const combinedPlan = item.plan.toLowerCase()
      const combinedBus = item.business.toLowerCase()
      
      const isSnow = combinedPlan.includes("snow") || 
                     combinedPlan.includes("shoveling") || 
                     combinedPlan.includes("salting") || 
                     combinedPlan.includes("plowing") || 
                     combinedPlan.includes("blowing") ||
                     combinedBus.includes("frozen")
                     
      const isLawn = combinedPlan.includes("lawn") || 
                     combinedPlan.includes("mowing") || 
                     combinedPlan.includes("edging") || 
                     combinedPlan.includes("cleanup") || 
                     combinedPlan.includes("weed") ||
                     combinedBus.includes("primecut")

      if (isSnow) snowInterest++
      if (isLawn) lawnInterest++
    })

    return { total, snowInterest, lawnInterest }
  }, [enquiries])

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-400">
              <Sparkles className="size-3.5" />
              Real-time Inbound Leads
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Enquiries</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review, filter, and convert public consultation requests into paying customers.
            </p>
          </div>
        </div>

        {/* Metrics Ribbon */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Mail className="size-16" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">New Enquiries</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">{metrics.total}</p>
            <p className="mt-2 text-xs text-muted-foreground">Awaiting response or service assignment</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-sky-500/10 bg-sky-500/[0.02] p-6 shadow-sm dark:border-sky-500/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-sky-500">
              <Snowflake className="size-16" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">Snow Removal Interest</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-sky-700 dark:text-sky-300">{metrics.snowInterest}</p>
            <p className="mt-2 text-xs text-muted-foreground">Frozen Solution seasonal leads</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-6 shadow-sm dark:border-emerald-500/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
              <TreePine className="size-16" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Lawn Mowing Interest</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300">{metrics.lawnInterest}</p>
            <p className="mt-2 text-xs text-muted-foreground">Primecut Services lawn care leads</p>
          </div>
        </div>

        {/* Filter and Search Section */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={query} 
                onChange={(event) => setQuery(event.target.value)} 
                placeholder="Search by lead name, email, phone, location or plan..." 
                className="h-10 pl-10" 
              />
            </div>

            {/* Quick Filters Indicator */}
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="size-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase">Filter Panel</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-3 border-t border-border/50">
            {/* Business Toggle Buttons */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/30 w-fit">
              <button
                type="button"
                onClick={() => setBusinessFilter("All")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                  businessFilter === "All"
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Companies
              </button>
              <button
                type="button"
                onClick={() => setBusinessFilter("Frozen Solution")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5",
                  businessFilter === "Frozen Solution"
                    ? "bg-sky-500/10 text-sky-700 border border-sky-500/20 dark:text-sky-300 dark:bg-sky-500/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Snowflake className="size-3.5" />
                Frozen Solution
              </button>
              <button
                type="button"
                onClick={() => setBusinessFilter("Primecut Services")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5",
                  businessFilter === "Primecut Services"
                    ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:text-emerald-300 dark:bg-emerald-500/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TreePine className="size-3.5" />
                Primecut Services
              </button>
            </div>

            {/* Specific Service Dropdown */}
            <div className="flex-1 md:max-w-xs flex gap-2 items-center">
              <Label htmlFor="service-select" className="text-xs font-semibold text-muted-foreground uppercase shrink-0">Service:</Label>
              <select
                id="service-select"
                value={serviceFilter}
                onChange={(event) => setServiceFilter(event.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all cursor-pointer"
              >
                <option value="All">All Services</option>
                {filteredServicesDropdownOptions.map((service) => (
                  <option key={service.id} value={service.id || service.name}>
                    {service.business === "Frozen Solution" ? "❄️" : "🌱"} {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Loading active enquiries...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {filteredEnquiries.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Mail className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No enquiries found</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  {enquiries.length === 0
                    ? "Fantastic! All public enquiries are cleared, processed or converted."
                    : "No enquiries match your search query or company filters. Try adjusting them."}
                </p>
                {enquiries.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => {
                      setQuery("")
                      setBusinessFilter("All")
                      setServiceFilter("All")
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              /* Enquiry Grid List */
              <div className="grid gap-5 md:grid-cols-2">
                {filteredEnquiries.map((enquiry) => {
                  const { initials, colorClass } = getAvatarProps(enquiry.name)
                  const message = extractMessage(enquiry.lastService)
                  
                  // Look up service objects if serviceIds are present
                  const matchedServices = (enquiry.serviceIds || [])
                    .map(id => services.find(s => s.id === id))
                    .filter(Boolean) as ServiceOffering[]

                  return (
                    <article 
                      key={enquiry.id} 
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 relative hover:-translate-y-0.5"
                    >
                      {/* Card Content */}
                      <div className="p-5 md:p-6">
                        
                        {/* Header Area */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className={cn("size-10 rounded-xl bg-gradient-to-br flex items-center justify-center font-bold text-sm shadow-sm shrink-0", colorClass)}>
                              {initials}
                            </div>
                            <div>
                              <h3 className="font-semibold text-base tracking-tight leading-snug group-hover:text-primary transition-colors">
                                {enquiry.name}
                              </h3>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <Clock className="size-3" />
                                <span>{formatTimeAgo(enquiry.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Mail/Phone Buttons */}
                          <div className="flex items-center gap-1.5">
                            <a 
                              href={`mailto:${enquiry.email}`}
                              className="size-8 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title={`Email ${enquiry.name}`}
                            >
                              <Mail className="size-4" />
                            </a>
                            <a 
                              href={`tel:${enquiry.phone.replace(/\s/g, "")}`}
                              className="size-8 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title={`Call ${enquiry.name}`}
                            >
                              <Phone className="size-4" />
                            </a>
                          </div>
                        </div>

                        {/* Customer Contact list */}
                        <div className="mt-4 space-y-2.5 text-sm border-y border-border/50 py-3.5 my-3.5">
                          <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Mail className="size-4 text-muted-foreground/60 shrink-0" />
                            <span className="truncate text-foreground font-medium">{enquiry.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Phone className="size-4 text-muted-foreground/60 shrink-0" />
                            <span className="text-foreground font-medium">{enquiry.phone}</span>
                          </div>

                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <MapPin className="size-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                            <span className="text-foreground font-medium leading-normal">{enquiry.address}</span>
                          </div>
                        </div>

                        {/* Selected Services Badges */}
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Requested Services</Label>
                          <div className="flex flex-wrap gap-1.5">
                            {matchedServices.length > 0 ? (
                              matchedServices.map((srv) => {
                                const isWinter = srv.business === "Frozen Solution"
                                return (
                                  <div
                                    key={srv.id}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border shadow-sm",
                                      isWinter
                                        ? "bg-sky-500/5 text-sky-700 border-sky-500/20 dark:text-sky-300 dark:bg-sky-500/10"
                                        : "bg-emerald-500/5 text-emerald-700 border-emerald-500/20 dark:text-emerald-300 dark:bg-emerald-500/10"
                                    )}
                                  >
                                    {isWinter ? <Snowflake className="size-3" /> : <TreePine className="size-3" />}
                                    <span>{srv.name}</span>
                                    <span className="opacity-40 font-normal">|</span>
                                    <span className="font-bold">{formatCurrency(srv.price)}</span>
                                  </div>
                                )
                              })
                            ) : (
                              // Fallback if no direct serviceId match exists (legacy plain plans)
                              enquiry.plan.split(", ").map((item, idx) => {
                                const isWinter = enquiry.business.includes("Frozen Solution")
                                return (
                                  <div
                                    key={`${item}-${idx}`}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border shadow-sm",
                                      isWinter
                                        ? "bg-sky-500/5 text-sky-700 border-sky-500/20 dark:text-sky-300 dark:bg-sky-500/10"
                                        : "bg-emerald-500/5 text-emerald-700 border-emerald-500/20 dark:text-emerald-300 dark:bg-emerald-500/10"
                                    )}
                                  >
                                    {isWinter ? <Snowflake className="size-3" /> : <TreePine className="size-3" />}
                                    <span>{item}</span>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </div>

                        {/* Customer message quote block */}
                        {message && (
                          <div className="mt-4 rounded-xl border border-border/80 bg-muted/30 p-3.5 relative overflow-hidden">
                            <MessageSquare className="size-10 absolute -right-2 -bottom-2 opacity-5 text-muted-foreground shrink-0 pointer-events-none" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Customer Note</p>
                            <p className="text-xs text-foreground italic leading-relaxed font-medium">
                              "{message}"
                            </p>
                          </div>
                        )}

                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex border-t border-border bg-muted/20 p-4 gap-2.5 shrink-0">
                        {/* Convert to Customer Button */}
                        <Button 
                          onClick={() => handleConvert(enquiry)}
                          disabled={convertingId === enquiry.id}
                          className="flex-1 gap-1.5 h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {convertingId === enquiry.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="size-3.5" />
                          )}
                          Convert
                        </Button>

                        {/* Create Invoice Button */}
                        {(() => {
                          const firstServiceId = enquiry.serviceIds?.[0] || ""
                          const invoiceUrl = `/dashboard/invoices?customerId=${enquiry.id}&serviceId=${firstServiceId}`
                          
                          return (
                            <Link href={invoiceUrl} className="flex-1">
                              <Button 
                                variant="outline"
                                className="w-full gap-1.5 h-9 text-xs font-bold bg-background text-foreground border-border hover:bg-muted"
                              >
                                <FilePlus2 className="size-3.5 text-muted-foreground" />
                                Invoice
                              </Button>
                            </Link>
                          )
                        })()}

                        {/* Delete/Reject Enquiry Button */}
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(enquiry)}
                          disabled={deletingId === enquiry.id}
                          className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border shrink-0"
                          title="Delete Enquiry"
                        >
                          {deletingId === enquiry.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                      </div>

                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}

      </div>
    </DashboardLayout>
  )
}
