"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Shield,
  Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { ChangePasswordModal } from "@/components/change-password-modal"

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your personal information and security.</p>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Left Column - Avatar & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="pt-8 flex flex-col items-center">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
                    JD
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-background border border-border shadow-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transform transition-all">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold">Jathusan Dev</h2>
                <div className="flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider">
                  <Shield className="h-3 w-3" />
                  Administrator
                </div>
                <div className="mt-6 w-full space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">admin@electra.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>+94 77 123 4567</span>
                  </div>
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
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Jathusan" className="bg-muted/30 border-border h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Dev" className="bg-muted/30 border-border h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="admin@electra.com" className="bg-muted/30 border-border h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+94 77 123 4567" className="bg-muted/30 border-border h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Notes</Label>
                  <textarea 
                    id="bio" 
                    className="flex min-h-[100px] w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    placeholder="Short bio about yourself..."
                  />
                </div>
                <div className="pt-4">
                  <Button className="w-full sm:w-auto px-10 h-11 rounded-xl shadow-lg shadow-primary/20 bg-primary">
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
