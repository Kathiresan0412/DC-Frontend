"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { 
  ShieldAlert,
  ShieldCheck,
  User,
  MoreVertical,
  Loader2
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
import { userApi, type CreateUserPayload } from "@/lib/api"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AppRole = "admin" | "manager" | "employee"
type UserStatus = "active" | "inactive"

type TeamMember = {
  id: string
  full_name: string
  email?: string
  role: AppRole
  status: UserStatus
  created_at: string
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response
    if (response?.data?.error) return response.data.error
  }

  return error instanceof Error ? error.message : fallback
}

const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
}

const RoleBadge = ({ role }: { role: AppRole }) => {
  const styles: Record<AppRole, string> = {
    admin: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    manager: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    employee: "bg-muted text-muted-foreground border-border",
  }
  const icons: Record<AppRole, React.ReactNode> = {
    admin: <ShieldAlert className="h-3 w-3" />,
    manager: <ShieldCheck className="h-3 w-3" />,
    employee: <User className="h-3 w-3" />,
  }

  return (
    <span className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-semibold whitespace-nowrap", styles[role])}>
      {icons[role]}
      {roleLabels[role]}
    </span>
  )
}

export default function UsersPage() {
  const [users, setUsers] = React.useState<TeamMember[]>([])
  const [profile, setProfile] = React.useState<{ role: AppRole } | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true)

    try {
      const currentProfile = await userApi.getProfile()
      setProfile(currentProfile)

      if (currentProfile.role === "admin") {
        setUsers(await userApi.getUsers())
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load users"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleInvite = async (newMember: CreateUserPayload) => {
    const createdUser = await userApi.createUser(newMember)
    setUsers([createdUser, ...users])
    toast.success("User created successfully")
  }

  const handleStatusChange = async (member: TeamMember) => {
    const nextStatus = member.status === "active" ? "inactive" : "active"
    const updatedUser = await userApi.updateUser(member.id, { status: nextStatus })
    setUsers(users.map((user) => user.id === member.id ? { ...user, ...updatedUser } : user))
    toast.success(`User marked ${nextStatus}`)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Team & Roles</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage login users and permissions.</p>
          </div>
          {profile?.role === "admin" && <InviteMemberModal onInvite={handleInvite} />}
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
                <h3 className="font-bold text-muted-foreground">Employee</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">View inventory and perform stock updates for existing items.</p>
           </div>
        </div>

        {profile && profile.role !== "admin" && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Only administrators can create and manage login users.
          </div>
        )}

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
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                      <div className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && users.length === 0 && profile?.role === "admin" && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
                {users.map((member) => (
                  <TableRow key={member.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary shrink-0">
                          {(member.full_name || member.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium text-sm truncate">{member.full_name || "Unnamed user"}</p>
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
                        member.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {member.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs hidden sm:table-cell whitespace-nowrap">
                      {new Date(member.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => handleStatusChange(member)}>
                            Mark {member.status === "active" ? "inactive" : "active"}
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
