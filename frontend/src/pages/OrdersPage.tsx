import { Link } from "react-router-dom";

import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/utils";

export function OrdersPage() {
  const { data: orders, isLoading } = useOrders();

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Your orders</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/30 py-16">
          <p className="text-muted-foreground">No orders yet.</p>
          <Button asChild>
            <Link to="/products">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.order_number}</TableCell>
                  <TableCell>{formatDate(o.created_at)}</TableCell>
                  <TableCell>{o.item_count}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(o.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/orders/${o.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
