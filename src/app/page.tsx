"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock3, Mail, MapPin, Phone, Send, ShieldCheck, Snowflake, Sparkles, TreePine } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { businesses, formatCurrency, servicePackages } from "@/lib/business-data"
import { getApiErrorMessage, publicEnquiryApi, publicLandingApi, type PublicBusinessConfig, type ServiceOffering } from "@/lib/api"
import { cn } from "@/lib/utils"

const appNameFallback = process.env.NEXT_PUBLIC_APP_NAME || "Primozen"

const fallbackBusinesses: PublicBusinessConfig[] = businesses.map((business) => ({
  ...business,
  serviceArea: "",
}))

const fallbackServices: ServiceOffering[] = servicePackages.map((service, index) => {
  const business = fallbackBusinesses.find((item) => item.name === service.business)

  return {
    id: `fallback-${index}`,
    name: service.name,
    business: service.business,
    category: business?.service || "",
    description: "",
    price: service.price,
    billing: service.billing,
    status: "Active",
    includes: service.includes,
    trustPoints: [],
    serviceArea: business?.serviceArea || "",
    contactPhone: business?.phone || "",
    secondaryPhone: business?.secondaryPhone || "",
    email: business?.email || "",
    imageUrl: "",
    source: "Local fallback",
  }
})

const serviceImages = new Map([
  ["Frozen Solution-Silver Snow", "/service-silver-snow.png"],
  ["Frozen Solution-Gold Snow", "/service-gold-snow.png"],
  ["Frozen Solution-Snow Blowing", "/service-silver-snow.png"],
  ["Frozen Solution-Snow Shoveling", "/service-silver-snow.png"],
  ["Frozen Solution-Salting/Sanding", "/service-silver-snow.png"],
  ["Frozen Solution-Snow Plowing", "/service-gold-snow.png"],
  ["Frozen Solution-Ice Removal", "/service-gold-snow.png"],
  ["Primecut Services-Residential Lawn", "/service-residential-lawn.png"],
  ["Primecut Services-Commercial Lawn", "/service-commercial-lawn.png"],
  ["Primecut Services-Lawn Mowing", "/service-residential-lawn.png"],
  ["Primecut Services-Edging", "/service-residential-lawn.png"],
  ["Primecut Services-Lawn Cleanup", "/service-residential-lawn.png"],
  ["Primecut Services-Fertilization & Weed Control", "/service-commercial-lawn.png"],
])

const stats = [
  { value: "24/7", label: "winter response" },
  { value: "2", label: "trusted service teams" },
  { value: "GTA", label: "residential and commercial" },
]

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  serviceId: "",
  message: "",
}

export default function CustomerLandingPage() {
  const [appName, setAppName] = React.useState(appNameFallback)
  const [landingBusinesses, setLandingBusinesses] = React.useState<PublicBusinessConfig[]>(fallbackBusinesses)
  const [services, setServices] = React.useState<ServiceOffering[]>(fallbackServices)
  const [form, setForm] = React.useState(initialForm)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const businessContacts = React.useMemo(() => new Map(landingBusinesses.map((business) => [business.name, business])), [landingBusinesses])
  const selectedService = React.useMemo(() => services.find((service) => service.id === form.serviceId) || services[0], [form.serviceId, services])

  React.useEffect(() => {
    let isMounted = true

    Promise.all([publicLandingApi.getConfig(), publicLandingApi.getServices()])
      .then(([config, apiServices]) => {
        if (!isMounted) return

        setAppName(config.appName || appNameFallback)
        setLandingBusinesses(config.businesses.length ? config.businesses : fallbackBusinesses)
        setServices(apiServices.length ? apiServices : fallbackServices)
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Could not load live services. Showing saved defaults."))
      })

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    if (!form.serviceId && services[0]?.id) {
      setForm((current) => ({ ...current, serviceId: services[0].id }))
    }
  }, [form.serviceId, services])

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const getServiceImage = (service: ServiceOffering) => (
    service.imageUrl ||
    serviceImages.get(`${service.business}-${service.name}`) ||
    serviceImages.get(`${service.business}-${service.category}`) ||
    businessContacts.get(service.business)?.image ||
    "/primozen-meta-image.png"
  )

  const submitEnquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedService) {
      toast.error("Please choose a service.")
      return
    }

    setIsSubmitting(true)

    try {
      await publicEnquiryApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        business: selectedService.business,
        service: selectedService.name,
        message: form.message,
      })
      toast.success("Enquiry sent. Our team will contact you shortly.")
      setForm({ ...initialForm, serviceId: form.serviceId })
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not send enquiry. Please call or email us."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative size-10 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
              <Image src="/primozen-icon.png" alt="Primozen logo" fill className="object-contain" priority sizes="40px" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight">{appName}</span>
              <span className="block text-xs text-muted-foreground">Frozen Solution + Primecut Services</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#services" className="hover:text-foreground">Services</a>
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/admin" className={buttonVariants({ size: "sm", variant: "outline" })}>
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10 grid md:grid-cols-2">
            <div className="relative min-h-[36rem]">
              <Image src="/hero-snow-service.png" alt="Frozen Solution snow removal service" fill className="object-cover" priority sizes="50vw" />
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="relative hidden min-h-[36rem] md:block">
              <Image src="/hero-lawn-service.png" alt="Primecut Services lawn care service" fill className="object-cover" priority sizes="50vw" />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          </div>

          <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1.02fr_0.78fr]">
            <div className="max-w-3xl pt-8 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                <Sparkles className="size-3.5" />
                Snow removal and lawn care made simple
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
                Reliable property services for every season.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/86 md:text-lg">
                Book Frozen Solution for winter snow and ice control, or Primecut Services for crisp, professional lawn care.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#enquire" className={cn(buttonVariants({ size: "lg" }), "h-11 bg-white text-black hover:bg-white/90")}>
                  Get a Quote
                  <ArrowRight />
                </a>
                <a href="#services" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white")}>
                  View Services
                </a>
              </div>
            </div>

            <div className="grid gap-3 self-end pb-4 sm:grid-cols-3 lg:self-center lg:pb-0">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-white/18 bg-white/14 p-4 text-white shadow-lg backdrop-blur">
                <p className="text-2xl font-bold">{stat.label === "trusted service teams" ? landingBusinesses.length : stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-white/72">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="bg-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Our services</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Choose the service that fits your property.</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Clear pricing, dependable teams, and service details for homes, businesses, driveways, sidewalks, and outdoor spaces.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {services.map((service) => {
                const contact = businessContacts.get(service.business)
                const Icon = service.business === "Frozen Solution" ? Snowflake : TreePine
                const serviceImage = getServiceImage(service)
                const includes = service.includes.length ? service.includes : [service.description].filter(Boolean)

                return (
                  <article key={service.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                    <div className="relative aspect-[4/3]">
                      <Image src={serviceImage} alt={`${service.name} service`} fill className="object-cover" sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{service.business}</p>
                          <h3 className="mt-1 text-xl font-semibold">{service.name}</h3>
                        </div>
                        <span className="rounded-lg bg-muted p-2 text-foreground">
                          <Icon className="size-4" />
                        </span>
                      </div>
                      <p className="mt-4 text-2xl font-bold">
                        {formatCurrency(service.price)}
                        <span className="ml-2 text-sm font-medium text-muted-foreground">{service.billing}</span>
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {includes.map((item) => (
                          <li key={item} className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="size-4" />
                        <a href={`tel:${(contact?.phone || service.contactPhone).replace(/\s/g, "")}`} className="font-medium text-foreground hover:underline">{contact?.phone || service.contactPhone}</a>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="about" className="border-y border-border bg-muted/35 py-16 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">About us</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">One local team, two specialist services.</h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {appName} connects customers with Frozen Solution for snow removal and Primecut Services for lawn care. We focus on fast communication, clean work, and reliable scheduling for residential and commercial properties.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: "Trusted care", text: "Clear records, service notes, and accountable teams." },
                { icon: Clock3, title: "Season ready", text: "Winter response and warm-weather upkeep when you need it." },
                { icon: MapPin, title: "Local coverage", text: "Serving customers across the GTA and surrounding areas." },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-border bg-background p-5">
                  <item.icon className="size-5 text-foreground" />
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Ready for a quote?</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Send an enquiry and we will follow up with pricing, availability, and the right plan for your property.
              </p>
              <div className="mt-8 space-y-4">
                {landingBusinesses.map((business) => (
                  <div key={business.name} className="rounded-lg border border-border p-4">
                    <p className="font-semibold">{business.name}</p>
                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                      <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-foreground"><Phone className="size-4" /> {business.phone}</a>
                      <a href={`mailto:${business.email}`} className="flex items-center gap-2 hover:text-foreground"><Mail className="size-4" /> {business.email}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form id="enquire" onSubmit={submitEnquiry} className="rounded-lg border border-border bg-card p-5 shadow-sm md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required autoComplete="name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required autoComplete="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select value={form.serviceId} onValueChange={(value) => value && updateField("serviceId", value)}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>{service.business} - {service.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Service address</Label>
                  <Input id="address" value={form.address} onChange={(event) => updateField("address", event.target.value)} required autoComplete="street-address" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="Tell us your property size, preferred timing, or anything we should know."
                  />
                </div>
              </div>
              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-5 h-11 w-full">
                {isSubmitting ? "Sending..." : "Send Enquiry"}
                <Send />
              </Button>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} {appName}. Frozen Solution + Primecut Services.</p>
          <Link href="/admin" className="font-medium text-foreground hover:underline">Admin Login</Link>
        </div>
      </footer>
    </div>
  )
}
