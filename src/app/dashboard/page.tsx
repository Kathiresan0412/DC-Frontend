import DashboardLayout from "@/components/dashboard-layout"
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }: any) => (
  <Card className="bg-card border-border shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={cn("p-2 rounded-lg", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center gap-1 mt-1">
        {trend === 'up' ? (
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-rose-500" />
        )}
        <span className={cn("text-xs font-medium", trend === 'up' ? "text-emerald-500" : "text-rose-500")}>
          {trendValue}
        </span>
        <span className="text-xs text-muted-foreground font-medium">vs last month</span>
      </div>
    </CardContent>
  </Card>
)

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Snapshot of your inventory performance.</p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Items" 
            value="1,284" 
            icon={Package} 
            trend="up" 
            trendValue="+12%" 
            colorClass="bg-indigo-500/10 text-indigo-500" 
          />
          <StatCard 
            title="Low Stock" 
            value="14" 
            icon={AlertTriangle} 
            trend="down" 
            trendValue="-5%" 
            colorClass="bg-amber-500/10 text-amber-500" 
          />
          <StatCard 
            title="Total Value" 
            value="$45,231" 
            icon={DollarSign} 
            trend="up" 
            trendValue="+8%" 
            colorClass="bg-emerald-500/10 text-emerald-500" 
          />
          <StatCard 
            title="Monthly Sales" 
            value="432" 
            icon={TrendingUp} 
            trend="up" 
            trendValue="+15%" 
            colorClass="bg-violet-500/10 text-violet-500" 
          />
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">New item added: MacBook Pro M3</p>
                      <p className="text-xs text-muted-foreground">2 hours ago • by Admin</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                 {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-hidden">
                       <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">Logitech G Pro Mouse</p>
                        <p className="text-xs text-muted-foreground truncate">Accessories</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-amber-500">2 left</p>
                      <p className="text-xs text-muted-foreground">Min: 10</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
