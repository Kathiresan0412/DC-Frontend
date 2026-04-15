"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { 
  ShieldAlert,
  ShieldCheck,
  User,
  MoreVertical
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
import { cn } from "@/lib/utils"
import { InviteMemberModal } from "@/components/invite-member-modal"

const initialUsers = [
  { id: 1, name: "Admin User", email: "admin@electra.com", role: "Admin", status: "Active", joined: "Jan 12, 2024" },
  { id: 2, name: "Sarah Manager", email: "s.manager@electra.com", role: "Manager", status: "Active", joined: "Feb 05, 2024" },
  { id: 3, name: "John Staff", email: "j.field@electra.com", role: "Staff", status: "Active", joined: "Mar 10, 2024" },
  { id: 4, name: "Mike Lead", email: "m.lead@electra.com", role: "Manager", status: "Inactive", joined: "Jan 20, 2024" },
]

const RoleBadge = ({ role }: { role: string }) => {
  const styles: any = {
    Admin: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    Manager: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Staff: "bg-muted text-muted-foreground border-border",
  }
  const icons: any = {
    Admin: <ShieldAlert className="h-3 w-3" />,
    Manager: <ShieldCheck className="h-3 w-3" />,
    Staff: <User className="h-3 w-3" />,
  }

  return (
    <span className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-semibold whitespace-nowrap", styles[role])}>
      {icons[role]}
      {role}
    </span>
  )
}

export default function UsersPage() {
  const [users, setUsers] = React.useState(initialUsers)

  const handleInvite = (newMember: any) => {
    setUsers([{ id: Date.now(), ...newMember }, ...users])
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Team & Roles</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage your electrical crew and permissions.</p>
          </div>
          <InviteMemberModal onInvite={handleInvite} />
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
           <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 shrink-0">
                   <ShieldAlert className="h-5 w-5 text-indigo-500" />
                </div>
                <h3 className="font-bold">Admin</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Full system control, user management, and configuration access.</p>
           </div>
           <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
                   <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="font-bold">Manager</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Manage inventory, categories, and view all operational reports.</p>
           </div>
           <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-muted shrink-0">
                   <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-muted-foreground">Staff</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">View inventory and perform stock updates for existing items.</p>
           </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold whitespace-nowrap">Member</TableHead>
                  <TableHead className="text-muted-foreground font-bold whitespace-nowrap">Role</TableHead>
                  <TableHead className="text-muted-foreground font-bold whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-muted-foreground font-bold whitespace-nowrap hidden sm:table-cell">Joined Date</TableHead>
                  <TableHead className="text-right text-muted-foreground font-bold whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((member) => (
                  <TableRow key={member.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium text-sm truncate">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={member.role} />
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        member.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {member.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs hidden sm:table-cell whitespace-nowrap">{member.joined}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
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
