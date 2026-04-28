import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminStats } from "@/hooks/useAdmin";
import { formatCurrency, formatDate } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Store performance at a glance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={isLoading ? "—" : formatCurrency(stats?.total_revenue ?? 0)}
          icon={DollarSign}
        />
        <StatCard label="Orders" value={isLoading ? "—" : stats?.total_orders ?? 0} icon={ShoppingBag} />
        <StatCard label="Products" value={isLoading ? "—" : stats?.total_products ?? 0} icon={Package} />
        <StatCard label="Customers" value={isLoading ? "—" : stats?.total_clients ?? 0} icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>{stats?.pending_orders ?? 0} pending</CardDescription>
        </CardHeader>
        <CardContent>
          {!stats || stats.recent_orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent_orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link to={`/admin/orders`} className="font-medium hover:underline">
                        {o.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(o.created_at)}</TableCell>
                    <TableCell>{o.item_count}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(o.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
