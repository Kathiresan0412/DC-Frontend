"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Tags,
  Layers,
  Cctv,
  Zap,
  Lightbulb,
  Wrench
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const initialCategories = [
  { id: 1, name: "Wires & Cables", icon: Zap, count: 124, color: "text-indigo-500 bg-indigo-500/10" },
  { id: 2, name: "Security (CCTV)", icon: Cctv, count: 45, color: "text-rose-500 bg-rose-500/10" },
  { id: 3, name: "Switches & Sockets", icon: Layers, count: 82, color: "text-emerald-500 bg-emerald-500/10" },
  { id: 4, name: "Lighting", icon: Lightbulb, count: 56, color: "text-amber-500 bg-amber-500/10" },
  { id: 5, name: "Tools", icon: Wrench, count: 22, color: "text-sky-500 bg-sky-500/10" },
]

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground mt-1 text-sm">Organize your electrical components.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl h-11 px-6 shadow-md shadow-primary/20 shrink-0">
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search categories..." 
            className="bg-muted/30 border-border rounded-xl pl-10 h-11 focus:ring-primary/20"
          />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {initialCategories.map((cat) => (
            <Card key={cat.id} className="bg-card border-border hover:shadow-lg transition-all group overflow-hidden">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <div className={cn("p-2.5 rounded-xl", cat.color)}>
                    <cat.icon className="h-6 w-6" />
                 </div>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
               </CardHeader>
               <CardContent>
                  <CardTitle className="text-lg font-bold">{cat.name}</CardTitle>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">{cat.count} Items tracked</p>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Manage &rarr;</span>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

import { cn } from "@/lib/utils"
