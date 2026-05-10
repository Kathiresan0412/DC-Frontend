"use client"

import * as React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, Eye, EyeOff } from "lucide-react"
import { authApi, getApiErrorMessage } from "@/lib/api"
import { toast } from "sonner"

export function ChangePasswordModal() {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.target as HTMLFormElement)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      await authApi.changePassword(newPassword, currentPassword)
      toast.success("Password updated successfully")
      setOpen(false)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update password"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger >
        <Button variant="outline" className="w-full gap-2 border-border h-11 rounded-xl">
          <Key className="h-4 w-4" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Update Password</DialogTitle>
          <DialogDescription>
            Enter your new password below. Ensure it is at least 6 characters long.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input 
              id="currentPassword" 
              name="currentPassword" 
              type={showPassword ? "text" : "password"} 
              placeholder="Current password" 
              required 
              autoComplete="current-password"
              className="bg-background border-border" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
                minLength={6}
                autoComplete="new-password"
                className="bg-background border-border pr-10" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              required 
              minLength={6}
              autoComplete="new-password"
              className="bg-background border-border" 
            />
          </div>
          <DialogFooter className="pt-4">
            <Button disabled={isLoading} type="submit" className="w-full bg-primary text-primary-foreground">
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
