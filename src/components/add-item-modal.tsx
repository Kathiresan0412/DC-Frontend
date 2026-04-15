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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Plus } from "lucide-react"

export function AddItemModal({ onAdd }: { onAdd: (item: any) => void }) {
  const [open, setOpen] = React.useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const newItem = {
      name: formData.get("name"),
      quantity: formData.get("quantity"),
      category: formData.get("category"),
      sku: `ELEC-${Math.floor(Math.random() * 10000)}`,
      price: `$${(Math.random() * 100).toFixed(2)}`,
      status: "In Stock"
    }
    onAdd(newItem)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl h-11 px-6 shadow-md shadow-primary/20 shrink-0">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Add a new electrical item to your inventory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Item Name</Label>
            <Input id="name" name="name" placeholder="e.g. 2.5mm Copper Wire" required className="bg-background border-border" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" name="quantity" type="number" placeholder="0" required className="bg-background border-border" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue="Wires">
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="Wires">Wires & Cables</SelectItem>
                <SelectItem value="Security">Security Cameras (CCTV)</SelectItem>
                <SelectItem value="Lights">Lighting & Bulbs</SelectItem>
                <SelectItem value="Switches">Switches & Sockets</SelectItem>
                <SelectItem value="Tools">Electrical Tools</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full bg-primary text-primary-foreground">Save Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
