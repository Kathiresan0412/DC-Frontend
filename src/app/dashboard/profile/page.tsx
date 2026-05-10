"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { 
  Camera,
  Mail, 
  Phone, 
  Shield,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { ChangePasswordModal } from "@/components/change-password-modal"
import { userApi } from "@/lib/api"
import { toast } from "sonner"

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response
    if (response?.data?.error) return response.data.error
  }

  return error instanceof Error ? error.message : fallback
}

type Profile = {
  id: string
  email: string
  full_name: string
  role: "admin" | "manager" | "employee"
  status: "active" | "inactive"
  phone?: string
  bio?: string
  avatar_url?: string
}

const roleLabels: Record<Profile["role"], string> = {
  admin: "Administrator",
  manager: "Manager",
  employee: "Employee",
}

export default function ProfilePage() {
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [form, setForm] = React.useState({ full_name: "", phone: "", bio: "", avatar_url: "" })
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const data = await userApi.getProfile()
        setProfile(data)
        setForm({
          full_name: data.full_name || "",
          phone: data.phone || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        })
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load profile"))
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const initials = (form.full_name || profile?.email || "User")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const updatedProfile = await userApi.updateProfile(form)
      setProfile(updatedProfile)
      setForm({
        full_name: updatedProfile.full_name || "",
        phone: updatedProfile.phone || "",
        bio: updatedProfile.bio || "",
        avatar_url: updatedProfile.avatar_url || "",
      })
      window.dispatchEvent(new CustomEvent("primozen:profile-updated", { detail: updatedProfile }))
      toast.success("Profile updated successfully")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update profile"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      event.target.value = ""
      return
    }

    if (file.size > 1_000_000) {
      toast.error("Profile image must be under 1MB")
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((currentForm) => ({ ...currentForm, avatar_url: reader.result as string }))
      }
    }
    reader.onerror = () => toast.error("Failed to read image")
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => {
    setForm((currentForm) => ({ ...currentForm, avatar_url: "" }))

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your personal information and security.</p>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="pt-8 flex flex-col items-center">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <h2 className="mt-4 text-xl font-bold">{form.full_name || "Your name"}</h2>
                <div className="flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider">
                  <Shield className="h-3 w-3" />
                  {profile ? roleLabels[profile.role] : "Loading"}
                </div>
                <div className="mt-6 w-full space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{profile?.email || "Loading..."}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{form.phone || "No phone number"}</span>
                  </div>
                </div>
                <div className="mt-6 flex w-full flex-col gap-2 border-t border-border pt-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={handleAvatarChange}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 border-border h-11 rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Camera className="h-4 w-4" />
                    Choose Profile Image
                  </Button>
                  {form.avatar_url && (
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full gap-2 h-11 rounded-xl"
                      onClick={removeAvatar}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Image
                    </Button>
                  )}
                  <Button
                    type="submit"
                    form="profile-form"
                    disabled={isSaving || isLoading}
                    className="w-full gap-2 h-11 rounded-xl shadow-lg shadow-primary/20 bg-primary"
                  >
                    {isSaving ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ChangePasswordModal />
          </div>

          {/* Right Column - Details Form */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile details below.</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={form.full_name}
                        disabled={isLoading}
                        onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                        className="bg-muted/30 border-border h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-muted/30 border-border h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      disabled={isLoading}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      className="bg-muted/30 border-border h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / Notes</Label>
                    <textarea 
                      id="bio"
                      value={form.bio}
                      disabled={isLoading}
                      onChange={(event) => setForm({ ...form, bio: event.target.value })}
                      className="flex min-h-[100px] w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      placeholder="Short bio about yourself..."
                    />
                  </div>
                  <div className="pt-4">
                    <Button type="submit" disabled={isSaving || isLoading} className="w-full sm:w-auto px-10 h-11 rounded-xl shadow-lg shadow-primary/20 bg-primary">
                      {isSaving ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
