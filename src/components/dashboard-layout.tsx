"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  Search,
  UserCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarItemProps {
  href: string
  icon: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const menuItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/inventory", icon: Package, label: "Inventory" },
    { href: "/dashboard/categories", icon: Tags, label: "Categories" },
    { href: "/dashboard/users", icon: Users, label: "Team & Roles" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-10 px-2 mt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Package className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">ElectraLink</span>
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
          onClick={() => window.location.href = '/'}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border hidden lg:block transition-all duration-300">
        <div className="h-full p-6">
          <SidebarContent />
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
                <SidebarContent onItemClick={() => setIsMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="text-sm font-medium text-muted-foreground hidden lg:block">
              Inventory / <span className="text-foreground capitalize">{pathname.split('/').pop() || 'Overview'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 p-0 h-10 w-10 rounded-full">
                   <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 border-2 border-border flex items-center justify-center font-bold text-sm text-primary-foreground shadow-sm">
                    JD
                  </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Jathusan Dev</p>
                    <p className="text-xs leading-none text-muted-foreground">admin@electra.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="cursor-pointer focus:bg-accent" onClick={() => window.location.href = '/dashboard/profile'}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer focus:bg-accent" onClick={() => window.location.href = '/dashboard/settings'}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => window.location.href = '/'}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
