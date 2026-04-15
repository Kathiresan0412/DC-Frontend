"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AddItemModal } from "@/components/add-item-modal"

const initialItems = [
  { id: 1, name: "2.5mm Twin & Earth Cable (100m)", sku: "ELEC-WRE-001", category: "Wires", stock: 15, price: "LKR 28,000", status: "In Stock" },
  { id: 2, name: "Hikvision 4MP IP Camera", sku: "ELEC-CAM-042", category: "Security", stock: 8, price: "LKR 12,500", status: "Low Stock" },
  { id: 3, name: "Orange 2-Way Wall Switch", sku: "ELEC-SWI-010", category: "Switches", stock: 120, price: "LKR 450", status: "In Stock" },
  { id: 4, name: "Philips 12W LED Bulb (Cool White)", sku: "ELEC-LGT-005", category: "Lights", stock: 45, price: "LKR 850", status: "In Stock" },
  { id: 5, name: "Digital Multimeter Pro", sku: "ELEC-TOL-001", category: "Tools", stock: 4, price: "LKR 4,200", status: "Low Stock" },
  { id: 6, name: "Cat6 Ethernet Cable (305m)", sku: "ELEC-WRE-005", category: "Wires", stock: 0, price: "LKR 35,000", status: "Out of Stock" },
]

import { inventoryApi } from "@/lib/api"

export default function InventoryPage() {
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const data = await inventoryApi.getItems()
      setItems(data)
    } catch (error) {
      console.error("Failed to fetch items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (newItem: any) => {
    try {
      const savedItem = await inventoryApi.addItem(newItem)
      setItems([savedItem[0], ...items])
    } catch (error) {
      console.error("Failed to add item:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Electrical Inventory</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage wires, cameras, and electrical supplies.</p>
          </div>
          <AddItemModal onAdd={handleAddItem} />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search equipment..."
              className="bg-background border border-border rounded-xl pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto shrink-0">
            <Button variant="outline" className="border-border hover:bg-muted gap-2 rounded-xl whitespace-nowrap">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold">Item Name</TableHead>
                  <TableHead className="text-muted-foreground font-bold hidden md:table-cell">SKU</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Category</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Qty in Stock</TableHead>
                  <TableHead className="text-muted-foreground font-bold hidden sm:table-cell">Unit Price</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                          {item.name.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="line-clamp-1">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs hidden md:table-cell">{item.sku}</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-0.5 rounded-full bg-muted text-[10px] sm:text-xs font-medium text-foreground border border-border whitespace-nowrap">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.stock}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{item.price}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          item.stock > 10 ? "bg-emerald-500" :
                            item.stock > 0 ? "bg-amber-500" : "bg-rose-500"
                        )} />
                        <span className={cn(
                          "text-[10px] sm:text-xs font-medium",
                          item.stock > 10 ? "text-emerald-500" :
                            item.stock > 0 ? "text-amber-500" : "text-rose-500"
                        )}>
                          {item.stock > 10 ? "Good Stock" : item.stock > 0 ? "Low Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Edit2 className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
