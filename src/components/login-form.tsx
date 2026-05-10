"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { toast } from "sonner"
import { authApi, getApiErrorMessage } from "@/lib/api"
import { useRouter } from "next/navigation"

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [fullName, setFullName] = React.useState("")
  const [setupMode, setSetupMode] = React.useState(false)
  const router = useRouter()

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const data = await authApi.login({
        email,
        password,
      })

      authApi.setSession(data.token)
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Login failed")
      console.error("Login failed:", message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function onBootstrap(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const data = await authApi.bootstrap({
        email,
        password,
        full_name: fullName,
      })

      authApi.setSession(data.token)
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Admin setup failed")
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-5", className)} {...props}>
      <form onSubmit={setupMode ? onBootstrap : onSubmit}>
        <div className="grid gap-4">
          {setupMode && (
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="Admin User"
                disabled={isLoading}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                placeholder="name@company.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-border bg-background pl-10 text-foreground placeholder:text-muted-foreground focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-border bg-background pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all duration-300 mt-2"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {setupMode ? "Create Admin" : "Sign In"}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Admin creates your account
          </span>
        </div>
      </div>
      {/* <p className="text-center text-xs leading-5 text-muted-foreground">
        {setupMode ? "Only works while the users collection is empty." : "Use the email and temporary password provided by an administrator."}
      </p> */}
      {/* <Button
        type="button"
        variant="ghost"
        disabled={isLoading}
        onClick={() => setSetupMode(!setupMode)}
        className="h-9 text-xs text-muted-foreground"
      >
        {setupMode ? "Back to sign in" : "First setup? Create admin"}
      </Button> */}
    </div>
  )
}
