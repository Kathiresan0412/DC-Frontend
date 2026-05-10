"use client"

import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginForm } from "@/components/login-form"

export default function AuthenticationPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border bg-background">
            <Image src="/primozen-logo.png" alt="Primozen logo" fill className="object-cover" priority sizes="40px" />
          </div>
          <div>
            <p className="font-bold leading-tight">Primozen</p>
            <p className="text-xs text-muted-foreground">Frozen Solution + Primecut Services</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center px-4 py-10 md:px-8">
          <div className="mx-auto w-full max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business management system</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Run both service businesses from one clean dashboard.</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Manage customers, services, invoices, due bills, payments, and customer agreement links for snow removal and lawn care.
            </p>

          

            <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Sign in</h2>
              </div>
              <LoginForm />
            </div>
          </div>
        </section>

        <section className="grid grid-rows-2 border-t border-border lg:border-l lg:border-t-0">
          <div className="relative min-h-80">
            <Image src="/frozen-solution-snow.jpeg" alt="Frozen Solution snow removal service poster" fill className="object-cover object-top" priority sizes="(min-width: 1024px) 48vw, 100vw" />
          </div>
          <div className="relative min-h-80">
            <Image src="/primecut-lawn.jpeg" alt="Primecut Services lawn care poster" fill className="object-cover object-top" sizes="(min-width: 1024px) 48vw, 100vw" />
          </div>
        </section>
      </main>
    </div>
  )
}
