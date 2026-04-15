"use client"

import { LoginForm } from "@/components/login-form"
import { Package } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthenticationPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background transition-colors duration-500">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-3xl animate-pulse [animation-delay:4s]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.05] dark:opacity-[0.1]" />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              InvenTrack
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Inventory Management System
            </p>
          </div>
        </div>

        {/* Glass Card */}
        <div className="rounded-2xl border border-border bg-card/50 p-6 md:p-8 shadow-2xl shadow-black/5 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your account
            </p>
          </div>
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; 2026 InvenTrack. Secure & Private.
        </p>
      </div>
    </div>
  )
}
