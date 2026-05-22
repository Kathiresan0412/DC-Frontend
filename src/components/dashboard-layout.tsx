"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  FileText,
  Handshake,
  Receipt,
  Users, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  Activity,
  UserCircle,
  Mail
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { authApi, userApi } from "@/lib/api"

type LayoutProfile = {
  email: string
  full_name: string
  role: "admin" | "manager" | "employee"
  avatar_url?: string
}

interface SidebarItemProps {
  href: string
  icon: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
}

type MenuItem = {
  href: string
  icon: React.ElementType
  label: string
}

const SidebarItem = ({ href, icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <Link href={href} onClick={onClick}>
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary text-primary-foreground shadow-sm" 
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    )}>
      <Icon className={cn("h-5 w-5", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
      <span className="font-medium">{label}</span>
    </div>
  </Link>
)

const SidebarContent = ({
  menuItems,
  pathname,
  onItemClick,
  onLogout,
}: {
  menuItems: MenuItem[]
  pathname: string
  onItemClick?: () => void
  onLogout: () => void
}) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-4 mb-10 px-2 mt-2">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <Image src="/primozen-icon.png" alt="Primozen logo" fill className="object-contain" sizes="56px" />
      </div>
      <div className="min-w-0">
        <span className="block truncate text-lg font-bold tracking-tight">Primozen</span>
        <span className="block truncate text-xs text-muted-foreground">Snow and lawn care</span>
      </div>
    </div>

    <nav className="flex-1 space-y-2">
      {menuItems.map((item) => (
        <SidebarItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={pathname === item.href}
          onClick={onItemClick}
        />
      ))}
    </nav>

    <div className="mt-auto pt-6 border-t border-border">
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 px-4 py-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-xl"
        onClick={onLogout}
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Logout</span>
      </Button>
    </div>
  </div>
)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [profile, setProfile] = React.useState<LayoutProfile | null>(null)

  React.useEffect(() => {
    userApi.getProfile()
      .then(setProfile)
      .catch(() => {
        setProfile(null)
        router.push("/")
      })
  }, [router])

  React.useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const updatedProfile = (event as CustomEvent<LayoutProfile>).detail
      setProfile(updatedProfile)
    }

    window.addEventListener("primozen:profile-updated", handleProfileUpdated)

    return () => window.removeEventListener("primozen:profile-updated", handleProfileUpdated)
  }, [])

  const canManageFinancials = profile?.role === "admin" || profile?.role === "manager"

  const menuItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/enquiries", icon: Mail, label: "Enquiries" },
    { href: "/dashboard/customers", icon: Users, label: "Customers" },
    { href: "/dashboard/services", icon: Handshake, label: "Services" },
    ...(canManageFinancials ? [
      { href: "/dashboard/invoices", icon: FileText, label: "Invoices" },
      { href: "/dashboard/payments", icon: Receipt, label: "Payments" },
    ] : []),
    { href: "/dashboard/activity", icon: Activity, label: "Activity Log" },
    ...(profile?.role === "admin" ? [{ href: "/dashboard/users", icon: Users, label: "Users" }] : []),
    { href: "/dashboard/profile", icon: UserCircle, label: "Profile" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  const initials = (profile?.full_name || profile?.email || "User")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    authApi.clearSession()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border hidden lg:block transition-all duration-300">
        <div className="h-full p-6">
          <SidebarContent menuItems={menuItems} pathname={pathname} onLogout={handleLogout} />
        </div>
      </aside>

      <main className="lg:pl-72 transition-all duration-300 min-h-screen flex flex-col">
        <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 lg:hidden">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-card border-border p-6">
                <SidebarContent
                  menuItems={menuItems}
                  pathname={pathname}
                  onItemClick={() => setIsMobileOpen(false)}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>
            <div className="text-sm font-medium text-muted-foreground hidden lg:block">
              Operations / <span className="text-foreground capitalize">{pathname.split('/').pop() || 'Overview'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </Button>
            
            <Link
              href="/dashboard/profile"
              aria-label="Open profile"
              title={profile?.full_name ? `Open ${profile.full_name}'s profile` : "Open profile"}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full outline-none transition-transform hover:scale-105 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95"
            >
              <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-tr from-primary to-primary/60 border-2 border-border flex items-center justify-center font-bold text-sm text-primary-foreground shadow-sm">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
