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
import { UserPlus } from "lucide-react"

export function InviteMemberModal({ onInvite }: { onInvite: (member: any) => void }) {
  const [open, setOpen] = React.useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const newMember = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      status: "Active",
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    onInvite(newMember)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger >
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl h-11 px-6 shadow-md shadow-primary/20 shrink-0">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to your electrical work crew and assign a role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="e.g. Kamal Perera" required className="bg-background border-border" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="kamal@electra.com" required className="bg-background border-border" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role & Permission</Label>
            <Select name="role" defaultValue="Staff">
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="Admin">Administrator (Full Access)</SelectItem>
                <SelectItem value="Manager">Manager (Inventory & Reports)</SelectItem>
                <SelectItem value="Staff">Field Staff (View & Stock Updates)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full bg-primary text-primary-foreground">Send Invitation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
