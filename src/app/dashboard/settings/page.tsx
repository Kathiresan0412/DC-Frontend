"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { 
  Bell, 
  Settings, 
  Globe, 
  Lock, 
  Database,
  Cloud,
  Smartphone
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure invoice, reminder, security, and backup preferences.</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
               <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                 <Bell className="h-5 w-5" />
               </div>
               <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>How you want to be alerted about due bills and customer activity.</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
               <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Due Bill Alerts</p>
                    <p className="text-xs text-muted-foreground">Notify when invoices are due or overdue.</p>
                  </div>
                  <Switch defaultChecked />
               </div>
               <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Daily Summary</p>
                    <p className="text-xs text-muted-foreground">Receive a summary of today&apos;s services and payments.</p>
                  </div>
                  <Switch />
               </div>
               <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Email Reports</p>
                    <p className="text-xs text-muted-foreground">Email monthly invoice and payment reports.</p>
                  </div>
                  <Switch defaultChecked />
               </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
               <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                 <Lock className="h-5 w-5" />
               </div>
               <div>
                  <CardTitle>System & Privacy</CardTitle>
                  <CardDescription>Security and administrative preferences.</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
               <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Auto-lock Session</p>
                    <p className="text-xs text-muted-foreground">Log out after 30 minutes of inactivity.</p>
                  </div>
                  <Switch defaultChecked />
               </div>
               <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Two-Factor Auth</p>
                    <p className="text-xs text-muted-foreground">Require 2FA for all administrative accounts.</p>
                  </div>
                  <Switch />
               </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
               <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                 <Database className="h-5 w-5" />
               </div>
               <div>
                  <CardTitle>Backup & Restore</CardTitle>
                  <CardDescription>Management of your customer, invoice, service, and payment data.</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
               <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Cloud Automatic Backups</p>
                    <p className="text-xs text-muted-foreground">Sync your database to MongoDB Atlas backups.</p>
                  </div>
                  <Switch defaultChecked />
               </div>
               <div className="mt-4 flex gap-4">
                  <button className="text-xs font-bold text-primary hover:underline">Download Backup (JSON)</button>
                  <button className="text-xs font-bold text-destructive hover:underline">Flush Audit Logs</button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
